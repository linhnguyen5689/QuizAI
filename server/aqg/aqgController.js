// server/aqg/aqgController.js
const { extractTextFromFile } = require("./extractText");
const { generateLocalQuiz } = require("./localAQG");
const { generateAdvanced } = require("./advancedAQG");
const { generateOpenAIQuiz } = require("./openaiAQG");
const { deduplicateQuestions, normalizeQuestions } = require("./aiPostProcess");

// ======================================================
// FILE UPLOAD → TEXT EXTRACTION (PREPROCESS STEP)
// ======================================================
exports.uploadFile = async (req, res) => {
  try {
    console.log("=== AQG UPLOAD DEBUG ===");
    console.log("req.headers.content-type:", req.headers["content-type"]);
    console.log("req.file:", req.file);
    console.log("req.body:", req.body);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file received by server",
      });
    }

    const filePath = req.file.path;
    console.log("filePath:", filePath);

    const extractedText = await extractTextFromFile(req.file);

    return res.json({
      success: true,
      text: extractedText,
    });
  } catch (err) {
    console.error("UPLOAD FILE CRASH:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ======================================================
// AI 2.0 – GENERATE QUIZ (PREVIEW, NO DB SAVE)
// ======================================================
exports.generateQuiz2 = async (req, res) => {
  try {
    const {
      mode = "LOCAL_AI",
      text,
      difficulty = "medium",
      numQuestions = 10,
      language = "en",
    } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Missing input text",
      });
    }

    let questions;

    if (mode === "ADVANCED_AI") {
      questions = await generateOpenAIQuiz({
        text,
        difficulty,
        numQuestions,
        language,
      });
    } else {
      questions = generateLocalQuiz({
        text,
        difficulty,
        numQuestions,
      });
    }

    console.log("=== LOCAL_AI DEBUG ===");
    console.log("mode:", mode);
    console.log("questions type:", typeof questions);
    console.log("is array:", Array.isArray(questions));
    console.log("questions:", questions);

    //questions = deduplicateQuestions(questions);
    //questions = normalizeQuestions(questions);

    return res.json({
      success: true,
      mode,
      questions,
    });
  } 
  catch (err) {
    console.error("=== AQG GENERATE ERROR ===");
    console.error(err);
    console.error(err.stack);
    return res.status(500).json({
      success: false,
      message: "Quiz generation failed",
    });
  }
};

