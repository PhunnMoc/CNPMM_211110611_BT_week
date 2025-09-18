const express = require("express");
const { body, validationResult } = require("express-validator");
const pool = require("../config/database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Get user's cart
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        ci.id,
        ci.quantity,
        p.id as product_id,
        p.name,
        p.price,
        p.discount_price,
        p.sku,
        p.stock_quantity,
        pi.image_url as image
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
      WHERE ci.user_id = ? AND p.is_active = 1
      ORDER BY ci.created_at DESC
    `;

    const [cartItems] = await pool.execute(query, [userId]);

    // Calculate totals
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce((sum, item) => {
      const price = item.discount_price || item.price;
      return sum + price * item.quantity;
    }, 0);

    res.json({
      items: cartItems,
      totalItems,
      totalPrice: parseFloat(totalPrice.toFixed(2)),
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ message: "Server error while fetching cart" });
  }
});

// Add item to cart
router.post(
  "/add",
  authenticateToken,
  [
    body("productId").isInt().withMessage("Product ID must be a valid integer"),
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.id;
      const { productId, quantity } = req.body;

      // Check if product exists and is active
      const [products] = await pool.execute(
        "SELECT id, stock_quantity FROM products WHERE id = ? AND is_active = 1",
        [productId]
      );

      if (products.length === 0) {
        return res.status(404).json({ message: "Product not found" });
      }

      const product = products[0];

      // Check stock availability
      if (product.stock_quantity < quantity) {
        return res.status(400).json({
          message: `Only ${product.stock_quantity} items available in stock`,
        });
      }

      // Check if item already exists in cart
      const [existingItems] = await pool.execute(
        "SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?",
        [userId, productId]
      );

      if (existingItems.length > 0) {
        // Update existing item
        const newQuantity = existingItems[0].quantity + quantity;

        if (newQuantity > product.stock_quantity) {
          return res.status(400).json({
            message: `Cannot add ${quantity} items. Only ${
              product.stock_quantity - existingItems[0].quantity
            } more available`,
          });
        }

        await pool.execute("UPDATE cart_items SET quantity = ? WHERE id = ?", [
          newQuantity,
          existingItems[0].id,
        ]);
      } else {
        // Add new item
        await pool.execute(
          "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)",
          [userId, productId, quantity]
        );
      }

      res.json({ message: "Item added to cart successfully" });
    } catch (error) {
      console.error("Add to cart error:", error);
      res
        .status(500)
        .json({ message: "Server error while adding item to cart" });
    }
  }
);

// Update cart item quantity
router.put(
  "/update",
  authenticateToken,
  [
    body("itemId").isInt().withMessage("Item ID must be a valid integer"),
    body("quantity")
      .isInt({ min: 0 })
      .withMessage("Quantity must be non-negative"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.id;
      const { itemId, quantity } = req.body;

      if (quantity === 0) {
        // Remove item from cart
        await pool.execute(
          "DELETE FROM cart_items WHERE id = ? AND user_id = ?",
          [itemId, userId]
        );
        return res.json({ message: "Item removed from cart" });
      }

      // Check if item exists and belongs to user
      const [items] = await pool.execute(
        "SELECT ci.id, ci.quantity, p.stock_quantity FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.id = ? AND ci.user_id = ?",
        [itemId, userId]
      );

      if (items.length === 0) {
        return res.status(404).json({ message: "Cart item not found" });
      }

      // Check stock availability
      if (quantity > items[0].stock_quantity) {
        return res.status(400).json({
          message: `Only ${items[0].stock_quantity} items available in stock`,
        });
      }

      // Update quantity
      await pool.execute(
        "UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?",
        [quantity, itemId, userId]
      );

      res.json({ message: "Cart updated successfully" });
    } catch (error) {
      console.error("Update cart error:", error);
      res.status(500).json({ message: "Server error while updating cart" });
    }
  }
);

// Remove item from cart
router.delete("/remove/:itemId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.itemId;

    const [result] = await pool.execute(
      "DELETE FROM cart_items WHERE id = ? AND user_id = ?",
      [itemId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.json({ message: "Item removed from cart successfully" });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res
      .status(500)
      .json({ message: "Server error while removing item from cart" });
  }
});

// Clear entire cart
router.delete("/clear", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.execute("DELETE FROM cart_items WHERE user_id = ?", [userId]);

    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ message: "Server error while clearing cart" });
  }
});

// Get cart count
router.get("/count", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [result] = await pool.execute(
      "SELECT SUM(quantity) as count FROM cart_items WHERE user_id = ?",
      [userId]
    );

    const count = result[0].count || 0;
    res.json({ count });
  } catch (error) {
    console.error("Get cart count error:", error);
    res.status(500).json({ message: "Server error while getting cart count" });
  }
});

module.exports = router;
