const Submission = require('../models/Submission');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const crypto = require('crypto');

const submissionService = {
  /**
   * Create a new submission
   */
  async createSubmission(quizId, userId, answers) {
    try {
      const quiz = await Quiz.findById(quizId).populate('questions.options');
      if (!quiz) {
        throw new Error('Quiz not found');
      }

      // Get attempt number
      const attemptCount = await Submission.countDocuments({
        quizId,
        userId
      });

      // Calculate score and validate answers
      let correctAnswers = 0;
      const results = answers.map(answer => {
        const question = quiz.questions.find(q => q._id.toString() === answer.questionId);
        if (!question) {
          throw new Error(`Question ${answer.questionId} not found`);
        }

        const correctOption = question.options.find(opt => opt.isCorrect);
        if (!correctOption) {
          throw new Error(`No correct answer found for question ${answer.questionId}`);
        }

        const isCorrect = answer.selectedAnswer && correctOption._id.toString() === answer.selectedAnswer;
        if (isCorrect) correctAnswers++;

        return {
          questionId: question._id,
          question: question.content,
          selectedAnswer: answer.selectedAnswer,
          selectedOptionText: answer.selectedOptionText,
          correctAnswer: correctOption.label,
          isCorrect
        };
      });

      const totalQuestions = quiz.questions.length;
      const percentageScore = (correctAnswers / totalQuestions) * 100;

      // Create new submission
      const submission = await Submission.create({
        quizId,
        userId,
        answers: results,
        score: correctAnswers,
        totalQuestions,
        correctAnswers,
        percentageScore,
        completed: true,
        attemptNumber: attemptCount + 1,
        completedAt: new Date()
      });

      await submission.populate('quizId', 'title description');

      return {
        success: true,
        message: 'Quiz submitted successfully',
        submission: submission.toObject()
      };
    } catch (error) {
      console.error('Error creating submission:', error);
      throw error;
    }
  },

  /**
   * Get all submissions for a quiz
   */
  async getQuizSubmissions(quizId, userId) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    // Check if user owns the quiz
    if (quiz.createdBy.toString() !== userId) {
      throw new Error('Not authorized to view submissions');
    }

    const submissions = await Submission.find({ quizId: quizId })
      .populate('userId', 'username displayName')
      .sort({ createdAt: -1 });

    return submissions;
  },

  /**
   * Get user's submission history
   */
  async getUserSubmissions(userId) {
    const submissions = await Submission.find({ userId: userId })
      .populate('quizId', 'title description')
      .sort({ createdAt: -1 });

    return submissions;
  },

  /**
   * Get submission details
   */
  async getSubmissionDetails(submissionId, userId) {
    try {
      console.log(`Getting submission details for submissionId: ${submissionId}, userId: ${userId}`);

      // Find submission with populated fields
      const submission = await Submission.findById(submissionId)
        .populate('userId', 'username displayName')
        .populate({
          path: 'quizId',
          select: 'title description questions createdBy',
          populate: [
            {
              path: 'questions.options',
              select: 'label isCorrect'
            },
            {
              path: 'createdBy',
              select: 'username displayName'
            }
          ]
        });

      if (!submission) {
        console.log('Submission not found');
        throw new Error('Submission not found');
      }

      // Convert IDs to strings for comparison
      const submissionUserId = submission.userId._id.toString();
      const quizCreatorId = submission.quizId.createdBy._id.toString();
      const currentUserId = userId.toString();

      console.log('Comparing IDs:', {
        submissionUserId,
        quizCreatorId,
        currentUserId
      });

      // Check if user owns the submission
      const isSubmissionOwner = submissionUserId === currentUserId;
      console.log('Is submission owner?', isSubmissionOwner, `(${submissionUserId} === ${currentUserId})`);

      // Check if user is quiz creator
      const isQuizCreator = quizCreatorId === currentUserId;
      console.log('Is quiz creator?', isQuizCreator, `(${quizCreatorId} === ${currentUserId})`);

      if (!isSubmissionOwner && !isQuizCreator) {
        console.log('Access denied - user is neither submission owner nor quiz creator');
        throw new Error('Not authorized to view this submission');
      }

      console.log('Access granted - preparing response');

      // Prepare response data
      const detailedAnswers = submission.answers.map(answer => {
        const question = submission.quizId.questions.find(
          q => q._id.toString() === answer.questionId.toString()
        );
        if (!question) return answer;

        return {
          ...answer.toObject(),
          question: question.content,
          correctAnswer: question.options.find(opt => opt.isCorrect)?.label,
          allOptions: question.options.map(opt => ({
            label: opt.label,
            isCorrect: opt.isCorrect
          }))
        };
      });

      const result = submission.toObject();
      result.answers = detailedAnswers;
      result.isOwner = isSubmissionOwner;
      result.isQuizCreator = isQuizCreator;

      return {
        success: true,
        data: result
      };

    } catch (error) {
      console.error('Error in getSubmissionDetails:', error);
      throw error;
    }
  },

  /**
   * Delete a submission
   */
  async deleteSubmission(submissionId, userId) {
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }

    // Check if user owns the submission
    if (submission.userId.toString() !== userId) {
      throw new Error('Not authorized to delete this submission');
    }

    await submission.deleteOne();

    return {
      message: 'Submission deleted successfully'
    };
  }
};

module.exports = submissionService;