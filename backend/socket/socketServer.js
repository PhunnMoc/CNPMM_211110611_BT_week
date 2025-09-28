const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

class SocketServer {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.connectedUsers = new Map(); // userId -> socketId mapping
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    // Authentication middleware for WebSocket connections
    this.io.use(async (socket, next) => {
      try {
        const token =
          socket.handshake.auth.token ||
          socket.handshake.headers.authorization?.split(" ")[1];

        if (!token) {
          return next(new Error("Authentication error: No token provided"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Verify user still exists and is active
        const [users] = await pool.execute(
          "SELECT id, username, email, is_active FROM users WHERE id = ? AND is_active = 1",
          [decoded.userId]
        );

        if (users.length === 0) {
          return next(
            new Error("Authentication error: User not found or inactive")
          );
        }

        socket.userId = decoded.userId;
        socket.user = users[0];
        next();
      } catch (error) {
        console.error("WebSocket authentication error:", error.message);
        next(new Error("Authentication error: Invalid token"));
      }
    });
  }

  setupEventHandlers() {
    this.io.on("connection", (socket) => {
      console.log(
        `User ${socket.user.username} (ID: ${socket.userId}) connected via WebSocket`
      );

      // Store user connection
      this.connectedUsers.set(socket.userId, socket.id);

      // Handle user joining their personal room
      socket.join(`user_${socket.userId}`);

      // Handle admin joining admin room
      if (socket.user.is_admin) {
        socket.join("admin_room");
        console.log(`Admin ${socket.user.username} joined admin room`);
      }

      // Handle disconnect
      socket.on("disconnect", () => {
        console.log(`User ${socket.user.username} disconnected`);
        this.connectedUsers.delete(socket.userId);
      });

      // Handle custom events
      socket.on("join_product_room", (productId) => {
        socket.join(`product_${productId}`);
        console.log(
          `User ${socket.user.username} joined product room ${productId}`
        );
      });

      socket.on("leave_product_room", (productId) => {
        socket.leave(`product_${productId}`);
        console.log(
          `User ${socket.user.username} left product room ${productId}`
        );
      });
    });
  }

  // Send notification to specific user
  sendToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  // Send notification to user room (works even if user is offline)
  sendToUserRoom(userId, event, data) {
    this.io.to(`user_${userId}`).emit(event, data);
  }

  // Send notification to all admins
  sendToAdmins(event, data) {
    this.io.to("admin_room").emit(event, data);
  }

  // Send notification to product room
  sendToProductRoom(productId, event, data) {
    this.io.to(`product_${productId}`).emit(event, data);
  }

  // Broadcast to all connected users
  broadcast(event, data) {
    this.io.emit(event, data);
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }
}

module.exports = SocketServer;
