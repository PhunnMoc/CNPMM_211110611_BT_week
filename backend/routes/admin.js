const express = require("express");
const { body, validationResult, query } = require("express-validator");
const pool = require("../config/database");
const { requireAdmin } = require("../middleware/adminAuth");
const NotificationService = require("../services/notificationService");

const router = express.Router();

// All admin routes require admin authentication
router.use(requireAdmin);

// ==================== DASHBOARD & STATISTICS ====================

// Get admin dashboard overview
router.get("/dashboard/overview", async (req, res) => {
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

    // Get total users count
    const [totalUsers] = await pool.execute(
      "SELECT COUNT(*) as total FROM users WHERE is_admin = FALSE"
    );

    // Get total products count
    const [totalProducts] = await pool.execute(
      "SELECT COUNT(*) as total FROM products"
    );

    res.json({
      monthly: monthlyOverview[0],
      yearly: yearlyOverview[0],
      newCustomersThisMonth: newCustomersThisMonth[0].newCustomers,
      topProductsThisMonth,
      totalUsers: totalUsers[0].total,
      totalProducts: totalProducts[0].total,
      period: {
        currentMonth: startOfMonth.toISOString(),
        currentYear: startOfYear.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching admin dashboard overview:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ==================== USER MANAGEMENT ====================

// Get all users with pagination and filtering
router.get(
  "/users",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("search")
      .optional()
      .isLength({ min: 1 })
      .withMessage("Search term cannot be empty"),
    query("isActive")
      .optional()
      .isBoolean()
      .withMessage("isActive must be a boolean"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;
      const search = req.query.search || "";
      const isActive = req.query.isActive;

      let whereClause = "WHERE 1=1";
      let queryParams = [];

      if (search) {
        whereClause += ` AND (username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)`;
        const searchPattern = `%${search}%`;
        queryParams.push(
          searchPattern,
          searchPattern,
          searchPattern,
          searchPattern
        );
      }

      if (isActive !== undefined) {
        whereClause += ` AND is_active = ?`;
        queryParams.push(isActive === "true" ? 1 : 0);
      }

      // Get total count
      const [countResult] = await pool.execute(
        `SELECT COUNT(*) as total FROM users ${whereClause}`,
        queryParams
      );

      // Get users
      const [users] = await pool.execute(
        `SELECT 
          id, username, email, first_name, last_name, phone, 
          is_admin, is_active, created_at, updated_at
        FROM users 
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}`,
        queryParams
      );

      res.json({
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(countResult[0].total / limit),
          totalUsers: countResult[0].total,
          limit,
        },
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Get user by ID
router.get("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const [users] = await pool.execute(
      `SELECT 
        id, username, email, first_name, last_name, phone, 
        is_admin, is_active, created_at, updated_at
      FROM users 
      WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(users[0]);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update user
router.put(
  "/users/:id",
  [
    body("firstName")
      .optional()
      .notEmpty()
      .withMessage("First name cannot be empty"),
    body("lastName")
      .optional()
      .notEmpty()
      .withMessage("Last name cannot be empty"),
    body("email").optional().isEmail().withMessage("Invalid email format"),
    body("phone")
      .optional()
      .isLength({ min: 10 })
      .withMessage("Phone must be at least 10 characters"),
    body("isActive")
      .optional()
      .isBoolean()
      .withMessage("isActive must be a boolean"),
    body("isAdmin")
      .optional()
      .isBoolean()
      .withMessage("isAdmin must be a boolean"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.params.id;
      const { firstName, lastName, email, phone, isActive, isAdmin } = req.body;

      // Check if user exists
      const [users] = await pool.execute("SELECT id FROM users WHERE id = ?", [
        userId,
      ]);
      if (users.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      // Build update query
      const updateFields = [];
      const updateValues = [];

      if (firstName !== undefined) {
        updateFields.push("first_name = ?");
        updateValues.push(firstName);
      }
      if (lastName !== undefined) {
        updateFields.push("last_name = ?");
        updateValues.push(lastName);
      }
      if (email !== undefined) {
        updateFields.push("email = ?");
        updateValues.push(email);
      }
      if (phone !== undefined) {
        updateFields.push("phone = ?");
        updateValues.push(phone);
      }
      if (isActive !== undefined) {
        updateFields.push("is_active = ?");
        updateValues.push(isActive ? 1 : 0);
      }
      if (isAdmin !== undefined) {
        updateFields.push("is_admin = ?");
        updateValues.push(isAdmin ? 1 : 0);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }

      updateFields.push("updated_at = CURRENT_TIMESTAMP");
      updateValues.push(userId);

      await pool.execute(
        `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`,
        updateValues
      );

      res.json({ message: "User updated successfully" });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Delete user (soft delete)
router.delete("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user exists
    const [users] = await pool.execute(
      "SELECT id, is_admin FROM users WHERE id = ?",
      [userId]
    );
    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deleting admin users
    if (users[0].is_admin) {
      return res.status(403).json({ message: "Cannot delete admin users" });
    }

    // Soft delete by setting is_active to false
    await pool.execute(
      "UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [userId]
    );

    res.json({ message: "User deactivated successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ==================== PRODUCT MANAGEMENT ====================

// Get all products for admin (including inactive)
router.get(
  "/products",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("search")
      .optional()
      .isLength({ min: 1 })
      .withMessage("Search term cannot be empty"),
    query("categoryId")
      .optional()
      .isInt()
      .withMessage("Category ID must be a valid integer"),
    query("isActive")
      .optional()
      .isBoolean()
      .withMessage("isActive must be a boolean"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;
      const search = req.query.search || "";
      const categoryId = req.query.categoryId;
      const isActive = req.query.isActive;

      let whereClause = "WHERE 1=1";
      let queryParams = [];

      if (search) {
        whereClause += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)`;
        const searchPattern = `%${search}%`;
        queryParams.push(searchPattern, searchPattern, searchPattern);
      }

      if (categoryId) {
        whereClause += ` AND p.category_id = ?`;
        queryParams.push(categoryId);
      }

      if (isActive !== undefined) {
        whereClause += ` AND p.is_active = ?`;
        queryParams.push(isActive === "true" ? 1 : 0);
      }

      // Get total count
      const [countResult] = await pool.execute(
        `SELECT COUNT(*) as total FROM products p ${whereClause}`,
        queryParams
      );

      // Get products
      const [products] = await pool.execute(
        `SELECT 
          p.id, p.name, p.description, p.price, p.discount_price, p.sku,
          p.category_id, c.name as category_name, p.brand, p.weight, p.dimensions,
          p.stock_quantity, p.is_featured, p.is_active, p.created_at, p.updated_at
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ${whereClause}
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}`,
        queryParams
      );

      res.json({
        products,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(countResult[0].total / limit),
          totalProducts: countResult[0].total,
          limit,
        },
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Create product
router.post(
  "/products",
  [
    body("name").notEmpty().withMessage("Product name is required"),
    body("description")
      .notEmpty()
      .withMessage("Product description is required"),
    body("price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    body("categoryId")
      .isInt()
      .withMessage("Category ID must be a valid integer"),
    body("stockQuantity")
      .isInt({ min: 0 })
      .withMessage("Stock quantity must be a non-negative integer"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        name,
        description,
        price,
        discountPrice,
        sku,
        categoryId,
        brand,
        weight,
        dimensions,
        stockQuantity,
        isFeatured = false,
      } = req.body;

      // Check if category exists
      const [categories] = await pool.execute(
        "SELECT id FROM categories WHERE id = ?",
        [categoryId]
      );
      if (categories.length === 0) {
        return res.status(400).json({ message: "Category not found" });
      }

      // Check if SKU already exists
      if (sku) {
        const [existingProducts] = await pool.execute(
          "SELECT id FROM products WHERE sku = ?",
          [sku]
        );
        if (existingProducts.length > 0) {
          return res.status(400).json({ message: "SKU already exists" });
        }
      }

      const [result] = await pool.execute(
        `INSERT INTO products (
          name, description, price, discount_price, sku, category_id, 
          brand, weight, dimensions, stock_quantity, is_featured, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          name,
          description,
          price,
          discountPrice || null,
          sku || null,
          categoryId,
          brand || null,
          weight || null,
          dimensions || null,
          stockQuantity,
          isFeatured ? 1 : 0,
        ]
      );

      res.status(201).json({
        message: "Product created successfully",
        productId: result.insertId,
      });
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Update product
router.put(
  "/products/:id",
  [
    body("name")
      .optional()
      .notEmpty()
      .withMessage("Product name cannot be empty"),
    body("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    body("stockQuantity")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Stock quantity must be a non-negative integer"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const productId = req.params.id;
      const updateData = req.body;

      // Check if product exists
      const [products] = await pool.execute(
        "SELECT id FROM products WHERE id = ?",
        [productId]
      );
      if (products.length === 0) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Build dynamic update query
      const allowedFields = [
        "name",
        "description",
        "price",
        "discount_price",
        "sku",
        "category_id",
        "brand",
        "weight",
        "dimensions",
        "stock_quantity",
        "is_featured",
        "is_active",
      ];

      const updateFields = [];
      const updateValues = [];

      Object.keys(updateData).forEach((key) => {
        if (allowedFields.includes(key) && updateData[key] !== undefined) {
          updateFields.push(`${key} = ?`);
          updateValues.push(updateData[key]);
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }

      updateValues.push(productId);

      await pool.execute(
        `UPDATE products 
        SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        updateValues
      );

      res.json({ message: "Product updated successfully" });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Delete product (soft delete)
router.delete("/products/:id", async (req, res) => {
  try {
    const productId = req.params.id;

    // Check if product exists
    const [products] = await pool.execute(
      "SELECT id FROM products WHERE id = ?",
      [productId]
    );
    if (products.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Soft delete by setting is_active to false
    await pool.execute(
      "UPDATE products SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [productId]
    );

    res.json({ message: "Product deactivated successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ==================== ORDER MANAGEMENT ====================

// Get all orders with pagination and filtering
router.get(
  "/orders",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("status")
      .optional()
      .isIn([
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "completed",
      ])
      .withMessage("Invalid status"),
    query("startDate")
      .optional()
      .isISO8601()
      .withMessage("Start date must be a valid ISO 8601 date"),
    query("endDate")
      .optional()
      .isISO8601()
      .withMessage("End date must be a valid ISO 8601 date"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;
      const status = req.query.status;
      const startDate = req.query.startDate;
      const endDate = req.query.endDate;

      let whereClause = "WHERE 1=1";
      let queryParams = [];

      if (status) {
        whereClause += ` AND o.status = ?`;
        queryParams.push(status);
      }

      if (startDate) {
        whereClause += ` AND o.created_at >= ?`;
        queryParams.push(startDate);
      }

      if (endDate) {
        whereClause += ` AND o.created_at <= ?`;
        queryParams.push(endDate);
      }

      // Get total count
      const [countResult] = await pool.execute(
        `SELECT COUNT(*) as total FROM orders o ${whereClause}`,
        queryParams
      );

      // Get orders
      const [orders] = await pool.execute(
        `SELECT 
          o.id, o.order_number, o.status, o.total_amount, o.shipping_address,
          o.created_at, o.updated_at,
          u.id as user_id, u.username, u.email, u.first_name, u.last_name
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ${whereClause}
        ORDER BY o.created_at DESC
        LIMIT ${limit} OFFSET ${offset}`,
        queryParams
      );

      res.json({
        orders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(countResult[0].total / limit),
          totalOrders: countResult[0].total,
          limit,
        },
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Get order details
router.get("/orders/:id", async (req, res) => {
  try {
    const orderId = req.params.id;

    // Get order details
    const [orders] = await pool.execute(
      `SELECT 
        o.id, o.order_number, o.status, o.total_amount, o.shipping_address,
        o.created_at, o.updated_at,
        u.id as user_id, u.username, u.email, u.first_name, u.last_name, u.phone
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ?`,
      [orderId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Get order items
    const [orderItems] = await pool.execute(
      `SELECT 
        oi.id, oi.quantity, oi.price,
        p.id as product_id, p.name as product_name, p.sku, p.brand
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?`,
      [orderId]
    );

    res.json({
      order: orders[0],
      items: orderItems,
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update order status
router.put(
  "/orders/:id/status",
  [
    body("status")
      .isIn([
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "completed",
      ])
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

      // Check if order exists
      const [orders] = await pool.execute(
        "SELECT id, user_id FROM orders WHERE id = ?",
        [orderId]
      );
      if (orders.length === 0) {
        return res.status(404).json({ message: "Order not found" });
      }

      await pool.execute(
        "UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [status, orderId]
      );

      // Send notification to user about status change
      const notificationService = new NotificationService(
        req.app.get("socketServer")
      );
      await notificationService.createNotification(
        orders[0].user_id,
        "order_status_update",
        "Order Status Updated",
        `Your order status has been updated to: ${status}`,
        { orderId, status }
      );

      res.json({ message: "Order status updated successfully" });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// ==================== CATEGORY MANAGEMENT ====================

// Get all categories
router.get("/categories", async (req, res) => {
  try {
    const [categories] = await pool.execute(
      `SELECT 
        c.id, c.name, c.description, c.is_active, c.created_at, c.updated_at,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
      GROUP BY c.id, c.name, c.description, c.is_active, c.created_at, c.updated_at
      ORDER BY c.name`
    );

    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create category
router.post(
  "/categories",
  [
    body("name").notEmpty().withMessage("Category name is required"),
    body("description")
      .optional()
      .notEmpty()
      .withMessage("Description cannot be empty"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description } = req.body;

      // Check if category name already exists
      const [existingCategories] = await pool.execute(
        "SELECT id FROM categories WHERE name = ?",
        [name]
      );
      if (existingCategories.length > 0) {
        return res
          .status(400)
          .json({ message: "Category name already exists" });
      }

      const [result] = await pool.execute(
        "INSERT INTO categories (name, description, is_active) VALUES (?, ?, 1)",
        [name, description || null]
      );

      res.status(201).json({
        message: "Category created successfully",
        categoryId: result.insertId,
      });
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Update category
router.put(
  "/categories/:id",
  [
    body("name")
      .optional()
      .notEmpty()
      .withMessage("Category name cannot be empty"),
    body("description")
      .optional()
      .notEmpty()
      .withMessage("Description cannot be empty"),
    body("isActive")
      .optional()
      .isBoolean()
      .withMessage("isActive must be a boolean"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const categoryId = req.params.id;
      const { name, description, isActive } = req.body;

      // Check if category exists
      const [categories] = await pool.execute(
        "SELECT id FROM categories WHERE id = ?",
        [categoryId]
      );
      if (categories.length === 0) {
        return res.status(404).json({ message: "Category not found" });
      }

      // Build update query
      const updateFields = [];
      const updateValues = [];

      if (name !== undefined) {
        updateFields.push("name = ?");
        updateValues.push(name);
      }
      if (description !== undefined) {
        updateFields.push("description = ?");
        updateValues.push(description);
      }
      if (isActive !== undefined) {
        updateFields.push("is_active = ?");
        updateValues.push(isActive ? 1 : 0);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }

      updateFields.push("updated_at = CURRENT_TIMESTAMP");
      updateValues.push(categoryId);

      await pool.execute(
        `UPDATE categories SET ${updateFields.join(", ")} WHERE id = ?`,
        updateValues
      );

      res.json({ message: "Category updated successfully" });
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Delete category (soft delete)
router.delete("/categories/:id", async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Check if category exists
    const [categories] = await pool.execute(
      "SELECT id FROM categories WHERE id = ?",
      [categoryId]
    );
    if (categories.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if category has products
    const [products] = await pool.execute(
      "SELECT COUNT(*) as count FROM products WHERE category_id = ? AND is_active = 1",
      [categoryId]
    );
    if (products[0].count > 0) {
      return res.status(400).json({
        message: "Cannot delete category with active products",
      });
    }

    // Soft delete by setting is_active to false
    await pool.execute(
      "UPDATE categories SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [categoryId]
    );

    res.json({ message: "Category deactivated successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ==================== NOTIFICATION MANAGEMENT ====================

// Send notification to all users
router.post(
  "/notifications/broadcast",
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("message").notEmpty().withMessage("Message is required"),
    body("type")
      .optional()
      .isIn(["info", "warning", "success", "error"])
      .withMessage("Invalid notification type"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, message, type = "info", data } = req.body;

      // Get all active users
      const [users] = await pool.execute(
        "SELECT id FROM users WHERE is_active = 1"
      );

      const userIds = users.map((user) => user.id);

      const notificationService = new NotificationService(
        req.app.get("socketServer")
      );
      await notificationService.createBulkNotification(
        userIds,
        type,
        title,
        message,
        data
      );

      res.json({
        message: "Notification sent successfully",
        recipients: userIds.length,
      });
    } catch (error) {
      console.error("Error sending broadcast notification:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Send notification to specific user
router.post(
  "/notifications/send",
  [
    body("userId").isInt().withMessage("User ID must be a valid integer"),
    body("title").notEmpty().withMessage("Title is required"),
    body("message").notEmpty().withMessage("Message is required"),
    body("type")
      .optional()
      .isIn(["info", "warning", "success", "error"])
      .withMessage("Invalid notification type"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId, title, message, type = "info", data } = req.body;

      // Check if user exists
      const [users] = await pool.execute(
        "SELECT id FROM users WHERE id = ? AND is_active = 1",
        [userId]
      );
      if (users.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const notificationService = new NotificationService(
        req.app.get("socketServer")
      );
      await notificationService.createNotification(
        userId,
        type,
        title,
        message,
        data
      );

      res.json({ message: "Notification sent successfully" });
    } catch (error) {
      console.error("Error sending notification:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

module.exports = router;
