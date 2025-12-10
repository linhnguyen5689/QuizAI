// Environment variables configuration example
// Rename this file to .env in your production environment

// Database
MONGODB_URI = your_mongodb_connection_string

// JWT
JWT_SECRET = your_jwt_secret
JWT_EXPIRE = '7d'

// Email
EMAIL_HOST = your_email_host
EMAIL_PORT = your_email_port
EMAIL_USER = your_email_user
EMAIL_PASS = your_email_password
EMAIL_FROM = your_email_address

// Server
PORT = 5000
NODE_ENV = production

// Google Gemini API - REQUIRED for AI quiz generation
// Get your API key from https://ai.google.dev/
GOOGLE_GEMINI_KEY = your_gemini_api_key 