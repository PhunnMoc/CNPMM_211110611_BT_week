const express = require("express");
const { body, validationResult } = require("express-validator");
const pool = require("../config/database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Generate unique order number
function generateOrderNumber() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `ORD-${timestamp}-${random}`;
}

// Get user's orders
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;
    const pageNum = parseInt(req.query.page, 10) || 1;
    const limitNum = parseInt(req.query.limit, 10) || 10;
    const offsetNum = (pageNum - 1) * limitNum;

    // Auto-confirm orders after 30 minutes (pending -> processing)
    try {
      await pool.execute(
        `UPDATE orders 
         SET status = 'processing', updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ? AND status = 'pending'
           AND TIMESTAMPDIFF(MINUTE, created_at, CURRENT_TIMESTAMP) >= 30`,
        [userId]
      );
    } catch (e) {
      // Non-fatal
    }

    let whereClause = "WHERE o.user_id = ?";
    let queryParams = [userId];

    if (status) {
      whereClause += " AND o.status = ?";
      queryParams.push(status);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM orders o ${whereClause}`;
    const [countResult] = await pool.execute(countQuery, queryParams);
    const total = countResult[0].total;

    // Get orders - avoid ONLY_FULL_GROUP_BY by using subquery for item_count
    // MySQL server prepared statements often reject placeholders in LIMIT/OFFSET.
    // Since limit/offset are validated numbers, safely inline them.
    const safeLimit = Number.isFinite(limitNum) && limitNum > 0 ? limitNum : 10;
    const safeOffset =
      Number.isFinite(offsetNum) && offsetNum >= 0 ? offsetNum : 0;

    const ordersQuery = `
      SELECT 
        o.id,
        o.order_number,
        o.status,
        o.total_amount,
        o.payment_status,
        o.created_at,
        (
          SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id
        ) AS item_count
      FROM orders o
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT ${safeLimit} OFFSET ${safeOffset}
    `;

    const [orders] = await pool.execute(ordersQuery, queryParams);

    res.json({
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Server error while fetching orders" });
  }
});

// Get single order by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;

    // Auto-confirm this order after 30 minutes (pending -> processing)
    try {
      await pool.execute(
        `UPDATE orders 
         SET status = 'processing', updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND user_id = ? AND status = 'pending'
           AND TIMESTAMPDIFF(MINUTE, created_at, CURRENT_TIMESTAMP) >= 30`,
        [orderId, userId]
      );
    } catch (e) {
      // Non-fatal
    }

    // Get order details
    const orderQuery = `
      SELECT 
        o.*,
        u.first_name,
        u.last_name,
        u.email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ? AND o.user_id = ?
    `;

    const [orders] = await pool.execute(orderQuery, [orderId, userId]);

    if (orders.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Get order items
    const itemsQuery = `
      SELECT 
        oi.id,
        oi.quantity,
        oi.price,
        p.id as product_id,
        p.name,
        p.sku,
        pi.image_url as image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
      WHERE oi.order_id = ?
    `;

    const [items] = await pool.execute(itemsQuery, [orderId]);

    res.json({
      ...orders[0],
      items,
    });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ message: "Server error while fetching order" });
  }
});

// Create new order
router.post(
  "/",
  authenticateToken,
  [
    body("shippingAddress")
      .notEmpty()
      .withMessage("Shipping address is required"),
    body("paymentMethod").notEmpty().withMessage("Payment method is required"),
    body("billingAddress").optional().isString(),
    body("couponCode").optional().isString(),
    body("pointsToRedeem").optional().isInt({ min: 0 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.id;
      const {
        shippingAddress,
        billingAddress,
        paymentMethod,
        notes,
        couponCode,
        pointsToRedeem = 0,
      } = req.body;

      // Get cart items
      const cartQuery = `
      SELECT 
        ci.product_id,
        ci.quantity,
        p.name,
        p.price,
        p.discount_price,
        p.stock_quantity
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ? AND p.is_active = 1
    `;

      const [cartItems] = await pool.execute(cartQuery, [userId]);

      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Validate stock and calculate total
      let totalAmount = 0;
      const orderItems = [];

      for (const item of cartItems) {
        if (item.quantity > item.stock_quantity) {
          return res.status(400).json({
            message: `Insufficient stock for ${item.name}. Available: ${item.stock_quantity}`,
          });
        }

        const price = item.discount_price || item.price;
        const itemTotal = price * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          product_id: item.product_id,
          quantity: item.quantity,
          price: price,
        });
      }

      // Calculate discounts (coupon and points)
      let couponDiscount = 0;
      let appliedCouponId = null;
      let pointsDiscount = 0;
      let pointsToUse = Math.max(parseInt(pointsToRedeem, 10) || 0, 0);

      // Load coupon if provided
      try {
        if (couponCode) {
          const [rows] = await pool.execute(
            `SELECT uc.id as user_coupon_id, c.id as coupon_id, c.discount_type, c.discount_value, c.min_order_amount, c.expires_at, c.is_active
             FROM user_coupons uc
             JOIN coupons c ON uc.coupon_id = c.id
             WHERE uc.user_id = ? AND c.code = ? AND uc.is_redeemed = 0`,
            [userId, couponCode]
          );
          const coupon = rows?.[0];
          if (coupon && coupon.is_active) {
            const notExpired =
              !coupon.expires_at || new Date(coupon.expires_at) > new Date();
            const meetsMin =
              !coupon.min_order_amount ||
              totalAmount >= Number(coupon.min_order_amount);
            if (notExpired && meetsMin) {
              if (coupon.discount_type === "percent") {
                couponDiscount =
                  (totalAmount * Number(coupon.discount_value)) / 100;
              } else {
                couponDiscount = Number(coupon.discount_value);
              }
              appliedCouponId = coupon.user_coupon_id;
            }
          }
        }
      } catch (_) {
        // ignore coupon errors, proceed without coupon
        couponDiscount = 0;
        appliedCouponId = null;
      }

      // Load points balance if redeeming
      try {
        if (pointsToUse > 0) {
          const [[balanceRow]] = await pool.query(
            `SELECT balance FROM user_points WHERE user_id = ? LIMIT 1`,
            [userId]
          );
          const balance = Number(balanceRow?.balance || 0);
          if (balance <= 0) {
            pointsToUse = 0;
          } else if (pointsToUse > balance) {
            pointsToUse = balance;
          }
          // Conversion: 1 point = 0.01 currency unit
          const conversion = 0.01;
          const maxDiscountPossible = Math.max(totalAmount - couponDiscount, 0);
          pointsDiscount = Math.min(
            pointsToUse * conversion,
            maxDiscountPossible
          );
          // Adjust points to actual used (in case we capped by remaining amount)
          pointsToUse = Math.floor(pointsDiscount / conversion);
        }
      } catch (_) {
        pointsToUse = 0;
        pointsDiscount = 0;
      }

      // Apply discounts
      totalAmount = Math.max(totalAmount - couponDiscount - pointsDiscount, 0);

      // Start transaction
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // Create order
        const orderNumber = generateOrderNumber();
        const [orderResult] = await connection.execute(
          `
        INSERT INTO orders (
          user_id, order_number, shipping_address, billing_address, 
          payment_method, total_amount, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
          [
            userId,
            orderNumber,
            shippingAddress,
            billingAddress || shippingAddress,
            paymentMethod,
            totalAmount,
            notes || null,
          ]
        );

        const orderId = orderResult.insertId;

        // Create order items and update stock
        for (const item of orderItems) {
          await connection.execute(
            `
          INSERT INTO order_items (order_id, product_id, quantity, price)
          VALUES (?, ?, ?, ?)
        `,
            [orderId, item.product_id, item.quantity, item.price]
          );

          // Update product stock
          await connection.execute(
            `
          UPDATE products 
          SET stock_quantity = stock_quantity - ?
          WHERE id = ?
        `,
            [item.quantity, item.product_id]
          );
        }

        // Clear user's cart
        await connection.execute("DELETE FROM cart_items WHERE user_id = ?", [
          userId,
        ]);

        // If coupon applied, mark user coupon as redeemed
        if (appliedCouponId) {
          await connection.execute(
            `UPDATE user_coupons SET is_redeemed = 1, redeemed_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`,
            [appliedCouponId, userId]
          );
        }

        // If points used, deduct balance and log transaction
        if (pointsToUse > 0) {
          await connection.execute(
            `INSERT INTO user_points (user_id, balance) VALUES (?, ?)
             ON DUPLICATE KEY UPDATE balance = GREATEST(balance - VALUES(balance), 0), updated_at = CURRENT_TIMESTAMP`,
            [userId, pointsToUse]
          );
          await connection.execute(
            `INSERT INTO point_transactions (user_id, points, reason, reference_type, reference_id)
             VALUES (?, ?, 'Redeemed on order', 'order', ?)`,
            [userId, -pointsToUse, orderId]
          );
        }

        await connection.commit();

        res.status(201).json({
          message: "Order created successfully",
          orderId,
          orderNumber,
          totalAmount,
          discounts: {
            coupon: Number(couponDiscount.toFixed(2)),
            points: Number(pointsDiscount.toFixed(2)),
          },
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({ message: "Server error while creating order" });
    }
  }
);

