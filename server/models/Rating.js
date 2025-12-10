const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Đảm bảo mỗi người dùng chỉ có thể đánh giá một quiz một lần
ratingSchema.index({ userId: 1, quizId: 1 }, { unique: true });

// Tạo các index để truy vấn nhanh hơn
ratingSchema.index({ quizId: 1, createdAt: -1 });
ratingSchema.index({ rating: -1 });

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating; 