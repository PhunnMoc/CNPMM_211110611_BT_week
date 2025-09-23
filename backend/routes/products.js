const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult, query } = require("express-validator");
const pool = require("../config/database");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Get all products with filtering and pagination
router.get(
  "/",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("category")
      .optional()
      .isInt()
      .withMessage("Category must be a valid ID"),
    query("search")
      .optional()
      .isLength({ min: 1 })
      .withMessage("Search term cannot be empty"),
    query("minPrice")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Min price must be a positive number"),
    query("maxPrice")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Max price must be a positive number"),
    query("sortBy")
      .optional()
      .isIn(["name", "price", "created_at", "rating"])
      .withMessage("Invalid sort field"),
    query("sortOrder")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("Sort order must be asc or desc"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        page = 1,
        limit = 12,
        category,
        search,
        minPrice,
        maxPrice,
        sortBy = "created_at",
        sortOrder = "desc",
      } = req.query;

      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 12;
      const offset = (pageNum - 1) * limitNum;
      let whereConditions = ["p.is_active = 1"];
      let queryParams = [];

      // Category filter
      if (category) {
        whereConditions.push("p.category_id = ?");
        queryParams.push(category);
      }

      // Search filter
      if (search) {
        whereConditions.push("(p.name LIKE ? OR p.description LIKE ?)");
        queryParams.push(`%${search}%`, `%${search}%`);
      }

      // Price filters
      if (minPrice) {
        whereConditions.push("p.price >= ?");
        queryParams.push(minPrice);
      }
      if (maxPrice) {
        whereConditions.push("p.price <= ?");
        queryParams.push(maxPrice);
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      // Get total count
      const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      ${whereClause}
    `;
      const [countResult] = await pool.execute(countQuery, queryParams);
      const total = countResult[0].total;

      // Get products with primary image and review count via subqueries to avoid ONLY_FULL_GROUP_BY issues
      const productsQuery = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.discount_price,
        p.sku,
        p.stock_quantity,
        p.brand,
        p.is_featured,
        p.created_at,
        c.name as category_name,
        (
          SELECT COALESCE(AVG(r.rating), 0)
          FROM reviews r
          WHERE r.product_id = p.id AND r.is_approved = 1
        ) as rating,
        (
          SELECT COUNT(r2.id)
          FROM reviews r2
          WHERE r2.product_id = p.id AND r2.is_approved = 1
        ) as reviewCount,
        (
          SELECT pi.image_url 
          FROM product_images pi 
          WHERE pi.product_id = p.id AND pi.is_primary = 1 
          ORDER BY pi.sort_order, pi.id 
          LIMIT 1
        ) as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY ${
        sortBy === "rating" ? "rating" : `p.${sortBy}`
      } ${sortOrder.toUpperCase()}
      LIMIT ${limitNum} OFFSET ${offset}
    `;

      const [products] = await pool.execute(productsQuery, queryParams);

      res.json({
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({ message: "Server error while fetching products" });
    }
  }
);

// Get featured products
router.get("/featured", async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.discount_price,
        p.brand,
        (
          SELECT pi.image_url
          FROM product_images pi 
          WHERE pi.product_id = p.id AND pi.is_primary = 1
          ORDER BY pi.sort_order, pi.id
          LIMIT 1
        ) as image,
        (
          SELECT COALESCE(AVG(r.rating), 0)
          FROM reviews r 
          WHERE r.product_id = p.id AND r.is_approved = 1
        ) as rating,
        (
          SELECT COUNT(r2.id)
          FROM reviews r2 
          WHERE r2.product_id = p.id AND r2.is_approved = 1
        ) as reviewCount
      FROM products p
      WHERE p.is_active = 1 AND p.is_featured = 1
      ORDER BY p.created_at DESC
      LIMIT 8
    `;

    const [products] = await pool.execute(query);
    res.json(products);
  } catch (error) {
    console.error("Get featured products error:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching featured products" });
  }
});

// Get single product by ID
router.get("/:id", async (req, res) => {
  try {
    const productId = req.params.id;

    // Get product details (no aggregates to avoid ONLY_FULL_GROUP_BY)
    const productQuery = `
      SELECT 
        p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.is_active = 1
    `;

    const [products] = await pool.execute(productQuery, [productId]);

    if (products.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Get product images
    const imagesQuery = `
      SELECT id, image_url, alt_text, is_primary, sort_order
      FROM product_images
      WHERE product_id = ?
      ORDER BY sort_order, id
    `;

    const [images] = await pool.execute(imagesQuery, [productId]);

    // Get related products
    const relatedQuery = `
      SELECT 
        p.id,
        p.name,
        p.price,
        p.discount_price,
        pi.image_url as image
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
      WHERE p.category_id = ? AND p.id != ? AND p.is_active = 1
      ORDER BY p.created_at DESC
      LIMIT 4
    `;

    const [relatedProducts] = await pool.execute(relatedQuery, [
      products[0].category_id,
      productId,
    ]);

    // Purchase count = number of distinct customers who bought this product (delivered orders)
    const purchaseCountQuery = `
      SELECT COUNT(DISTINCT o.user_id) AS customers
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE oi.product_id = ? AND o.status = 'delivered'
    `;
    const [[purchaseCountRow]] = await pool.execute(purchaseCountQuery, [
      productId,
    ]);

    // View count = total views recorded
    const viewCountQuery = `SELECT COUNT(*) AS views FROM product_views WHERE product_id = ?`;
    const [[viewCountRow]] = await pool.execute(viewCountQuery, [productId]);

    // Review (comment) count
    const reviewCountQuery = `SELECT COUNT(*) AS review_count FROM reviews WHERE product_id = ? AND is_approved = 1`;
    const [[reviewCountRow]] = await pool.execute(reviewCountQuery, [
      productId,
    ]);

    res.json({
      ...products[0],
      images,
      relatedProducts,
      purchase_count: purchaseCountRow?.customers || 0,
      view_count: viewCountRow?.views || 0,
      review_count: reviewCountRow?.review_count || 0,
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ message: "Server error while fetching product" });
  }
});

// Record a product view (user optional)
router.post("/:id/view", async (req, res) => {
  try {
    const productId = req.params.id;

    // Try to extract user ID from Authorization header if present
    let userId = null;
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId || null;
      } catch (_) {
        // ignore invalid token; treat as anonymous view
      }
    }

    // Ensure product exists
    const [prods] = await pool.execute(
      "SELECT id FROM products WHERE id = ? AND is_active = 1",
      [productId]
    );
    if (prods.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    await pool.execute(
      "INSERT INTO product_views (user_id, product_id) VALUES (?, ?)",
      [userId, productId]
    );

    res.json({ message: "View recorded" });
  } catch (error) {
    console.error("Record view error:", error);
    res.status(500).json({ message: "Server error while recording view" });
  }
});

// Get recently viewed products (for current user if token provided; otherwise top viewed)
router.get("/recent/list", async (req, res) => {
  try {
    let userId = null;
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId || null;
      } catch (_) {}
    }

    let rows;
    if (userId) {
      const [result] = await pool.execute(
        `SELECT p.id, p.name, p.price, p.discount_price,
                (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) AS image
         FROM product_views v
         JOIN products p ON v.product_id = p.id
         WHERE v.user_id = ? AND p.is_active = 1
         GROUP BY p.id
         ORDER BY MAX(v.viewed_at) DESC
         LIMIT 10`,
        [userId]
      );
      rows = result;
    } else {
      const [result] = await pool.execute(
        `SELECT p.id, p.name, p.price, p.discount_price,
                (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) AS image
         FROM products p
         WHERE p.is_active = 1
         ORDER BY (SELECT COUNT(*) FROM product_views v WHERE v.product_id = p.id) DESC, p.created_at DESC
         LIMIT 10`
      );
      rows = result;
    }

    res.json(rows);
  } catch (error) {
    console.error("Recent products error:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching recent products" });
  }
});

// Create product (Admin only)
router.post(
  "/",
  authenticateToken,
  requireAdmin,
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
        `
      INSERT INTO products (
        name, description, price, discount_price, sku, category_id, 
        brand, weight, dimensions, stock_quantity, is_featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
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
          isFeatured,
        ]
      );

      res.status(201).json({
        message: "Product created successfully",
        productId: result.insertId,
      });
    } catch (error) {
      console.error("Create product error:", error);
      res.status(500).json({ message: "Server error while creating product" });
    }
  }
);

// Update product (Admin only)
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
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

      const [result] = await pool.execute(
        `
      UPDATE products 
      SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
        updateValues
      );

      res.json({ message: "Product updated successfully" });
    } catch (error) {
      console.error("Update product error:", error);
      res.status(500).json({ message: "Server error while updating product" });
    }
  }
);

// Delete product (Admin only)
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
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

    // Soft delete (set is_active to false)
    await pool.execute("UPDATE products SET is_active = 0 WHERE id = ?", [
      productId,
    ]);

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Server error while deleting product" });
  }
});

module.exports = router;
