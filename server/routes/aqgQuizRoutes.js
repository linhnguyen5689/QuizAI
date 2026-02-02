// server/routes/aqgQuizRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { generateQuiz2 } = require("../aqg/aqgController");
const quizService = require("../services/quizService");

/**
 * ==================================================
 * AI 2.0 – GENERATE QUIZ (PREVIEW ONLY)
 * ==================================================
 * POST /api/aqg/generate
 */
router.post("/generate", protect, generateQuiz2);

/**
 * ==================================================
 * SAVE AI-GENERATED QUIZ (FROM PREVIEW)
 * ==================================================
 * POST /api/aqg/save
 */
router.post("/save", protect, async (req, res) => {
  try {
    const result = await quizService.createQuizFromAQGPreview(
      req.user._id,
      req.body
    );

    res.json({
      success: true,
      quiz: result.quiz,
    });
  } catch (error) {
    console.error("Error saving AQG quiz:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
