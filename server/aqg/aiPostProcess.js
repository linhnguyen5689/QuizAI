// server/aqg/aiPostProcess.js

/**
 * ==================================================
 * Remove duplicated questions (case-insensitive)
 * ==================================================
 */
function deduplicateQuestions(questions = []) {
  const seen = new Set();

  return questions.filter(q => {
    if (!q || !q.question) return false;

    const key = q.question
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * ==================================================
 * Normalize question format
 * - Ensure exactly 4 options
 * - Ensure valid answer index
 * ==================================================
 */
function normalizeQuestions(questions = []) {
  return questions.map(q => {
    const normalized = {
      question: q.question || "Invalid question",
      options: Array.isArray(q.options) ? q.options.slice(0, 4) : [],
      answer: typeof q.answer === "number" ? q.answer : 0
    };

    // Fill missing options
    while (normalized.options.length < 4) {
      normalized.options.push("N/A");
    }

    // Clamp answer index
    if (
      normalized.answer < 0 ||
      normalized.answer >= normalized.options.length
    ) {
      normalized.answer = 0;
    }

    return normalized;
  });
}

/**
 * ==================================================
 * Optional: difficulty tagging (for analytics)
 * ==================================================
 */
function tagDifficulty(questions = [], difficulty = "medium") {
  return questions.map(q => ({
    ...q,
    difficulty
  }));
}

module.exports = {
  deduplicateQuestions,
  normalizeQuestions,
  tagDifficulty
};
