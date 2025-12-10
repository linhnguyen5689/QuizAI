/**
 * Generates a password reset email HTML template
 * @param {string} username - The user's username
 * @param {string} resetLink - The password reset link
 * @returns {string} HTML content of the password reset email
 */
const generatePasswordResetTemplate = (username, resetLink) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            text-align: center;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
            margin-bottom: 20px;
          }
          .btn {
            display: inline-block;
            padding: 10px 20px;
            margin: 20px 0;
            background-color: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 4px;
          }
          .warning {
            color: #e74c3c;
            font-weight: bold;
          }
          .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #777;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <p>Hi ${username},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center;">
            <a href="${resetLink}" class="btn">Reset Password</a>
          </div>
          <p>If the button doesn't work, you can also click on the link below:</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p class="warning">This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Quiz Web. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };
  
  module.exports = generatePasswordResetTemplate; 