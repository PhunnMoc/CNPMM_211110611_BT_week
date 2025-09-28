const express = require("express");
const { body, validationResult, query } = require("express-validator");
const pool = require("../config/database");
const { authenticateToken } = require("../middleware/auth");
const NotificationService = require("../services/notificationService");

const router = express.Router();

// List reviews for a product with pagination
router.get(
  "/",
  [
    query("productId").isInt().withMessage("productId is required"),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const productId = parseInt(req.query.productId, 10);
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "10", 10);
    const offset = (page - 1) * limit;

    try {
      const [[{ total }]] = await pool.query(
        "SELECT COUNT(*) AS total FROM reviews WHERE product_id = ? AND is_approved = 1",
        [productId]
      );

      const [rows] = await pool.query(
        `SELECT r.id, r.rating, r.title, r.comment, r.is_verified_purchase, r.created_at,
                u.first_name, u.last_name, u.avatar_url
         FROM reviews r
         JOIN users u ON r.user_id = u.id
         WHERE r.product_id = ? AND r.is_approved = 1
         ORDER BY r.created_at DESC
         LIMIT ${limit} OFFSET ${offset}`,
        [productId]
      );

      return res.json({ reviews: rows, pagination: { page, limit, total } });
    } catch (e) {
      console.error("List reviews error:", e);
      return res
        .status(500)
        .json({ message: "Server error while fetching reviews" });
    }
  }
);

// Helper: ensure user bought this product and order delivered
async function hasDeliveredPurchase(userId, productId) {
  const [rows] = await pool.query(
    `SELECT oi.id
     FROM order_items oi
     JOIN orders o ON oi.order_id = o.id
     WHERE o.user_id = ? AND oi.product_id = ? AND o.status = 'delivered'
     LIMIT 1`,
    [userId, productId]
  );
  return rows.length > 0;
}

// Issue reward: grant points and a coupon
async function issueReviewRewards(connection, userId, productId) {
  // Points: +10 per review
  const points = 10;
  await connection.query(
    `INSERT INTO user_points (user_id, balance) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE balance = balance + VALUES(balance), updated_at = CURRENT_TIMESTAMP`,
    [userId, points]
  );
  await connection.query(
    `INSERT INTO point_transactions (user_id, points, reason, reference_type, reference_id)
     VALUES (?, ?, 'Review reward', 'review', ?)`,
    [userId, points, productId]
  );

  // Create a single-use coupon 5% off, expires in 30 days
  const [couponRes] = await connection.query(
    `INSERT INTO coupons (code, description, discount_type, discount_value, expires_at)
     VALUES (?, ?, 'percent', 5, DATE_ADD(NOW(), INTERVAL 30 DAY))`,
    [
      `RVW-${userId}-${productId}-${Date.now().toString().slice(-6)}`,
      "Reward for submitting a product review",
    ]
  );
  const couponId = couponRes.insertId;
  await connection.query(
    `INSERT INTO user_coupons (user_id, coupon_id, granted_reason) VALUES (?, ?, 'review')`,
    [userId, couponId]
  );

  return { pointsAwarded: points };
}

// Create or update a review for a product
router.post(
  "/",
  authenticateToken,
  [
    body("productId").isInt().withMessage("productId is required"),
    body("rating").isInt({ min: 1, max: 5 }),
    body("title").optional().isString(),
    body("comment").optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { productId, rating, title, comment } = req.body;

    try {
      const verified = await hasDeliveredPurchase(userId, productId);
      if (!verified) {
        return res.status(403).json({
          message: "Only verified purchasers can review this product",
        });
      }

      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        // Upsert review (one per user/product)
        await connection.query(
          `INSERT INTO reviews (user_id, product_id, rating, title, comment, is_verified_purchase)
           VALUES (?, ?, ?, ?, ?, 1)
           ON DUPLICATE KEY UPDATE rating = VALUES(rating), title = VALUES(title), comment = VALUES(comment), updated_at = CURRENT_TIMESTAMP`,
          [userId, productId, rating, title || null, comment || null]
        );

        // Reward only on first successful creation (no existing row)
        const [existing] = await connection.query(
          `SELECT id FROM point_transactions WHERE user_id = ? AND reference_type = 'review' AND reference_id = ? LIMIT 1`,
          [userId, productId]
        );
        let rewards = null;
        if (existing.length === 0) {
          rewards = await issueReviewRewards(connection, userId, productId);
        }

        await connection.commit();

        // Send notification for new review
        try {
          const notificationService = new NotificationService(
            req.app.get("socketServer")
          );
          await notificationService.notifyReviewReceived(productId, {
            userId,
            rating,
            title,
            comment,
            isVerifiedPurchase: true,
            rewards,
          });
        } catch (notificationError) {
          console.error(
            "Failed to send review notification:",
            notificationError
          );
          // Don't fail the review creation if notification fails
        }

        res.status(201).json({ message: "Review saved", rewards });
      } catch (e) {
        await connection.rollback();
        console.error("Create review error:", e);
        res.status(500).json({ message: "Server error while saving review" });
      } finally {
        connection.release();
      }
    } catch (e) {
      console.error("Verify purchase error:", e);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
