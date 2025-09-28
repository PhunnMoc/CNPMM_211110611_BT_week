const { authenticateToken } = require("./auth");

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  // First authenticate the token
  authenticateToken(req, res, (err) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if user is admin
    if (!req.user || !req.user.is_admin) {
      return res.status(403).json({
        message: "Access denied. Admin privileges required.",
      });
    }

    next();
  });
};

module.exports = { requireAdmin };


