const express = require("express");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const pool = require("../config/database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Get user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        id, username, email, first_name, last_name, phone, avatar_url,
        is_admin, created_at, updated_at
      FROM users 
      WHERE id = ? AND is_active = 1
    `;

    const [users] = await pool.execute(query, [userId]);

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      avatarUrl: user.avatar_url,
      isAdmin: user.is_admin,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error while fetching profile" });
  }
});

// Update user profile
router.put(
  "/profile",
  authenticateToken,
  [
    body("firstName")
      .optional()
      .notEmpty()
      .withMessage("First name cannot be empty"),
    body("lastName")
      .optional()
      .notEmpty()
      .withMessage("Last name cannot be empty"),
    body("phone")
      .optional()
      .isLength({ min: 10 })
      .withMessage("Phone number must be at least 10 characters"),
    body("avatarUrl").optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.id;
      const { firstName, lastName, phone, avatarUrl } = req.body;

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
      if (phone !== undefined) {
        updateFields.push("phone = ?");
        updateValues.push(phone);
      }
      if (avatarUrl !== undefined) {
        updateFields.push("avatar_url = ?");
        updateValues.push(avatarUrl);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ message: "No fields to update" });
      }

      updateValues.push(userId);

      await pool.execute(
        `
      UPDATE users 
      SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
        updateValues
      );

      res.json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Server error while updating profile" });
    }
  }
);

// Change password
router.put(
  "/change-password",
  authenticateToken,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      // Get current password hash
      const [users] = await pool.execute(
        "SELECT password_hash FROM users WHERE id = ?",
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        users[0].password_hash
      );
      if (!isValidPassword) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }

      // Hash new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await pool.execute(
        "UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [hashedPassword, userId]
      );

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ message: "Server error while changing password" });
    }
  }
);

// Get user addresses
router.get("/addresses", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        id, type, first_name, last_name, company, address_line_1, 
        address_line_2, city, state, postal_code, country, phone, 
        is_default, created_at
      FROM user_addresses 
      WHERE user_id = ?
      ORDER BY is_default DESC, created_at DESC
    `;

    const [addresses] = await pool.execute(query, [userId]);
    res.json(addresses);
  } catch (error) {
    console.error("Get addresses error:", error);
    res.status(500).json({ message: "Server error while fetching addresses" });
  }
});

// Add user address
router.post(
  "/addresses",
  authenticateToken,
  [
    body("type")
      .isIn(["shipping", "billing"])
      .withMessage("Type must be shipping or billing"),
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
    body("addressLine1").notEmpty().withMessage("Address line 1 is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("state").notEmpty().withMessage("State is required"),
    body("postalCode").notEmpty().withMessage("Postal code is required"),
    body("country").notEmpty().withMessage("Country is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.id;
      const {
        type,
        firstName,
        lastName,
        company,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
        phone,
        isDefault = false,
      } = req.body;

      // If this is set as default, unset other defaults of the same type
      if (isDefault) {
        await pool.execute(
          "UPDATE user_addresses SET is_default = 0 WHERE user_id = ? AND type = ?",
          [userId, type]
        );
      }

      const [result] = await pool.execute(
        `
      INSERT INTO user_addresses (
        user_id, type, first_name, last_name, company, address_line_1,
        address_line_2, city, state, postal_code, country, phone, is_default
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
        [
          userId,
          type,
          firstName,
          lastName,
          company || null,
          addressLine1,
          addressLine2 || null,
          city,
          state,
          postalCode,
          country,
          phone || null,
          isDefault,
        ]
      );

      res.status(201).json({
        message: "Address added successfully",
        addressId: result.insertId,
      });
    } catch (error) {
      console.error("Add address error:", error);
      res.status(500).json({ message: "Server error while adding address" });
    }
  }
);

// Update user address
router.put(
  "/addresses/:id",
  authenticateToken,
  [
    body("firstName")
      .optional()
      .notEmpty()
      .withMessage("First name cannot be empty"),
    body("lastName")
      .optional()
      .notEmpty()
      .withMessage("Last name cannot be empty"),
    body("addressLine1")
      .optional()
      .notEmpty()
      .withMessage("Address line 1 cannot be empty"),
    body("city").optional().notEmpty().withMessage("City cannot be empty"),
    body("state").optional().notEmpty().withMessage("State cannot be empty"),
    body("postalCode")
      .optional()
      .notEmpty()
      .withMessage("Postal code cannot be empty"),
    body("country")
      .optional()
      .notEmpty()
      .withMessage("Country cannot be empty"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.id;
      const addressId = req.params.id;
      const {
        firstName,
        lastName,
        company,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
        phone,
        isDefault,
      } = req.body;

      // Check if address exists and belongs to user
      const [addresses] = await pool.execute(
        "SELECT id, type FROM user_addresses WHERE id = ? AND user_id = ?",
        [addressId, userId]
      );

      if (addresses.length === 0) {
        return res.status(404).json({ message: "Address not found" });
      }

      // If this is set as default, unset other defaults of the same type
      if (isDefault) {
        await pool.execute(
          "UPDATE user_addresses SET is_default = 0 WHERE user_id = ? AND type = ? AND id != ?",
          [userId, addresses[0].type, addressId]
        );
      }

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
      if (company !== undefined) {
        updateFields.push("company = ?");
        updateValues.push(company);
      }
      if (addressLine1 !== undefined) {
        updateFields.push("address_line_1 = ?");
        updateValues.push(addressLine1);
      }
      if (addressLine2 !== undefined) {
        updateFields.push("address_line_2 = ?");
        updateValues.push(addressLine2);
      }
      if (city !== undefined) {
        updateFields.push("city = ?");
        updateValues.push(city);
      }
      if (state !== undefined) {
        updateFields.push("state = ?");
        updateValues.push(state);
      }
      if (postalCode !== undefined) {
        updateFields.push("postal_code = ?");
        updateValues.push(postalCode);
      }
      if (country !== undefined) {
        updateFields.push("country = ?");
        updateValues.push(country);
      }
      if (phone !== undefined) {
        updateFields.push("phone = ?");
        updateValues.push(phone);
      }
      if (isDefault !== undefined) {
        updateFields.push("is_default = ?");
        updateValues.push(isDefault);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ message: "No fields to update" });
      }

      updateValues.push(addressId);

      await pool.execute(
        `
      UPDATE user_addresses 
      SET ${updateFields.join(", ")}
      WHERE id = ?
    `,
        updateValues
      );

      res.json({ message: "Address updated successfully" });
    } catch (error) {
      console.error("Update address error:", error);
      res.status(500).json({ message: "Server error while updating address" });
    }
  }
);

