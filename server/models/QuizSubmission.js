const mongoose = require('mongoose');

const quizSubmissionSchema = new mongoose.Schema({
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
    score: {
        type: Number,
        required: true
    },
    correctAnswers: {
        type: Number,
        required: true
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    timeSpent: {
        type: Number,  // in minutes
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

// Create indexes for better query performance
quizSubmissionSchema.index({ userId: 1, submittedAt: -1 });
quizSubmissionSchema.index({ score: -1 });

module.exports = mongoose.model('QuizSubmission', quizSubmissionSchema);
