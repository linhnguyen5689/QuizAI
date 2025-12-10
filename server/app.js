const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const config = require('./config/env');

// Import routes
const leaderboardRoutes = require('./routes/leaderboard');
const quizRoutes = require('./routes/quizRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const port = config.PORT || 5000;

// Debug middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, {
        query: req.query,
        body: req.body,
        headers: req.headers
    });
    next();
});

// CORS configuration
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', process.env.FRONTEND_URL],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// API Routes
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/users', userRoutes);

console.log('Registered routes: leaderboard, quizzes, users');

// Serve static assets if in production
if (config.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.send('API is running....');
    });
}

app.listen(port, () => {
    console.log(`Server is running on port: ${port} in ${config.NODE_ENV} mode`);
    console.log(`Gemini API Key status: ${config.GOOGLE_GEMINI_KEY ? 'Configured' : 'NOT CONFIGURED'}`);
});