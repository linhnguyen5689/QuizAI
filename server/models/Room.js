const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  status: {
    type: String,
    enum: ['waiting', 'in_progress', 'completed', 'expired'],
    default: 'waiting'
  },
  maxParticipants: {
    type: Number,
    default: 10
  },
  timeLimit: {
    type: Number,
    default: 30
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Indexes for faster queries
roomSchema.index({ code: 1 }, { unique: true });
roomSchema.index({ hostId: 1 });
roomSchema.index({ status: 1 });
roomSchema.index({ expiresAt: 1 });
roomSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Room', roomSchema); 