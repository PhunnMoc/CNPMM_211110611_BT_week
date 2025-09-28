const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const pool = require("../config/database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Register
router.post(
  "/register",
  [
    body("username")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password, firstName, lastName, phone } =
        req.body;

      // Check if user already exists
      const [existingUsers] = await pool.execute(
        "SELECT id FROM users WHERE email = ? OR username = ?",
        [email, username]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const [result] = await pool.execute(
        "INSERT INTO users (username, email, password_hash, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?, ?)",
        [username, email, hashedPassword, firstName, lastName, phone || null]
      );

      // Generate JWT token
      const token = jwt.sign(
        { userId: result.insertId, email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.status(201).json({
        message: "User created successfully",
        token,
        user: {
          id: result.insertId,
          username,
          email,
          firstName,
          lastName,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Server error during registration" });
    }
  }
);

// Login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const [users] = await pool.execute(
        "SELECT id, username, email, password_hash, first_name, last_name, is_active, is_admin FROM users WHERE email = ?",
        [email]
      );

      if (users.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const user = users[0];

      if (!user.is_active) {
        return res.status(401).json({ message: "Account is deactivated" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(
        password,
        user.password_hash
      );
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          isAdmin: user.is_admin,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error during login" });
    }
  }
);

// Get current user
router.get("/me", authenticateToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        firstName: req.user.first_name,
        lastName: req.user.last_name,
        isAdmin: req.user.is_admin,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Logout (client-side token removal)
router.post("/logout", (req, res) => {
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
