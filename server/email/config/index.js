const SibApiV3Sdk = require("sib-api-v3-sdk");
require("dotenv").config();

// Initialize the Brevo API client
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

// Email configuration
const emailConfig = {
  defaultSender: {
    email: "nhatanhkof@gmail.com",
    name: "Quiz Web Admin",
  },
  apiInstance: new SibApiV3Sdk.TransactionalEmailsApi(),
  // Link expiry times (in milliseconds)
  tokenExpiry: {
    verification: 24 * 60 * 60 * 1000, // 24 hours
    passwordReset: 60 * 60 * 1000, // 1 hour
  },
};

module.exports = emailConfig;
