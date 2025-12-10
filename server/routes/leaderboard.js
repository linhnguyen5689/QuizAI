const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');

// GET /api/leaderboard
router.get('/', (req, res) => {
    console.log('Leaderboard route hit:', req.query); // Debug log
    leaderboardController.getLeaderboard(req, res);
});

module.exports = router;
