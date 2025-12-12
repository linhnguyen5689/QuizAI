const { extractTextFromFile } = require("./extractText");
const OpenAI = require("openai");

// ====== OPENAI INIT ======
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ======================================================
// 1) PROMPT GENERATOR
// ======================================================
function buildQuizPrompt({ text, numQuestions, difficulty, language, mode }) {
  return `
You are an expert educational quiz generator. Create a high-quality multiple-choice quiz.

### SOURCE MATERIAL:
${text}

### REQUIREMENTS:
- Generate exactly **${numQuestions} questions**
- Each question must have **4 answer choices**
- Only **1** correct answer
- Difficulty level: **${difficulty}**
- Language: **${language === "vi" ? "Vietnamese" : "English"}**
- No repeated questions, no ambiguous content.

### MODE:
${mode === "template"
    ? "Use simple template patterns (fast but basic)."
    : "Use deep semantic understanding to generate varied, natural, higher-quality questions."
}

### JSON OUTPUT FORMAT:
{
  "questions": [
    {
      "question": "...",
      "options": ["A...", "B...", "C...", "D..."],
      "answer": 0
    }
  ]
}

Return ONLY JSON with no explanation.
`;
}

// ======================================================
// 2) DATA CLEANING HELPERS
// ======================================================
function removeDuplicates(questions) {
  const seen = new Set();
  return questions.filter((q) => {
    const key = q.question.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sanitizeQuestion(q) {
  if (!Array.isArray(q.options) || q.options.length !== 4) {
    q.options = [...(q.options || []).slice(0, 4)];
    while (q.options.length < 4) q.options.push("N/A");
  }

  if (typeof q.answer !== "number" || q.answer < 0 || q.answer > 3) {
    q.answer = 0;
  }

  return q;
}

// ======================================================
// 3) FILE UPLOAD → TEXT EXTRACTION
// ======================================================
exports.uploadFile = async (req, res) => {
  try {
    const filePath = req.file.path;
    const extractedText = await extractTextFromFile(filePath);

    return res.json({
      success: true,
      text: extractedText,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to extract text",
    });
  }
};

// ======================================================
// 4) AI QUIZ GENERATION ENDPOINT
// ======================================================
const { generateLocalQuestions } = require("./localAQG");

exports.generateQuiz = async (req, res) => {
  try {
    const { text, numQuestions } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Missing text input",
      });
    }

    const questions = generateLocalQuestions(text, numQuestions || 10);

    return res.json({
      success: true,
      questions,
    });
  } catch (err) {
    console.error("Local AQG error:", err);
    return res.status(500).json({
      success: false,
      message: "Local AQG generation failed",
    });
  }
};
