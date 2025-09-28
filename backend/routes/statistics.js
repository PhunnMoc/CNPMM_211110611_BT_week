const express = require("express");
const { query, validationResult } = require("express-validator");
const { authenticateToken } = require("../middleware/auth");
const pool = require("../config/database");

const router = express.Router();

// Get sales revenue statistics
router.get(
  "/sales-revenue",
  authenticateToken,
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO 8601 date"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO 8601 date"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const startDate =
        req.query.startDate ||
        new Date(new Date().getFullYear(), 0, 1).toISOString();
      const endDate = req.query.endDate || new Date().toISOString();

      // Get total revenue from completed orders
      const [revenueResult] = await pool.execute(
        `SELECT 
          COUNT(*) as totalOrders,
          SUM(total_amount) as totalRevenue,
          AVG(total_amount) as averageOrderValue
        FROM orders 
        WHERE status = 'completed' 
        AND created_at BETWEEN ? AND ?`,
        [startDate, endDate]
      );

      // Get revenue by month for chart
      const [monthlyRevenue] = await pool.execute(
        `SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as orderCount,
          SUM(total_amount) as revenue
        FROM orders 
        WHERE status = 'completed' 
        AND created_at BETWEEN ? AND ?
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month`,
        [startDate, endDate]
      );

      // Get successfully delivered orders list
      const [deliveredOrders] = await pool.execute(
        `SELECT 
          o.id,
          o.order_number,
          o.total_amount,
          o.created_at,
          u.username,
          u.email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE o.status = 'completed'
        AND o.created_at BETWEEN ? AND ?
        ORDER BY o.created_at DESC
        LIMIT 50`,
        [startDate, endDate]
      );

      res.json({
        summary: revenueResult[0],
        monthlyRevenue,
        recentOrders: deliveredOrders,
        period: { startDate, endDate },
      });
    } catch (error) {
      console.error("Error fetching sales revenue:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Get cash flow statistics
router.get(
  "/cash-flow",
  authenticateToken,
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO 8601 date"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO 8601 date"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const startDate =
        req.query.startDate ||
        new Date(new Date().getFullYear(), 0, 1).toISOString();
      const endDate = req.query.endDate || new Date().toISOString();

      // Get cash flow summary
      const [cashFlowSummary] = await pool.execute(
        `SELECT 
          SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END) as completedRevenue,
          SUM(CASE WHEN status IN ('pending', 'processing', 'shipped', 'delivered') THEN total_amount ELSE 0 END) as pendingRevenue,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completedOrders,
          COUNT(CASE WHEN status IN ('pending', 'processing', 'shipped', 'delivered') THEN 1 END) as pendingOrders
        FROM orders 
        WHERE created_at BETWEEN ? AND ?`,
        [startDate, endDate]
      );

      // Get orders currently being delivered
      const [deliveringOrders] = await pool.execute(
        `SELECT 
          o.id,
          o.order_number,
          o.total_amount,
          o.status,
          o.created_at,
          u.username,
          u.email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE o.status IN ('pending', 'processing', 'shipped', 'delivered')
        AND o.created_at BETWEEN ? AND ?
        ORDER BY o.created_at DESC`,
        [startDate, endDate]
      );

      // Get completed orders (money should be in wallet)
      const [completedOrders] = await pool.execute(
        `SELECT 
          o.id,
          o.order_number,
          o.total_amount,
          o.created_at,
          u.username,
          u.email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE o.status = 'completed'
        AND o.created_at BETWEEN ? AND ?
        ORDER BY o.created_at DESC`,
        [startDate, endDate]
      );

      res.json({
        summary: cashFlowSummary[0],
        deliveringOrders,
        completedOrders,
        period: { startDate, endDate },
      });
    } catch (error) {
      console.error("Error fetching cash flow:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Get customer metrics
router.get(
  "/customers",
  authenticateToken,
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO 8601 date"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO 8601 date"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const startDate =
        req.query.startDate ||
        new Date(new Date().getFullYear(), 0, 1).toISOString();
      const endDate = req.query.endDate || new Date().toISOString();

      // Get total customers
      const [totalCustomers] = await pool.execute(
        "SELECT COUNT(*) as total FROM users WHERE is_admin = FALSE"
      );

      // Get new customers in period
      const [newCustomers] = await pool.execute(
        `SELECT COUNT(*) as newCustomers
        FROM users 
        WHERE is_admin = FALSE 
        AND created_at BETWEEN ? AND ?`,
        [startDate, endDate]
      );

      // Get new customers by month
      const [monthlyNewCustomers] = await pool.execute(
        `SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as newCustomers
        FROM users 
        WHERE is_admin = FALSE 
        AND created_at BETWEEN ? AND ?
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month`,
        [startDate, endDate]
      );

      // Get customer activity (customers who made orders)
      const [activeCustomers] = await pool.execute(
        `SELECT COUNT(DISTINCT user_id) as activeCustomers
        FROM orders 
        WHERE created_at BETWEEN ? AND ?`,
        [startDate, endDate]
      );

      // Get top customers by order value
      const [topCustomers] = await pool.execute(
        `SELECT 
          u.id,
          u.username,
          u.email,
          COUNT(o.id) as orderCount,
          SUM(o.total_amount) as totalSpent,
          MAX(o.created_at) as lastOrderDate
        FROM users u
        JOIN orders o ON u.id = o.user_id
        WHERE o.created_at BETWEEN ? AND ?
        AND u.is_admin = FALSE
        GROUP BY u.id, u.username, u.email
        ORDER BY totalSpent DESC
        LIMIT 10`,
        [startDate, endDate]
      );

      res.json({
        summary: {
          totalCustomers: totalCustomers[0].total,
          newCustomers: newCustomers[0].newCustomers,
          activeCustomers: activeCustomers[0].activeCustomers,
        },
        monthlyNewCustomers,
        topCustomers,
        period: { startDate, endDate },
      });
    } catch (error) {
      console.error("Error fetching customer metrics:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Get product performance (top 10 best-selling products)
router.get(
  "/products",
  authenticateToken,
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO 8601 date"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO 8601 date"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const startDate =
        req.query.startDate ||
        new Date(new Date().getFullYear(), 0, 1).toISOString();
      const endDate = req.query.endDate || new Date().toISOString();

      // Get top 10 best-selling products
      const [topProducts] = await pool.execute(
        `SELECT 
          p.id,
          p.name,
          p.price,
          p.brand,
          c.name as category,
          SUM(oi.quantity) as totalSold,
          SUM(oi.quantity * oi.price) as totalRevenue,
          COUNT(DISTINCT o.id) as orderCount,
          AVG(oi.quantity * oi.price) as averageOrderValue
        FROM products p
        JOIN order_items oi ON p.id = oi.product_id
        JOIN orders o ON oi.order_id = o.id
        JOIN categories c ON p.category_id = c.id
        WHERE o.status = 'completed'
        AND o.created_at BETWEEN ? AND ?
        GROUP BY p.id, p.name, p.price, p.brand, c.name
        ORDER BY totalSold DESC
        LIMIT 10`,
        [startDate, endDate]
      );

      // Get product performance by category
      const [categoryPerformance] = await pool.execute(
        `SELECT 
          c.name as category,
          COUNT(DISTINCT p.id) as productCount,
          SUM(oi.quantity) as totalSold,
          SUM(oi.quantity * oi.price) as totalRevenue
        FROM categories c
        JOIN products p ON c.id = p.category_id
        JOIN order_items oi ON p.id = oi.product_id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.status = 'completed'
        AND o.created_at BETWEEN ? AND ?
        GROUP BY c.id, c.name
        ORDER BY totalRevenue DESC`,
        [startDate, endDate]
      );

      // Get monthly product sales for chart
      const [monthlyProductSales] = await pool.execute(
        `SELECT 
          DATE_FORMAT(o.created_at, '%Y-%m') as month,
          SUM(oi.quantity) as totalSold,
          SUM(oi.quantity * oi.price) as totalRevenue
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.status = 'completed'
        AND o.created_at BETWEEN ? AND ?
        GROUP BY DATE_FORMAT(o.created_at, '%Y-%m')
        ORDER BY month`,
        [startDate, endDate]
      );

      res.json({
        topProducts,
        categoryPerformance,
        monthlyProductSales,
        period: { startDate, endDate },
      });
    } catch (error) {
      console.error("Error fetching product performance:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Get dashboard overview
router.get("/overview", authenticateToken, async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);

    // Get monthly overview
    const [monthlyOverview] = await pool.execute(
      `SELECT 
          COUNT(*) as totalOrders,
          SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END) as completedRevenue,
          SUM(CASE WHEN status IN ('pending', 'processing', 'shipped', 'delivered') THEN total_amount ELSE 0 END) as pendingRevenue,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completedOrders,
          COUNT(CASE WHEN status IN ('pending', 'processing', 'shipped', 'delivered') THEN 1 END) as pendingOrders
        FROM orders 
        WHERE created_at >= ?`,
      [startOfMonth.toISOString()]
    );

    // Get yearly overview
    const [yearlyOverview] = await pool.execute(
      `SELECT 
          COUNT(*) as totalOrders,
          SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END) as completedRevenue,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completedOrders
        FROM orders 
        WHERE created_at >= ?`,
      [startOfYear.toISOString()]
    );

    // Get new customers this month
    const [newCustomersThisMonth] = await pool.execute(
      `SELECT COUNT(*) as newCustomers
        FROM users 
        WHERE is_admin = FALSE 
        AND created_at >= ?`,
      [startOfMonth.toISOString()]
    );

    // Get top 3 products this month
    const [topProductsThisMonth] = await pool.execute(
      `SELECT 
          p.name,
          SUM(oi.quantity) as totalSold,
          SUM(oi.quantity * oi.price) as totalRevenue
        FROM products p
        JOIN order_items oi ON p.id = oi.product_id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.status = 'completed'
        AND o.created_at >= ?
        GROUP BY p.id, p.name
        ORDER BY totalSold DESC
        LIMIT 3`,
      [startOfMonth.toISOString()]
    );

    res.json({
      monthly: monthlyOverview[0],
      yearly: yearlyOverview[0],
      newCustomersThisMonth: newCustomersThisMonth[0].newCustomers,
      topProductsThisMonth,
      period: {
        currentMonth: startOfMonth.toISOString(),
        currentYear: startOfYear.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard overview:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

