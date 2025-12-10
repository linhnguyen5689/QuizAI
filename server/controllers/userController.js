const User = require('../models/User');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');
const crypto = require('crypto');
const emailConfig = require('../email/config');
const emailService = require('../email/service');

// Hàm tạo token ngẫu nhiên
const generateToken = () => crypto.randomBytes(32).toString('hex');

// route POST /api/users/register
const registerUser = async (req, res) => {
  try {
    const result = await userService.registerUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Registration error:', error);
    if (error.message.includes('already registered') || error.message.includes('already taken')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error registering user' });
  }
};

// route POST /api/users/login
const loginUser = async (req, res) => {
  try {
    const result = await userService.loginUser(req.body.email, req.body.password);
    res.json(result);
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ message: error.message });
  }
};

/**
 * Request password reset
 * @route POST /api/users/request-password-reset
 * @access Public
 */
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // For security reasons, don't reveal if email exists or not
      // Return success even if email doesn't exist
      return res.json({ message: 'Password reset email sent if account exists' });
    }

    // Generate reset token
    const resetPasswordToken = generateToken();
    const resetPasswordTokenExpiry = new Date(Date.now() + (emailConfig.tokenExpiry?.passwordReset || 3600000)); // 1 hour

    // Update user
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordTokenExpiry = resetPasswordTokenExpiry;
    await user.save();

    // For development only - should be removed in production
    if (process.env.NODE_ENV !== 'production') {
      console.log('Reset link generated successfully (details hidden for security)');
    }

    // Try to send email, but don't require success
    try {
      if (process.env.BREVO_API_KEY) {
        await emailService.sendPasswordResetEmail(email, user.username, resetPasswordToken);
        console.log('Password reset email sent to:', email);
      } else {
        console.log('Skipping email sending: BREVO_API_KEY not configured');
      }
    } catch (emailError) {
      console.error('Error sending password reset email (non-fatal):', emailError.message);
    }

    res.json({ message: 'Password reset email sent if account exists' });
  } catch (error) {
    console.error('Password reset request error:', error.message);
    res.status(500).json({ message: 'Error requesting password reset' });
  }
};

/**
 * Reset password
 * @route POST /api/users/reset-password
 * @access Public
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password
    user.passwordHash = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpiry = null;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
};

// get userprofile GET /api/users/profile
const getUserProfile = async (req, res) => {
  try {
    const user = await userService.getUserProfile(req.user.userId);
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(404).json({ message: error.message });
  }
};

// update userprofile PUT /api/users/profile
const updateUserProfile = async (req, res) => {
  try {
    const result = await userService.updateUserProfile(req.user.userId, req.body);
    res.json(result);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * Verify email
 * @route GET /api/users/verify-email/:token
 * @access Public
 */
const verifyEmail = async (req, res) => {
  try {
    const result = await userService.verifyEmail(req.params.token);
    // Return JSON response instead of redirecting
    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Verification error:', error);
    // Return error as JSON
    res.status(400).json({
      success: false,
      message: error.message || 'Email verification failed'
    });
  }
};

/**
 * Search users by displayName or username
 * @route GET /api/users/search?query=abc
 * @access Private
 */
const searchUsers = async (req, res) => {
  try {
    const query = req.query.query?.trim();
    if (!query) return res.json([]);
    // Không trả về chính mình
    const users = await User.find({
      $and: [
        {
          $or: [
            { displayName: { $regex: query, $options: 'i' } },
            { username: { $regex: query, $options: 'i' } }
          ]
        },
        { _id: { $ne: req.user.userId } }
      ]
    }).select('_id username displayName email profilePicture');
    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Error searching users' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  verifyEmail,
  searchUsers
};