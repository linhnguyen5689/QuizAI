const emailConfig = require('../config');
const generateVerificationEmailTemplate = require('../templates/verification');
const generatePasswordResetTemplate = require('../templates/passwordReset');

/**
 * Send a verification email to a newly registered user
 * @param {string} email - User's email address
 * @param {string} username - User's username
 * @param {string} verificationToken - Email verification token
 * @returns {Promise<boolean>} - True if email sent successfully
 */
const sendVerificationEmail = async (email, username, verificationToken) => {
  // Get CLIENT_URL from environment variables or use default
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const verificationLink = `${clientUrl}/verify-email?token=${verificationToken}`;

  const emailParams = {
    sender: emailConfig.defaultSender,
    to: [{ email, name: username }],
    subject: 'Verify Your Email Address',
    htmlContent: generateVerificationEmailTemplate(username, verificationLink)
  };

  try {
    console.log('Attempting to send verification email to:', email);
    const response = await emailConfig.apiInstance.sendTransacEmail(emailParams);
    console.log('Verification email sent successfully:', response);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    if (error.response) {
      console.error('API Response Error:', error.response.body || error.response.data);
    }
    // Don't throw the error anymore, just log it
    return false;
  }
};

/**
 * Send a password reset email
 * @param {string} email - User's email address
 * @param {string} username - User's username
 * @param {string} resetToken - Password reset token
 * @returns {Promise<boolean>} - True if email sent successfully
 */
const sendPasswordResetEmail = async (email, username, resetToken) => {
  // Get CLIENT_URL from environment variables or use default
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;

  const emailParams = {
    sender: emailConfig.defaultSender,
    to: [{ email, name: username }],
    subject: 'Reset Your Password',
    htmlContent: generatePasswordResetTemplate(username, resetLink)
  };

  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Attempting to send password reset email to: ${email}`);
    }

    const response = await emailConfig.apiInstance.sendTransacEmail(emailParams);

    if (process.env.NODE_ENV !== 'production') {
      console.log(`Password reset email sent successfully to: ${email}`);
    }

    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error.message);
    if (error.response) {
      console.error('API Response Error:', error.response.statusCode || 'Unknown Status');
    }
    // Don't throw the error anymore, just log it
    return false;
  }
};

/**
 * Send a welcome email after successful verification
 * @param {string} email - User's email address
 * @param {string} username - User's username
 * @returns {Promise<boolean>} - True if email sent successfully
 */
const sendWelcomeEmail = async (email, username) => {
  const emailParams = {
    sender: emailConfig.defaultSender,
    to: [{ email, name: username }],
    subject: 'Welcome to Quiz Web!',
    htmlContent: `
      <h1>Welcome to Quiz Web!</h1>
      <p>Hi ${username},</p>
      <p>Thank you for verifying your email address. Your account is now active.</p>
      <p>You can now create and take quizzes on our platform.</p>
      <p>Happy learning!</p>
    `
  };

  try {
    console.log('Attempting to send welcome email to:', email);
    const response = await emailConfig.apiInstance.sendTransacEmail(emailParams);
    console.log('Welcome email sent successfully:', response);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    if (error.response) {
      console.error('API Response Error:', error.response.body || error.response.data);
    }
    // Don't throw error for welcome email as it's not critical
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail
}; 