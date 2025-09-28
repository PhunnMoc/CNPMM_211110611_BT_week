const pool = require("../config/database");

class NotificationService {
  constructor(socketServer) {
    this.socketServer = socketServer;
  }

  // Create a notification in the database
  async createNotification(userId, type, title, message, data = null) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO notifications (user_id, type, title, message, data) 
         VALUES (?, ?, ?, ?, ?)`,
        [userId, type, title, message, data ? JSON.stringify(data) : null]
      );

      const notificationId = result.insertId;

      // Send real-time notification if user is online
      const sent = this.socketServer.sendToUserRoom(userId, "notification", {
        id: notificationId,
        type,
        title,
        message,
        data,
        createdAt: new Date().toISOString(),
      });

      // Update sent status
      if (sent) {
        await pool.execute(
          "UPDATE notifications SET is_sent = TRUE WHERE id = ?",
          [notificationId]
        );
      }

      return notificationId;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  // Send notification to multiple users
  async createBulkNotification(userIds, type, title, message, data = null) {
    const notifications = [];

    for (const userId of userIds) {
      try {
        const notificationId = await this.createNotification(
          userId,
          type,
          title,
          message,
          data
        );
        notifications.push({ userId, notificationId });
      } catch (error) {
        console.error(`Error creating notification for user ${userId}:`, error);
      }
    }

    return notifications;
  }

  // Send notification to all admins
  async createAdminNotification(type, title, message, data = null) {
    try {
      const [users] = await pool.execute(
        "SELECT id FROM users WHERE is_admin = TRUE AND is_active = TRUE"
      );

      const adminIds = users.map((user) => user.id);
      return await this.createBulkNotification(
        adminIds,
        type,
        title,
        message,
        data
      );
    } catch (error) {
      console.error("Error creating admin notification:", error);
      throw error;
    }
  }

  // Get user notifications
  async getUserNotifications(userId, limit = 50, offset = 0) {
    try {
      const [notifications] = await pool.execute(
        `SELECT id, type, title, message, data, is_read as isRead, created_at as createdAt, read_at as readAt 
         FROM notifications 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );

      return notifications.map((notification) => {
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
    } catch (error) {
      console.error("Error fetching user notifications:", error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    try {
      const [result] = await pool.execute(
        "UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = ? AND user_id = ?",
        [notificationId, userId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId) {
    try {
      const [result] = await pool.execute(
        "UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = ? AND is_read = FALSE",
        [userId]
      );

      return result.affectedRows;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  // Get unread notification count
  async getUnreadCount(userId) {
    try {
      const [result] = await pool.execute(
        "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE",
        [userId]
      );

      return result[0].count;
    } catch (error) {
      console.error("Error getting unread count:", error);
      throw error;
    }
  }

  // Delete old notifications (cleanup)
  async deleteOldNotifications(daysOld = 30) {
    try {
      const [result] = await pool.execute(
        "DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)",
        [daysOld]
      );

      return result.affectedRows;
    } catch (error) {
      console.error("Error deleting old notifications:", error);
      throw error;
    }
  }

  // Specific notification methods for different events

  // Order update notification
  async notifyOrderUpdate(userId, orderId, status, orderData = null) {
    const statusMessages = {
      pending: "Your order has been placed and is being processed",
      processing: "Your order is being prepared",
      shipped: "Your order has been shipped",
      delivered: "Your order has been delivered",
      completed: "Your order has been completed successfully",
      cancelled: "Your order has been cancelled",
    };

    const title = `Order #${orderId} Update`;
    const message =
      statusMessages[status] ||
      `Your order status has been updated to ${status}`;

    return await this.createNotification(
      userId,
      "order_update",
      title,
      message,
      { orderId, status, ...orderData }
    );
  }

  // Review notification
  async notifyReviewReceived(productId, reviewData) {
    try {
      // Get product owner (assuming admin for now, or you could add product owner field)
      const [admins] = await pool.execute(
        "SELECT id FROM users WHERE is_admin = TRUE AND is_active = TRUE"
      );

      const title = "New Product Review";
      const message = `A new review has been posted for a product`;

      for (const admin of admins) {
        await this.createNotification(
          admin.id,
          "review_notification",
          title,
          message,
          { productId, ...reviewData }
        );
      }
    } catch (error) {
      console.error("Error notifying review received:", error);
    }
  }

  // Price change notification
  async notifyPriceChange(userId, productId, oldPrice, newPrice, productName) {
    const title = "Price Change Alert";
    const message = `The price of "${productName}" has changed from $${oldPrice} to $${newPrice}`;

    return await this.createNotification(
      userId,
      "price_change",
      title,
      message,
      { productId, oldPrice, newPrice, productName }
    );
  }

  // Stock alert notification
  async notifyStockAlert(productId, productName, stockLevel) {
    try {
      // Get users who have this product in their wishlist
      const [users] = await pool.execute(
        `SELECT DISTINCT w.user_id 
         FROM wishlist w 
         WHERE w.product_id = ?`,
        [productId]
      );

      const title = "Stock Alert";
      const message = `"${productName}" is running low on stock (${stockLevel} items left)`;

      for (const user of users) {
        await this.createNotification(
          user.user_id,
          "stock_alert",
          title,
          message,
          { productId, productName, stockLevel }
        );
      }
    } catch (error) {
      console.error("Error notifying stock alert:", error);
    }
  }

  // Coupon expiry notification
  async notifyCouponExpiry(userId, couponCode, daysLeft) {
    const title = "Coupon Expiring Soon";
    const message = `Your coupon "${couponCode}" expires in ${daysLeft} day${
      daysLeft !== 1 ? "s" : ""
    }`;

    return await this.createNotification(
      userId,
      "coupon_expiry",
      title,
      message,
      { couponCode, daysLeft }
    );
  }
}

module.exports = NotificationService;
