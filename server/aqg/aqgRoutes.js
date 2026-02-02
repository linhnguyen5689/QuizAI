// server/aqg/aqgRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { protect } = require("../middleware/authMiddleware");

const aqgController = require("./aqgController");

// ===============================
// Multer config (upload file)
// ===============================
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

// ===============================
// ROUTES – AQG 2.0
// ===============================

// Upload file → extract text (PREPROCESS)
router.post(
  "/upload",
  protect,
  upload.single("file"),
  aqgController.uploadFile
);

// Generate quiz (AI 2.0 – LOCAL / ADVANCED)
router.post(
  "/generate",
  aqgController.generateQuiz2
);

module.exports = router;
