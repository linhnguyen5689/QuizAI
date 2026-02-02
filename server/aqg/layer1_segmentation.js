// =====================================================
// LAYER 1 – DISCOURSE-AWARE TEXT NORMALIZATION ENGINE
// =====================================================
// Purpose:
//  - Normalize raw text
//  - Segment into discourse-aware sentence units
//  - Generate semantic & statistical metadata
//  - Provide enriched input for higher NLP layers
// =====================================================


// -----------------------------------------------------
// CONFIGURATION
// -----------------------------------------------------
const CANONICAL_MAP = {
  "db": "database",
  "auth": "authentication",
  "rest api": "api",
  "web server": "server",
  "client side": "client",
  "server side": "server"
};

const IT_TERMS = [
  "api", "database", "server", "client", "authentication",
  "authorization", "http", "https", "tcp", "udp",
  "backend", "frontend", "json", "session", "cookie"
];

const AMBIGUOUS_PRONOUNS = ["it", "this", "that", "these", "those"];


// -----------------------------------------------------
// STEP 1 – CANONICAL NORMALIZATION
// -----------------------------------------------------
function canonicalize(text) {
  let output = text.toLowerCase();

  Object.entries(CANONICAL_MAP).forEach(([alias, canonical]) => {
    const regex = new RegExp(`\\b${alias}\\b`, "g");
    output = output.replace(regex, canonical);
  });

  return output;
}


// -----------------------------------------------------
// STEP 2 – BASIC TEXT NORMALIZATION
// -----------------------------------------------------
function normalizeText(text) {
  return text
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


// -----------------------------------------------------
// STEP 3 – SENTENCE SEGMENTATION
// -----------------------------------------------------
function splitSentences(text) {
  return text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20);
}


// -----------------------------------------------------
// STEP 4 – IT TERM DENSITY CALCULATION
// -----------------------------------------------------
function calculateITDensity(sentence) {
  const words = sentence.split(" ");
  let itCount = 0;

  words.forEach(w => {
    if (IT_TERMS.includes(w)) itCount++;
  });

  return itCount / Math.max(1, words.length);
}


// -----------------------------------------------------
// STEP 5 – DISCOURSE ROLE CLASSIFICATION
// -----------------------------------------------------
function classifyDiscourseRole(itDensity) {
  if (itDensity >= 0.12) return "TECHNICAL";
  if (itDensity >= 0.05) return "SEMI_TECHNICAL";
  return "GENERAL";
}


// -----------------------------------------------------
// STEP 6 – AMBIGUITY DETECTION
// -----------------------------------------------------
function detectAmbiguity(sentence) {
  const words = sentence.split(" ");
  let ambiguousHits = 0;

  words.forEach(w => {
    if (AMBIGUOUS_PRONOUNS.includes(w)) ambiguousHits++;
  });

  return ambiguousHits / Math.max(1, words.length);
}


// -----------------------------------------------------
// STEP 7 – CONFIDENCE SCORING
// -----------------------------------------------------
function calculateConfidence(itDensity, ambiguity) {
  // heuristic confidence formula
  let score = 0;

  score += itDensity * 2.5;
  score -= ambiguity * 1.5;

  return Math.max(0, Math.min(1, score));
}


// -----------------------------------------------------
// STEP 8 – DEPENDENCY MARKER DETECTION
// -----------------------------------------------------
function detectDependencies(sentence) {
  const markers = [];

  if (sentence.includes("because")) markers.push("CAUSE");
  if (sentence.includes("before")) markers.push("TEMPORAL_BEFORE");
  if (sentence.includes("after")) markers.push("TEMPORAL_AFTER");
  if (sentence.includes("which") || sentence.includes("that"))
    markers.push("RELATIVE_CLAUSE");

  return markers;
}


// -----------------------------------------------------
// STEP 9 – DISCOURSE OBJECT BUILDER
// -----------------------------------------------------
function buildSentenceObject(sentence, index) {
  const itDensity = calculateITDensity(sentence);
  const ambiguity = detectAmbiguity(sentence);
  const discourseRole = classifyDiscourseRole(itDensity);
  const confidence = calculateConfidence(itDensity, ambiguity);
  const dependencies = detectDependencies(sentence);

  return {
    id: index,
    text: sentence,
    discourseRole,
    itDensity,
    ambiguity,
    confidence,
    dependencies
  };
}


// -----------------------------------------------------
// MAIN API – SEGMENT TEXT
// -----------------------------------------------------
function segmentText(rawText) {
  if (typeof rawText !== "string") {
    throw new Error("Layer1: Input must be a string");
  }

  // Step 1–2: normalization
  let processed = canonicalize(rawText);
  processed = normalizeText(processed);

  // Step 3: segmentation
  const sentences = splitSentences(processed);

  // Step 4–9: enrichment
  return sentences.map((s, index) =>
    buildSentenceObject(s, index)
  );
}


// -----------------------------------------------------
// EXPORT
// -----------------------------------------------------
module.exports = {
  segmentText
};
