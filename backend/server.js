const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const http = require("http");
require("dotenv").config();
const { ensureProductIndex } = require("./services/elasticsearch");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const categoryRoutes = require("./routes/categories");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");
const userRoutes = require("./routes/users");
const reviewRoutes = require("./routes/reviews");
const notificationRoutes = require("./routes/notifications");
const statisticsRoutes = require("./routes/statistics");
const adminRoutes = require("./routes/admin");

// Import Socket.IO server
const SocketServer = require("./socket/socketServer");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const isDev = process.env.NODE_ENV !== "production";

// Initialize Socket.IO server
const socketServer = new SocketServer(server);

// Make socket server available to routes
app.set("socketServer", socketServer);

// Behind Next.js proxy in dev
app.set("trust proxy", 1);

// Security middleware
app.use(helmet());

// Rate limiting (relaxed in development)
const limiter = rateLimit({
  windowMs: isDev ? 60 * 1000 : 15 * 60 * 1000,
  max: isDev ? 1000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later.",
});
// Apply limiter only to API routes
app.use("/api", limiter);

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/statistics", statisticsRoutes);
app.use("/api/admin", adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`WebSocket server is running on ws://localhost:${PORT}`);
  // Initialize Elasticsearch index if available
  ensureProductIndex().catch((e) =>
    console.warn("Elasticsearch index init warning:", e.message)
  );
});
