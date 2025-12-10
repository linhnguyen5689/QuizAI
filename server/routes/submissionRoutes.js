const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const submissionController = require('../controllers/submissionController');

// Create a submission
router.post('/:quizId', protect, submissionController.createSubmission);

// Get submissions for a quiz
router.get('/quiz/:quizId', protect, submissionController.getQuizSubmissions);

// Get user's submission history
router.get('/user', protect, submissionController.getUserSubmissions);

// Get submission details
router.get('/:id', protect, submissionController.getSubmissionDetails);

// Delete a submission
router.delete('/:id', protect, submissionController.deleteSubmission);

module.exports = router; 