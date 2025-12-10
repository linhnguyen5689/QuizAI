const mongoose = require('mongoose');

const multiplayerSchema = new mongoose.Schema({
  roomCode: {
    type: String,
    required: true,
    unique: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: Date,
    status: {
      type: String,
      enum: ['waiting', 'ready', 'playing', 'finished'],
      default: 'waiting'
    },
    score: {
      type: Number,
      default: 0
    },
    answers: [{
      questionId: mongoose.Schema.Types.ObjectId,
      selectedAnswer: mongoose.Schema.Types.ObjectId,
      isCorrect: Boolean,
      timeSpent: Number
    }]
  }],
  settings: {
    maxParticipants: {
      type: Number,
      default: 4
    },
    timeLimit: {
      type: Number,
      default: 30
    },
    randomizeQuestions: {
      type: Boolean,
      default: true
    },
    showResults: {
      type: Boolean,
      default: true
    }
  },
  status: {
    type: String,
    enum: ['waiting', 'starting', 'in_progress', 'finished', 'cancelled'],
    default: 'waiting'
  },
  startTime: Date,
  endTime: Date,
  results: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    score: Number,
    timeTaken: Number,
    rank: Number
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
multiplayerSchema.index({ roomCode: 1 });
multiplayerSchema.index({ host: 1 });
multiplayerSchema.index({ status: 1 });
multiplayerSchema.index({ 'participants.user': 1 });

const Multiplayer = mongoose.model('Multiplayer', multiplayerSchema);

module.exports = Multiplayer; 