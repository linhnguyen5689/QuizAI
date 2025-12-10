const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    criteria: {
        type: {
            type: String,
            enum: ['QUIZ_COUNT', 'HIGH_SCORE', 'PERFECT_SCORE', 'SUBMISSIONS_COUNT'],
            required: true
        },
        value: {
            type: Number,
            required: true
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Achievement = mongoose.model('Achievement', achievementSchema);

module.exports = Achievement;