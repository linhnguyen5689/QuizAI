const Rating = require('../models/Rating');
const Quiz = require('../models/Quiz');
const mongoose = require('mongoose');

/**
 * Thêm đánh giá mới cho quiz
 * @param {string} userId - ID của người dùng đánh giá
 * @param {string} quizId - ID của quiz được đánh giá
 * @param {object} ratingData - Dữ liệu đánh giá (rating, comment)
 * @returns {Promise<object>} - Thông tin đánh giá đã lưu
 */
const addRating = async (userId, quizId, ratingData) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Kiểm tra xem người dùng đã đánh giá quiz này chưa
        let existingRating = await Rating.findOne({ userId, quizId }).session(session);

        if (existingRating) {
            // Cập nhật đánh giá hiện có
            existingRating.rating = ratingData.rating;

            if (ratingData.comment !== undefined) {
                existingRating.comment = ratingData.comment;
            }

            existingRating.createdAt = Date.now();
            await existingRating.save({ session });
        } else {
            // Tạo đánh giá mới
            existingRating = await Rating.create([{
                userId,
                quizId,
                rating: ratingData.rating,
                comment: ratingData.comment
            }], { session });

            existingRating = existingRating[0];
        }

        // Cập nhật điểm đánh giá trung bình và số lượng đánh giá cho quiz
        const ratings = await Rating.find({ quizId }).session(session);
        const totalRatings = ratings.length;
        const averageRating = totalRatings > 0
            ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings
            : 0;

        // Cập nhật quiz
        await Quiz.findByIdAndUpdate(
            quizId,
            {
                averageRating: Number(averageRating.toFixed(1)),
                ratingsCount: totalRatings
            },
            { session }
        );

        await session.commitTransaction();

        // Populate thông tin người dùng
        await existingRating.populate('userId', 'fullName avatar');

        return {
            success: true,
            data: existingRating
        };
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

/**
 * Lấy danh sách đánh giá cho một quiz
 * @param {string} quizId - ID của quiz
 * @returns {Promise<Array>} - Danh sách đánh giá
 */
const getQuizRatings = async (quizId) => {
    try {
        const ratings = await Rating.find({ quizId })
            .populate('userId', 'fullName avatar')
            .sort({ createdAt: -1 });

        const quizData = await Quiz.findById(quizId).select('averageRating ratingsCount');

        return {
            success: true,
            data: {
                ratings,
                averageRating: quizData.averageRating,
                ratingsCount: quizData.ratingsCount
            }
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Lấy tất cả đánh giá của một người dùng
 * @param {string} userId - ID của người dùng
 * @returns {Promise<Array>} - Danh sách đánh giá
 */
const getUserRatings = async (userId) => {
    try {
        const ratings = await Rating.find({ userId })
            .populate('quizId', 'title')
            .sort({ createdAt: -1 });

        return {
            success: true,
            data: ratings
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Xóa đánh giá
 * @param {string} ratingId - ID của đánh giá
 * @param {string} userId - ID của người dùng
 * @returns {Promise<object>} - Kết quả xóa
 */
const deleteRating = async (ratingId, userId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Tìm đánh giá
        const rating = await Rating.findById(ratingId).session(session);

        if (!rating) {
            throw new Error('Rating not found');
        }

        // Kiểm tra quyền xóa
        if (rating.userId.toString() !== userId.toString()) {
            throw new Error('Not authorized to delete this rating');
        }

        const quizId = rating.quizId;

        // Xóa đánh giá
        await Rating.findByIdAndDelete(ratingId).session(session);

        // Cập nhật lại điểm trung bình và số lượng đánh giá
        const ratings = await Rating.find({ quizId }).session(session);
        const totalRatings = ratings.length;
        const averageRating = totalRatings > 0
            ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings
            : 0;

        await Quiz.findByIdAndUpdate(
            quizId,
            {
                averageRating: totalRatings > 0 ? Number(averageRating.toFixed(1)) : 0,
                ratingsCount: totalRatings
            },
            { session }
        );

        await session.commitTransaction();

        return {
            success: true,
            message: 'Rating deleted successfully'
        };
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

module.exports = {
    addRating,
    getQuizRatings,
    getUserRatings,
    deleteRating
}; 