// Update order status (Admin only)
router.put(
  "/:id/status",
  authenticateToken,
  [
    body("status")
      .isIn(["pending", "processing", "shipped", "delivered", "cancelled"])
      .withMessage("Invalid status"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const orderId = req.params.id;
      const { status } = req.body;

      // Check if user is admin
      if (!req.user.is_admin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Check if order exists
      const [orders] = await pool.execute(
        "SELECT id FROM orders WHERE id = ?",
        [orderId]
      );
      if (orders.length === 0) {
        return res.status(404).json({ message: "Order not found" });
      }

      await pool.execute(
        "UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [status, orderId]
      );

      res.json({ message: "Order status updated successfully" });
    } catch (error) {
      console.error("Update order status error:", error);
      res
        .status(500)
        .json({ message: "Server error while updating order status" });
    }
  }
);

// Cancel order
router.put("/:id/cancel", authenticateToken, async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;

    // Check if order exists and belongs to user
    const [orders] = await pool.execute(
      "SELECT id, status, created_at FROM orders WHERE id = ? AND user_id = ?",
      [orderId, userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = orders[0];

    // Already cancelled
    if (order.status === "cancelled") {
      return res.status(400).json({ message: "Order is already cancelled" });
    }

    // If delivered or shipped, cannot cancel
    if (order.status === "delivered" || order.status === "shipped") {
      return res
        .status(400)
        .json({ message: "Cannot cancel order at this stage" });
    }

    // Only allow instant cancel within 30 minutes while still pending
    const [diffRows] = await pool.execute(
      "SELECT TIMESTAMPDIFF(MINUTE, created_at, CURRENT_TIMESTAMP) AS minutes FROM orders WHERE id = ?",
      [orderId]
    );
    const minutes = diffRows?.[0]?.minutes ?? 0;

    if (order.status !== "pending" || minutes > 30) {
      if (order.status === "processing") {
        return res
          .status(202)
          .json({ message: "Cancellation request sent to shop" });
      }
      return res.status(400).json({
        message: "Order can only be cancelled within 30 minutes while pending",
      });
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Update order status
      await connection.execute(
        "UPDATE orders SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [orderId]
      );

      // Restore product stock
      const [orderItems] = await connection.execute(
        "SELECT product_id, quantity FROM order_items WHERE order_id = ?",
        [orderId]
      );

      for (const item of orderItems) {
        await connection.execute(
          `
          UPDATE products 
          SET stock_quantity = stock_quantity + ?
          WHERE id = ?
        `,
          [item.quantity, item.product_id]
        );
      }

      await connection.commit();

      res.json({ message: "Order cancelled successfully" });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ message: "Server error while cancelling order" });
  }
});

module.exports = router;
