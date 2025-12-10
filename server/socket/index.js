const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Import handlers
const setupRoomHandlers = require('./room');
const setupGameHandlers = require('./game');
const setupChatHandlers = require('./chat');

/**
 * Initialize socket handlers
 * @param {Object} io - Socket.io instance
 * @param {Object} socket - Socket connection
 */
function initializeSocketHandlers(io, socket) {
  // Set up handlers
  setupRoomHandlers(io, socket);
  setupGameHandlers(io, socket);
  setupChatHandlers(io, socket);
}

/**
 * Setup socket.io server
 * @param {Object} server - HTTP server instance
 * @returns {Object} io - Socket.io instance
 */
function setupSocketServer(server) {
  const io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Socket middleware for authentication
  io.use(async (socket, next) => {
    try {
      console.log("Socket handshake auth:", socket.handshake.auth);
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error("Authentication required"));
      }
      
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return next(new Error("User not found"));
      }
      
      // Attach user info to socket
      socket.userId = user._id.toString();
      socket.username = user.username || user.email;
      socket.user = {
        _id: user._id,
        username: user.username,
        email: user.email
      };
      
      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId}`);
    
    // Initialize socket handlers
    initializeSocketHandlers(io, socket);
  });

  return io;
}

module.exports = setupSocketServer; 