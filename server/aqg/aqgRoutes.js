const express = require("express");
const router = express.Router();

const upload = require("./fileUtils");
const { uploadFile, generateQuiz } = require("./aqgController");

// Upload & extract text
router.post("/upload", upload.single("file"), uploadFile);

// Generate questions
router.post("/generate", generateQuiz);

module.exports = router;
