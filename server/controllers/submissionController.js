const submissionService = require('../services/submissionService');
const { checkAndUpdateAchievements } = require('./achievementController');

/**
 * Create a new submission
 * @route POST /api/submissions/:quizId
 * @access Private
 */
const createSubmission = async (req, res) => {
  try {
    const result = await submissionService.createSubmission(
      req.params.quizId,
      req.user._id,
      req.body.answers
    );

    await checkAndUpdateAchievements(req.user._id);

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating submission:', error);
    let status = 400;

    if (error.message === 'Quiz not found') {
      status = 404;
    } else if (error.message === 'You have already submitted this quiz') {
      status = 409; // Conflict
    } else if (error.message.includes('validation failed')) {
      status = 422; // Unprocessable Entity
    }

    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get all submissions for a quiz
 * @route GET /api/submissions/quiz/:quizId
 * @access Private
 */
const getQuizSubmissions = async (req, res) => {
  try {
    const submissions = await submissionService.getQuizSubmissions(
      req.params.quizId,
      req.user._id
    );
    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('Error getting quiz submissions:', error);
    let status = 500;

    if (error.message === 'Quiz not found') {
      status = 404;
    } else if (error.message === 'Not authorized') {
      status = 403;
    }

    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get user's submission history
 * @route GET /api/submissions/user
 * @access Private
 */
const getUserSubmissions = async (req, res) => {
  try {
    const submissions = await submissionService.getUserSubmissions(req.user._id);
    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('Error getting user submissions:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get submission details
 * @route GET /api/submissions/:id
 * @access Private
 */
const getSubmissionDetails = async (req, res) => {
  try {
    const result = await submissionService.getSubmissionDetails(
      req.params.id,
      req.user._id
    );
    res.json(result);
  } catch (error) {
    console.error('Error getting submission details:', error);
    let status = 500;

    if (error.message === 'Submission not found') {
      status = 404;
    } else if (error.message === 'Not authorized to view this submission') {
      status = 403;
    }

    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Delete a submission
 * @route DELETE /api/submissions/:id
 * @access Private
 */
const deleteSubmission = async (req, res) => {
  try {
    const result = await submissionService.deleteSubmission(
      req.params.id,
      req.user._id
    );
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Error deleting submission:', error);
    let status = 400;

    if (error.message === 'Submission not found') {
      status = 404;
    } else if (error.message === 'Not authorized to delete this submission') {
      status = 403;
    }

    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createSubmission,
  getQuizSubmissions,
  getUserSubmissions,
  getSubmissionDetails,
  deleteSubmission
};