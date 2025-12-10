const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const quizController = require('../controllers/quizController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Created uploads directory at:', uploadDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${path.basename(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        if (file.mimetype !== 'application/pdf') {
            return cb(new Error('Only PDF files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Routes that require authentication
router.post('/', protect, quizController.createQuiz);
router.post('/ai', protect, quizController.createQuizWithAI); // New route for AI quiz generation
router.post('/upload', protect, upload.single('pdfFile'), quizController.createQuizFromPDF); // Add upload route
router.get('/public', quizController.getPublicQuizzes);
router.get('/', protect, quizController.getAllQuizzes); // Protected route
router.get('/:id', quizController.getQuizById);
router.put('/:id', protect, quizController.updateQuiz); // Route để cập nhật quiz
router.delete('/:id', protect, quizController.deleteQuiz);
router.post('/:id/submit', protect, quizController.submitQuizAnswers);

module.exports = router;