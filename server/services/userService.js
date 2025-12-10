const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../email/service');

//gen random token
const generateToken = () => crypto.randomBytes(32).toString('hex');

const userService = {

    // user register
    async registerUser(userData) {
        const { username, email, password, displayName } = userData;

        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            throw new Error(userExists.email === email ? 'Email already registered' : 'Username already taken');
        }

        // gen verification token
        const verificationToken = generateToken();
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const user = await User.create({
            username,
            email,
            passwordHash: password,
            displayName: displayName || username,
            verificationToken,
            verificationTokenExpiry
        });

        // send verification email
        await emailService.sendVerificationEmail(email, username, verificationToken);

        return {
            message: 'Registration successful. Please check your email to verify your account.',
            userId: user._id
        };


    },

    // user login
    async loginUser(email, password) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Invalid email or password');
        }

        if (!user.isActive) {
            throw new Error('Your account is not active. Please verify your email.');
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }

        user.lastLogin = new Date();
        await user.save();

        // gen JWT token
        const token = jwt.sign(
            { userId: user._id, accountType: user.accountType },
            process.env.JWT_SECRET || 'quiz_secret_key',
            { expiresIn: '24h' }
        );

        return {
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                displayName: user.displayName || user.username,
                accountType: user.accountType,
                profilePicture: user.profilePicture,
                registrationDate: user.registrationDate
            }
        };
    },

    // get user profile
    async getUserProfile(userId) {
        const user = await User.findById(userId).select('-passwordHash');
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    },

    // update user profile
    async updateUserProfile(userId, updateData) {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (updateData.displayName) user.displayName = updateData.displayName;
        if (updateData.profilePicture) user.profilePicture = updateData.profilePicture;

        await user.save();

        return {
            message: 'Profile updated successfully',
            user: {
                displayName: user.displayName,
                profilePicture: user.profilePicture
            }
        };
    },    // verify user email
    async verifyEmail(token) {
        try {
            // First try to find a user that was verified with this token
            const verifiedUser = await User.findOne({
                isActive: true,
                $or: [
                    { verificationToken: token },
                    { lastUsedVerificationToken: token }
                ]
            });

            if (verifiedUser) {
                return {
                    success: true,
                    message: 'Your email is already verified. You can now login to your account.',
                    alreadyVerified: true
                };
            }

            // If not found, look for unverified user with this token
            const user = await User.findOne({ verificationToken: token });

            if (!user) {
                throw new Error('Invalid verification token. Please check your email link or register again.');
            }

            // Check if token is expired
            if (user.verificationTokenExpiry < new Date()) {
                throw new Error('Verification token has expired. Please register again to get a new verification link.');
            } console.log('Updating user verification status...');

            // Store the last used token before clearing it (for duplicate request handling)
            user.lastUsedVerificationToken = user.verificationToken;
            user.verificationToken = null;
            user.verificationTokenExpiry = null;
            user.isActive = true;
            await user.save();

            let welcomeEmailSent = false;

            // Send welcome email since this is the first successful verification
            try {
                console.log('Attempting to send welcome email...');
                welcomeEmailSent = await emailService.sendWelcomeEmail(user.email, user.username);
                console.log('Welcome email status:', welcomeEmailSent ? 'sent' : 'failed');
            } catch (emailError) {
                console.error('Welcome email error:', emailError);
                // Continue even if welcome email fails
            }

            return {
                success: true,
                message: welcomeEmailSent
                    ? 'Email verified successfully. A welcome email has been sent to your inbox.'
                    : 'Email verified successfully. You can now log in to your account.',
                userId: user._id
            };
        } catch (error) {
            console.error('Verification error in service:', error);
            throw error;
        }
    },

    // request password reset
    async requestPasswordReset(email) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }

        const resetPasswordToken = generateToken();
        const resetPasswordTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordTokenExpiry = resetPasswordTokenExpiry;
        await user.save();

        await emailService.sendPasswordResetEmail(email, user.username, resetPasswordToken);

        return { message: 'Password reset email sent' };
    },

    // reset password
    async resetPassword(token, newPassword) {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordTokenExpiry: { $gt: new Date() }
        });

        if (!user) {
            throw new Error('Invalid or expired reset token');
        }

        user.passwordHash = newPassword;
        user.resetPasswordToken = null;
        user.resetPasswordTokenExpiry = null;
        await user.save();

        return { message: 'Password reset successful' };
    }

};

module.exports = userService;