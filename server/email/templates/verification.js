/**
 * Generates a verification email HTML template
 * @param {string} username - The user's username
 * @param {string} verificationLink - The verification link
 * @returns {string} HTML content of the verification email
 */
const generateVerificationEmailTemplate = (username, verificationLink) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
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
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 4px;
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
            <h1>Welcome to Quiz Web!</h1>
          </div>
          <p>Hi ${username},</p>
          <p>Thank you for registering. Please click the button below to verify your email address:</p>
          <div style="text-align: center;">
            <a href="${verificationLink}" class="btn">Verify Email Address</a>
          </div>
          <p>If the button doesn't work, you can also click on the link below:</p>
          <p><a href="${verificationLink}">${verificationLink}</a></p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Quiz Web. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };
  
  module.exports = generateVerificationEmailTemplate; 