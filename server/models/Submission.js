const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Question'
  },
  question: {
    type: String,
    required: true
  },
  selectedAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Option'
  },
  selectedOptionText: {
    type: String
  },
  correctAnswer: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  }
});

const submissionSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [answerSchema],
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  percentageScore: {
    type: Number,
    required: true
  },
  timeSpent: {
    type: Number,
    default: 0
  },
  attemptNumber: {
    type: Number,
    required: true
  },
  completed: {
    type: Boolean,
    default: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field để hiển thị thông tin rõ ràng hơn
submissionSchema.virtual('submissionInfo').get(function () {
  return {
    score: `${this.correctAnswers}/${this.totalQuestions} (${this.percentageScore}%)`,
    completedAt: this.completedAt.toLocaleString(),
    attemptNumber: this.attemptNumber
  };
});

// Indexes cho tối ưu truy vấn
submissionSchema.index({ userId: 1, quizId: 1, attemptNumber: -1 });
submissionSchema.index({ quizId: 1, createdAt: -1 });
submissionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Submission', submissionSchema);