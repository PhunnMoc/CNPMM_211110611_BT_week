const express = require("express");
const { body, validationResult } = require("express-validator");
const pool = require("../config/database");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Get all categories
router.get("/", async (req, res) => {
  try {
    const query = `
      SELECT 
        c.id,
        c.name,
        c.description,
        c.image_url as image,
        c.parent_id,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
      WHERE c.is_active = 1
      GROUP BY c.id
      ORDER BY c.name
    `;

    const [categories] = await pool.execute(query);

    // Organize categories into parent-child structure
    const categoryMap = new Map();
    const rootCategories = [];

    categories.forEach((category) => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    categories.forEach((category) => {
      if (category.parent_id) {
        const parent = categoryMap.get(category.parent_id);
        if (parent) {
          parent.children.push(categoryMap.get(category.id));
        }
      } else {
        rootCategories.push(categoryMap.get(category.id));
      }
    });

    res.json(rootCategories);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "Server error while fetching categories" });
  }
});

// Get single category by ID
router.get("/:id", async (req, res) => {
  try {
    const categoryId = req.params.id;

    const query = `
      SELECT 
        c.id,
        c.name,
        c.description,
        c.image_url as image,
        c.parent_id,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
      WHERE c.id = ? AND c.is_active = 1
      GROUP BY c.id
    `;

    const [categories] = await pool.execute(query, [categoryId]);

    if (categories.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(categories[0]);
  } catch (error) {
    console.error("Get category error:", error);
    res.status(500).json({ message: "Server error while fetching category" });
  }
});

// Get products in category
router.get("/:id/products", async (req, res) => {
  try {
    const categoryId = req.params.id;
    const {
      page = 1,
      limit = 12,
      sortBy = "created_at",
      sortOrder = "desc",
    } = req.query;
    const offset = (page - 1) * limit;

    // Check if category exists
    const [categories] = await pool.execute(
      "SELECT id FROM categories WHERE id = ? AND is_active = 1",
      [categoryId]
    );
    if (categories.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      WHERE p.category_id = ? AND p.is_active = 1
    `;
    const [countResult] = await pool.execute(countQuery, [categoryId]);
    const total = countResult[0].total;

    // Get products - avoid ONLY_FULL_GROUP_BY by using subqueries for image and aggregates
    const productsQuery = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.discount_price,
        p.brand,
        p.is_featured,
        p.created_at,
        (
          SELECT pi.image_url 
          FROM product_images pi 
          WHERE pi.product_id = p.id AND pi.is_primary = 1 
          ORDER BY pi.sort_order, pi.id 
          LIMIT 1
        ) as primary_image,
        (
          SELECT COALESCE(AVG(r.rating), 0)
          FROM reviews r
          WHERE r.product_id = p.id AND r.is_approved = 1
        ) as avg_rating,
        (
          SELECT COUNT(r2.id)
          FROM reviews r2
          WHERE r2.product_id = p.id AND r2.is_approved = 1
        ) as review_count
      FROM products p
      WHERE p.category_id = ? AND p.is_active = 1
      ORDER BY p.${sortBy} ${sortOrder.toUpperCase()}
      LIMIT ? OFFSET ?
    `;

    const [products] = await pool.execute(productsQuery, [
      categoryId,
      parseInt(limit),
      offset,
    ]);

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
    console.error("Get category products error:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching category products" });
  }
});

// Create category (Admin only)
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  [
    body("name").notEmpty().withMessage("Category name is required"),
    body("description")
      .optional()
      .isLength({ min: 1 })
      .withMessage("Description cannot be empty"),
    body("parentId")
      .optional()
      .isInt()
      .withMessage("Parent ID must be a valid integer"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description, imageUrl, parentId } = req.body;

      // Check if parent category exists (if provided)
      if (parentId) {
        const [parentCategories] = await pool.execute(
          "SELECT id FROM categories WHERE id = ? AND is_active = 1",
          [parentId]
        );
        if (parentCategories.length === 0) {
          return res.status(400).json({ message: "Parent category not found" });
        }
      }

      const [result] = await pool.execute(
        `
      INSERT INTO categories (name, description, image_url, parent_id)
      VALUES (?, ?, ?, ?)
    `,
        [name, description || null, imageUrl || null, parentId || null]
      );

      res.status(201).json({
        message: "Category created successfully",
        categoryId: result.insertId,
      });
    } catch (error) {
      console.error("Create category error:", error);
      res.status(500).json({ message: "Server error while creating category" });
    }
  }
);

// Update category (Admin only)
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  [
    body("name")
      .optional()
      .notEmpty()
      .withMessage("Category name cannot be empty"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const categoryId = req.params.id;
      const { name, description, imageUrl, parentId } = req.body;

      // Check if category exists
      const [categories] = await pool.execute(
        "SELECT id FROM categories WHERE id = ?",
        [categoryId]
      );
      if (categories.length === 0) {
        return res.status(404).json({ message: "Category not found" });
      }

      // Check if parent category exists (if provided)
      if (parentId) {
        const [parentCategories] = await pool.execute(
          "SELECT id FROM categories WHERE id = ? AND is_active = 1",
          [parentId]
        );
        if (parentCategories.length === 0) {
          return res.status(400).json({ message: "Parent category not found" });
        }
      }

      await pool.execute(
        `
      UPDATE categories 
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          image_url = COALESCE(?, image_url),
          parent_id = COALESCE(?, parent_id)
      WHERE id = ?
    `,
        [name, description, imageUrl, parentId, categoryId]
      );

      res.json({ message: "Category updated successfully" });
    } catch (error) {
      console.error("Update category error:", error);
      res.status(500).json({ message: "Server error while updating category" });
    }
  }
);

// Delete category (Admin only)
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
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
      "SELECT id FROM products WHERE category_id = ? AND is_active = 1",
      [categoryId]
    );
    if (products.length > 0) {
      return res
        .status(400)
        .json({ message: "Cannot delete category with active products" });
    }

    // Check if category has subcategories
    const [subcategories] = await pool.execute(
      "SELECT id FROM categories WHERE parent_id = ? AND is_active = 1",
      [categoryId]
    );
    if (subcategories.length > 0) {
      return res
        .status(400)
        .json({ message: "Cannot delete category with subcategories" });
    }

    // Soft delete
    await pool.execute("UPDATE categories SET is_active = 0 WHERE id = ?", [
      categoryId,
    ]);

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ message: "Server error while deleting category" });
  }
});

module.exports = router;
