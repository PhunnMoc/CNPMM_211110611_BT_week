const express = require("express");
const { body, param, query, validationResult } = require("express-validator");
const { authenticateToken } = require("../middleware/auth");
const pool = require("../config/database");

const router = express.Router();

// Get user notifications with pagination
router.get(
  "/",
  authenticateToken,
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("unread_only")
    .optional()
    .isBoolean()
    .withMessage("unread_only must be a boolean"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const unreadOnly = req.query.unread_only === "true";
      const offset = (page - 1) * limit;

      let query = `
        SELECT id, type, title, message, data, is_read as isRead, created_at as createdAt, read_at as readAt 
        FROM notifications 
        WHERE user_id = ?
      `;
      let params = [req.user.id];

      if (unreadOnly) {
        query += " AND is_read = FALSE";
      }

      // 🚀 Fix: chèn trực tiếp limit và offset (đã parseInt)
      query += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

      const [notifications] = await pool.execute(query, params);

      // Get total count for pagination
      let countQuery =
        "SELECT COUNT(*) as total FROM notifications WHERE user_id = ?";
      let countParams = [req.user.id];

      if (unreadOnly) {
        countQuery += " AND is_read = FALSE";
      }

      const [countResult] = await pool.execute(countQuery, countParams);
      const total = countResult[0].total;

      // Parse JSON data with error handling
      const formattedNotifications = notifications.map((notification) => {
        let parsedData = null;
        if (notification.data) {
          try {
            // Check if data is already an object (from MySQL JSON column)
            if (typeof notification.data === "object") {
              parsedData = notification.data;
            } else if (typeof notification.data === "string") {
              // Try to parse JSON string
              parsedData = JSON.parse(notification.data);
            }
          } catch (error) {
            console.warn(
              `Failed to parse notification data for ID ${notification.id}:`,
              error.message
            );
            // Keep original data if parsing fails
            parsedData = notification.data;
          }
        }
        return {
          ...notification,
          data: parsedData,
        };
      });

      res.json({
        notifications: formattedNotifications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Get unread notification count
router.get("/unread-count", authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.execute(
      "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE",
      [req.user.id]
    );

    res.json({ unreadCount: result[0].count });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Mark notification as read
router.patch(
  "/:id/read",
  authenticateToken,
  param("id")
    .isInt({ min: 1 })
    .withMessage("Notification ID must be a positive integer"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const [result] = await pool.execute(
        "UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = ? AND user_id = ?",
        [req.params.id, req.user.id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Notification not found" });
      }

      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Mark all notifications as read
router.patch("/mark-all-read", authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.execute(
      "UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = ? AND is_read = FALSE",
      [req.user.id]
    );

    res.json({
      message: "All notifications marked as read",
      updatedCount: result.affectedRows,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete all read notifications (must come before /:id route)
router.delete("/read", authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.execute(
      "DELETE FROM notifications WHERE user_id = ? AND is_read = TRUE",
      [req.user.id]
    );

    res.json({
      message: "All read notifications deleted",
      deletedCount: result.affectedRows,
    });
  } catch (error) {
    console.error("Error deleting read notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete notification
router.delete(
  "/:id",
  authenticateToken,
  param("id")
    .isInt({ min: 1 })
    .withMessage("Notification ID must be a positive integer"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const [result] = await pool.execute(
        "DELETE FROM notifications WHERE id = ? AND user_id = ?",
        [req.params.id, req.user.id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Notification not found" });
      }

      res.json({ message: "Notification deleted" });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

module.exports = router;
