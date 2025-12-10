const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getUserAchievements, updateAchievement, checkUserAchievements } = require('../controllers/achievementController');

// Get user achievements
router.get('/', protect, getUserAchievements);

// Manual check for user achievements
router.post('/check', protect, checkUserAchievements);

// Update achievement
router.patch('/:id', protect, updateAchievement);

module.exports = router;