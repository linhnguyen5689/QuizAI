const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Register user
const register = async (req, res) => {
    try {
        const { username, email, password, displayName } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
        });

        if (existingUser) {
            if (existingUser.email === email.toLowerCase()) {
                return res.status(400).json({ message: "Email already in use" });
            }
            return res.status(400).json({ message: "Username already taken" });
        }

        // Create user
        const user = await User.create({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            passwordHash: password,
            displayName: displayName || username,
        });

        // Generate verification token
        const verificationToken = await user.generateVerificationToken();

        // Send verification email
        const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
        await sendEmail(
            user.email,
            "Verify Your Email",
            `Please click the link to verify your email: ${verificationUrl}`
        );

        res.status(201).json({
            message: "User registered successfully. Please check your email to verify your account.",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: "Please provide email and password" });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Update login streak
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set time to 00:00:00

        console.log('Previous login date:', user.lastLoginDate);
        console.log('Current login date:', today);

        // Check if this is a new login day
        if (user.lastLoginDate) {
            const lastLogin = new Date(user.lastLoginDate);
            lastLogin.setHours(0, 0, 0, 0);

            console.log('Comparing dates:', {
                lastLogin: lastLogin.toISOString(),
                today: today.toISOString(),
                yesterday: new Date(today.getTime() - 86400000).toISOString()
            });

            // If not logging in on the same day as last login
            if (lastLogin.getTime() !== today.getTime()) {
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                yesterday.setHours(0, 0, 0, 0);

                if (lastLogin.getTime() === yesterday.getTime()) {
                    // Consecutive login - increase streak
                    user.loginStreak += 1;
                    console.log(`Increased streak for user ${user.username} to ${user.loginStreak}`);
                } else {
                    // Missed a day - reset streak to 1
                    console.log(`Reset streak for user ${user.username} from ${user.loginStreak} to 1 (last login: ${lastLogin.toISOString()})`);
                    user.loginStreak = 1;
                }
            }
        } else {
            // First time login
            console.log(`First login for user ${user.username}, setting streak to 1`);
            user.loginStreak = 1;
        }

        // Update login timestamps
        user.lastLogin = new Date();
        user.lastLoginDate = today;

        console.log(`User ${user.username} login streak updated to: ${user.loginStreak}`);
        await user.save();

        // Generate JWT token
        const token = generateToken(user._id);

        res.json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                displayName: user.displayName || user.username,
                profilePicture: user.profilePicture,
                accountType: user.accountType,
                loginStreak: user.loginStreak
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-passwordHash');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Verify email
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).json({ message: "Invalid verification token" });
        }

        if (user.isActive) {
            return res.status(400).json({ message: "Email already verified" });
        }

        // Check if token is expired
        if (user.verificationTokenExpiry < new Date()) {
            return res.status(400).json({ message: "Verification token expired" });
        }

        // Activate user
        user.isActive = true;
        user.verificationToken = null;
        user.verificationTokenExpiry = null;
        user.lastUsedVerificationToken = token;
        await user.save();

        res.json({ message: "Email verified successfully" });
    } catch (error) {
        console.error("Email verification error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Request password reset
const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordTokenExpiry = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send reset email
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        await sendEmail(
            user.email,
            "Reset Your Password",
            `Please click the link to reset your password: ${resetUrl}`
        );

        res.json({ message: "Password reset email sent" });
    } catch (error) {
        console.error("Password reset request error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Reset password
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordTokenExpiry: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        // Update password
        user.passwordHash = newPassword;
        user.resetPasswordToken = null;
        user.resetPasswordTokenExpiry = null;
        await user.save();

        res.json({ message: "Password reset successful" });
    } catch (error) {
        console.error("Password reset error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const { displayName, password } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update fields
        if (displayName) user.displayName = displayName;
        if (password) user.passwordHash = password;

        // Handle profile picture upload
        if (req.file) {
            user.profilePicture = req.file.path.replace(/\\/g, '/');
        }

        await user.save();

        res.json({
            message: "Profile updated successfully",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                displayName: user.displayName,
                profilePicture: user.profilePicture,
            },
        });
    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    register,
    login,
    getUserProfile,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
    updateUserProfile,
}; 