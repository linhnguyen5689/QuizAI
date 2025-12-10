const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes that require authentication
 */
const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      const user = await User.findById(decoded.userId).select('-passwordHash');
      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Add user to request object
      req.user = user;

      // Đảm bảo _id được chuyển đúng dạng string để so sánh
      if (req.user._id) {
        req.user._id = req.user._id.toString();
      }

      next();
    } catch (error) {
      console.error('Auth error:', error);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: 'Not authorized, token failed',
          isTokenExpired: true
        });
      }
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

/**
 * Middleware to check if user is admin (using accountType)
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.accountType === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied, admin only' });
  }
};

module.exports = { protect, isAdmin };