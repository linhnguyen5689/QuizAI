const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['joined', 'ready', 'playing', 'completed', 'left'],
    default: 'joined'
  },
  score: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    answerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Answer'
    },
    isCorrect: {
      type: Boolean
    },
    timeSpent: {
      type: Number
    }
  }],
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Indexes for faster queries
participantSchema.index({ roomId: 1 });
participantSchema.index({ userId: 1 });
participantSchema.index({ roomId: 1, userId: 1 }, { unique: true });
participantSchema.index({ score: -1 });

module.exports = mongoose.model('Participant', participantSchema); 