const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    options: [{
        label: {
            type: String,
            required: true,
        },
        isCorrect: {
            type: Boolean,
            required: true,
        }
    }],
});

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    category: {
        type: String,
        enum: ['Intro computer science', 'Intro ICT', 'Programming fundamentals', 'Data structures & algorithms', 'OOP', 'Computer architecture', 'Operating systems', 'Databases', 'Digital signal processing', 'Other'],
        default: 'Other'
    },
    language: {
        type: String,
        enum: ['english', 'vietnamese'],
        default: 'english'
    },
    originalPdfName: {
        type: String,
    },
    pdfPath: {
        type: String,
    },
    questions: [questionSchema],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    isPublic: {
        type: Boolean,
        default: false,
    },
    averageRating: {
        type: Number,
        default: 0
    },
    ratingsCount: {
        type: Number,
        default: 0
    }
});

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;