const ratingService = require('../services/ratingService');

/**
 * Thêm đánh giá mới hoặc cập nhật đánh giá hiện tại
 * @route POST /api/ratings
 * @access Private
 */
const addRating = async (req, res) => {
    try {
        const { quizId, rating, comment } = req.body;

        if (!quizId || !rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Quiz ID và điểm đánh giá (1-5) là bắt buộc'
            });
        }

        const result = await ratingService.addRating(
            req.user._id,
            quizId,
            { rating, comment }
        );

        res.status(201).json(result);
    } catch (error) {
        console.error('Error adding rating:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Có lỗi xảy ra khi thêm đánh giá'
        });
    }
};

/**
 * Lấy danh sách đánh giá cho một quiz
 * @route GET /api/ratings/quiz/:quizId
 * @access Public
 */
const getQuizRatings = async (req, res) => {
    try {
        const result = await ratingService.getQuizRatings(req.params.quizId);
        res.json(result);
    } catch (error) {
        console.error('Error getting quiz ratings:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy danh sách đánh giá'
        });
    }
};

/**
 * Lấy danh sách đánh giá của người dùng hiện tại
 * @route GET /api/ratings/user
 * @access Private
 */
const getUserRatings = async (req, res) => {
    try {
        const result = await ratingService.getUserRatings(req.user._id);
        res.json(result);
    } catch (error) {
        console.error('Error getting user ratings:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy danh sách đánh giá'
        });
    }
};

/**
 * Xóa đánh giá
 * @route DELETE /api/ratings/:id
 * @access Private
 */
const deleteRating = async (req, res) => {
    try {
        const result = await ratingService.deleteRating(req.params.id, req.user._id);
        res.json(result);
    } catch (error) {
        console.error('Error deleting rating:', error);

        if (error.message === 'Rating not found') {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đánh giá'
            });
        }

        if (error.message === 'Not authorized to delete this rating') {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền xóa đánh giá này'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi xóa đánh giá'
        });
    }
};

module.exports = {
    addRating,
    getQuizRatings,
    getUserRatings,
    deleteRating
}; 