// Delete user address
router.delete("/addresses/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    const [result] = await pool.execute(
      "DELETE FROM user_addresses WHERE id = ? AND user_id = ?",
      [addressId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.json({ message: "Address deleted successfully" });
  } catch (error) {
    console.error("Delete address error:", error);
    res.status(500).json({ message: "Server error while deleting address" });
  }
});

// Get user wishlist
router.get("/wishlist", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        w.id,
        p.id as product_id,
        p.name,
        p.price,
        p.discount_price,
        p.sku,
        pi.image_url as image,
        w.created_at
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
      WHERE w.user_id = ? AND p.is_active = 1
      ORDER BY w.created_at DESC
    `;

    const [wishlist] = await pool.execute(query, [userId]);
    res.json(wishlist);
  } catch (error) {
    console.error("Get wishlist error:", error);
    res.status(500).json({ message: "Server error while fetching wishlist" });
  }
});

// Add to wishlist
router.post(
  "/wishlist",
  authenticateToken,
  [body("productId").isInt().withMessage("Product ID must be a valid integer")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.id;
      const { productId } = req.body;

      // Check if product exists
      const [products] = await pool.execute(
        "SELECT id FROM products WHERE id = ? AND is_active = 1",
        [productId]
      );

      if (products.length === 0) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Check if already in wishlist
      const [existing] = await pool.execute(
        "SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?",
        [userId, productId]
      );

      if (existing.length > 0) {
        return res.status(400).json({ message: "Product already in wishlist" });
      }

      await pool.execute(
        "INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)",
        [userId, productId]
      );

      res.json({ message: "Product added to wishlist" });
    } catch (error) {
      console.error("Add to wishlist error:", error);
      res
        .status(500)
        .json({ message: "Server error while adding to wishlist" });
    }
  }
);

// Remove from wishlist
router.delete("/wishlist/:productId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;

    const [result] = await pool.execute(
      "DELETE FROM wishlist WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found in wishlist" });
    }

    res.json({ message: "Product removed from wishlist" });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    res
      .status(500)
      .json({ message: "Server error while removing from wishlist" });
  }
});

// Get user points balance
router.get("/points", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [[row]] = await pool.execute(
      "SELECT balance FROM user_points WHERE user_id = ?",
      [userId]
    );
    res.json({ balance: Number(row?.balance || 0) });
  } catch (error) {
    console.error("Get points error:", error);
    res.status(500).json({ message: "Server error while fetching points" });
  }
});

// Get user's coupons (optionally only available ones)
router.get("/coupons", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const onlyAvailable = (req.query.onlyAvailable ?? "1") === "1";
    const provisionIfEmpty = (req.query.provisionIfEmpty ?? "1") === "1";

    let where = "WHERE uc.user_id = ?";
    const params = [userId];
    if (onlyAvailable) {
      where +=
        " AND uc.is_redeemed = 0 AND c.is_active = 1 AND (c.expires_at IS NULL OR c.expires_at > CURRENT_TIMESTAMP)";
    }

    let [rows] = await pool.execute(
      `SELECT c.code, c.description, c.discount_type, c.discount_value, c.min_order_amount, c.expires_at, uc.is_redeemed
       FROM user_coupons uc
       JOIN coupons c ON uc.coupon_id = c.id
       ${where}
       ORDER BY c.expires_at IS NULL DESC, c.expires_at ASC, uc.id DESC`,
      params
    );

    // Auto-provision active coupons to the user if none found
    if (rows.length === 0 && provisionIfEmpty) {
      await pool.execute(
        `INSERT IGNORE INTO user_coupons (user_id, coupon_id, granted_reason)
         SELECT ?, c.id, 'auto-provision'
         FROM coupons c
         WHERE c.is_active = 1 AND (c.expires_at IS NULL OR c.expires_at > CURRENT_TIMESTAMP)`,
        [userId]
      );
      // Re-read after provisioning
      [rows] = await pool.execute(
        `SELECT c.code, c.description, c.discount_type, c.discount_value, c.min_order_amount, c.expires_at, uc.is_redeemed
         FROM user_coupons uc
         JOIN coupons c ON uc.coupon_id = c.id
         ${where}
         ORDER BY c.expires_at IS NULL DESC, c.expires_at ASC, uc.id DESC`,
        params
      );
    }

    res.json(rows);
  } catch (error) {
    console.error("Get coupons error:", error);
    res.status(500).json({ message: "Server error while fetching coupons" });
  }
});

module.exports = router;
