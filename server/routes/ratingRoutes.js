const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/ratings - Thêm hoặc cập nhật đánh giá
router.post('/', protect, ratingController.addRating);

// GET /api/ratings/quiz/:quizId - Lấy đánh giá cho một quiz
router.get('/quiz/:quizId', ratingController.getQuizRatings);

// GET /api/ratings/user - Lấy đánh giá của người dùng hiện tại
router.get('/user', protect, ratingController.getUserRatings);

// DELETE /api/ratings/:id - Xóa đánh giá
router.delete('/:id', protect, ratingController.deleteRating);

module.exports = router; 