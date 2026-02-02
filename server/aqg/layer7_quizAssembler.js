// =====================================================
// LAYER 7 – QUIZ ASSEMBLY & QUALITY CONTROL ENGINE
// (STANDARDIZED & STABLE VERSION)
// =====================================================


// -----------------------------------------------------
// GLOBAL QUALITY CONFIGURATION
// -----------------------------------------------------
const QUALITY_CONFIG = {
  MIN_CONFIDENCE: 0.3,
  MAX_SAME_CONCEPT: 2,
  MAX_SIMILARITY: 0.7
};


// -----------------------------------------------------
// NORMALIZE QUESTION TEXT
// -----------------------------------------------------
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean);
}


// -----------------------------------------------------
// STEP 1 – QUESTION SIGNATURE
// -----------------------------------------------------
function generateSignature(question) {
  return normalize(question.question)
    .slice(0, 10)          // ⬅️ dài hơn, ổn định hơn
    .join("_");
}


// -----------------------------------------------------
// STEP 2 – SEMANTIC SIMILARITY (TOKEN-BASED)
// -----------------------------------------------------
function similarity(q1, q2) {
  const t1 = new Set(normalize(q1.question));
  const t2 = new Set(normalize(q2.question));

  const intersection = [...t1].filter(x => t2.has(x));
  return intersection.length / Math.max(t1.size, t2.size);
}


// -----------------------------------------------------
// STEP 3 – DUPLICATION CHECK
// -----------------------------------------------------
function isDuplicate(question, accepted) {
  const sig = generateSignature(question);

  for (const q of accepted) {
    if (generateSignature(q) === sig) return true;
    if (similarity(question, q) >= QUALITY_CONFIG.MAX_SIMILARITY)
      return true;
  }
  return false;
}


// -----------------------------------------------------
// STEP 4 – CONCEPT BALANCING
// -----------------------------------------------------
function exceedsConceptLimit(question, accepted) {
  const concept = question.meta?.concept || "GENERAL";

  const count = accepted.filter(
    q => (q.meta?.concept || "GENERAL") === concept
  ).length;

  return count >= QUALITY_CONFIG.MAX_SAME_CONCEPT;
}


// -----------------------------------------------------
// STEP 5 – QUALITY THRESHOLD (SOFT)
// -----------------------------------------------------
function passesQuality(question) {
  if (!question.meta) return true;

  if (question.meta.confidence === undefined) return true;

  return question.meta.confidence >= QUALITY_CONFIG.MIN_CONFIDENCE;
}


// -----------------------------------------------------
// STEP 6 – ACCEPTANCE LOGIC
// -----------------------------------------------------
function acceptQuestion(question, accepted) {
  if (isDuplicate(question, accepted)) return false;
  if (exceedsConceptLimit(question, accepted)) return false;

  // soft quality: cho phép low confidence nếu chưa đủ câu
  if (!passesQuality(question) && accepted.length > 0) return false;

  return true;
}


// -----------------------------------------------------
// STEP 7 – FALLBACK QUESTION
// -----------------------------------------------------
function generateFallbackQuestion() {
  return {
    question: "Which statement best summarizes the core IT concept discussed?",
    options: [
      "It explains a fundamental computing concept.",
      "It discusses unrelated topics.",
      "It refers to fictional technology.",
      "It has no technical relevance."
    ],
    answer: 0,
    meta: {
      concept: "GENERAL",
      confidence: 0.4
    }
  };
}


// -----------------------------------------------------
// MAIN API – ASSEMBLE QUIZ
// -----------------------------------------------------
function assembleQuiz(candidateQuestions, numQuestions) {
  const accepted = [];

  for (const q of candidateQuestions) {
    if (accepted.length >= numQuestions) break;

    if (acceptQuestion(q, accepted)) {
      accepted.push(q);
    }
  }

  while (accepted.length < numQuestions) {
    accepted.push(generateFallbackQuestion());
  }

  return accepted;
}


// -----------------------------------------------------
// EXPORT
// -----------------------------------------------------
module.exports = {
  assembleQuiz
};
