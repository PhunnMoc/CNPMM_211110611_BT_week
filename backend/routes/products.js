const express = require("express");
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

      // Get products with primary image via subquery to avoid ONLY_FULL_GROUP_BY issues
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
          SELECT pi.image_url 
          FROM product_images pi 
          WHERE pi.product_id = p.id AND pi.is_primary = 1 
          ORDER BY pi.sort_order, pi.id 
          LIMIT 1
        ) as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.${sortBy} ${sortOrder.toUpperCase()}
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

    res.json({
      ...products[0],
      images,
      relatedProducts,
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ message: "Server error while fetching product" });
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
