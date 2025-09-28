const jwt = require("jsonwebtoken");
const pool = require("../config/database");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify user still exists and is active
    const [users] = await pool.execute(
      "SELECT id, username, email, is_active, is_admin FROM users WHERE id = ? AND is_active = 1",
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "User not found or inactive" });
    }

    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(403).json({ message: "Invalid token" });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user.is_admin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
};
