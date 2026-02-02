// =====================================================
// LAYER 4 – MULTI-INTENT & MODALITY PARSING ENGINE
// =====================================================
// Purpose:
//  - Detect multiple intents in a single sentence
//  - Infer modality (must / may / cannot)
//  - Estimate certainty & ambiguity
//  - Provide intent confidence for reasoning layer
// =====================================================


// -----------------------------------------------------
// INTENT PATTERN DEFINITIONS
// -----------------------------------------------------
const INTENT_PATTERNS = {
  DEFINITION: [
    /\bis a\b/,
    /\bis an\b/,
    /\brefers to\b/,
    /\bdefined as\b/
  ],

  FUNCTION: [
    /\bused to\b/,
    /\ballows\b/,
    /\benables\b/,
    /\bhelps\b/
  ],

  CAUSE_EFFECT: [
    /\bbecause\b/,
    /\btherefore\b/,
    /\bas a result\b/,
    /\bleads to\b/
  ],

  PROCESS: [
    /\bfirst\b/,
    /\bthen\b/,
    /\bafter that\b/,
    /\bfinally\b/
  ],

  COMPARISON: [
    /\bwhile\b/,
    /\bwhereas\b/,
    /\bin contrast\b/,
    /\bdifferent from\b/
  ],

  CONSTRAINT: [
    /\bmust\b/,
    /\bcannot\b/,
    /\bshould\b/,
    /\brequired to\b/
  ]
};


// -----------------------------------------------------
// MODALITY KEYWORDS
// -----------------------------------------------------
const MODALITY_KEYWORDS = {
  STRONG: ["must", "cannot", "required"],
  MEDIUM: ["should", "need to"],
  WEAK: ["may", "might", "can"]
};


// -----------------------------------------------------
// STEP 1 – INTENT DETECTION
// -----------------------------------------------------
function detectIntents(sentenceText) {
  const detected = [];

  Object.entries(INTENT_PATTERNS).forEach(([intent, patterns]) => {
    for (const pattern of patterns) {
      if (pattern.test(sentenceText)) {
        detected.push(intent);
        break;
      }
    }
  });

  return detected;
}


// -----------------------------------------------------
// STEP 2 – MODALITY INFERENCE
// -----------------------------------------------------
function inferModality(sentenceText) {
  for (const [level, keywords] of Object.entries(MODALITY_KEYWORDS)) {
    for (const k of keywords) {
      if (sentenceText.includes(k)) {
        return level;
      }
    }
  }
  return "NONE";
}


// -----------------------------------------------------
// STEP 3 – CERTAINTY SCORING
// -----------------------------------------------------
function computeCertainty(sentenceObj, intents) {
  let score = 0.3;

  // technical sentences are more reliable
  if (sentenceObj.discourseRole === "TECHNICAL") score += 0.25;
  if (sentenceObj.itDensity > 0.1) score += 0.25;

  // more intents → more informative
  score += Math.min(0.2, intents.length * 0.05);

  // ambiguity reduces certainty
  score -= sentenceObj.ambiguity * 0.4;

  return Math.max(0, Math.min(1, score));
}


// -----------------------------------------------------
// STEP 4 – AMBIGUITY CLASSIFICATION
// -----------------------------------------------------
function classifyAmbiguity(sentenceObj) {
  if (sentenceObj.ambiguity > 0.35) return "HIGH";
  if (sentenceObj.ambiguity > 0.15) return "MEDIUM";
  return "LOW";
}


// -----------------------------------------------------
// STEP 5 – INTENT PRIORITY RESOLUTION
// -----------------------------------------------------
function resolveIntentPriority(intents) {
  const PRIORITY = [
    "CAUSE_EFFECT",
    "CONSTRAINT",
    "DEFINITION",
    "FUNCTION",
    "PROCESS",
    "COMPARISON"
  ];

  return intents.sort(
    (a, b) => PRIORITY.indexOf(a) - PRIORITY.indexOf(b)
  );
}


// -----------------------------------------------------
// STEP 6 – INTENT CONFIDENCE DISTRIBUTION
// -----------------------------------------------------
function assignIntentConfidence(intents, baseCertainty) {
  const confidenceMap = {};
  const total = intents.length || 1;

  intents.forEach(intent => {
    confidenceMap[intent] = Math.min(
      1,
      baseCertainty * (1 + 0.3 / total)
    );
  });

  return confidenceMap;
}


// -----------------------------------------------------
// MAIN API – PARSE INTENT
// -----------------------------------------------------
function parseIntent(sentenceObj) {
  if (!sentenceObj || !sentenceObj.text) {
    throw new Error("Layer4: Invalid sentence object");
  }

  const text = sentenceObj.text;

  // Step 1: detect intents
  const rawIntents = detectIntents(text);

  // Step 2: resolve priority
  const intents = resolveIntentPriority(rawIntents);

  // Step 3: infer modality
  const modality = inferModality(text);

  // Step 4: certainty & ambiguity
  const certainty = computeCertainty(sentenceObj, intents);
  const ambiguityLevel = classifyAmbiguity(sentenceObj);

  // Step 5: intent confidence map
  const intentConfidence = assignIntentConfidence(intents, certainty);

  return {
    intents,
    primaryIntent: intents[0] || "GENERAL",
    modality,
    certainty,
    ambiguityLevel,
    intentConfidence
  };
}


// -----------------------------------------------------
// EXPORT
// -----------------------------------------------------
module.exports = {
  parseIntent
};
