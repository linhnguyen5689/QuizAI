// =====================================================
// LAYER 5 – IT QUESTION & MISCONCEPTION ENGINE
// =====================================================
// Purpose:
//  - Generate IT-specific questions
//  - Use ontology + intent + abstraction level
//  - Create cognitively plausible distractors
//  - Support multiple question families
// =====================================================


// -----------------------------------------------------
// QUESTION TEMPLATES BY INTENT
// -----------------------------------------------------
const QUESTION_TEMPLATES = {
  DEFINITION: [
    k => `Which option best defines "${k}" in computer science?`,
    k => `How can "${k}" be correctly described in an IT context?`
  ],

  FUNCTION: [
    k => `What is the primary role of "${k}" in a software system?`,
    k => `Why is "${k}" used in modern applications?`
  ],

  CAUSE_EFFECT: [
    k => `What is a likely consequence related to "${k}"?`,
    k => `Which outcome is most closely associated with "${k}"?`
  ],

  PROCESS: [
    k => `In which stage of a system workflow does "${k}" typically appear?`
  ],

  COMPARISON: [
    k => `Which statement correctly distinguishes "${k}" from related concepts?`
  ]
};


// -----------------------------------------------------
// DISTRACTOR ERROR TYPES
// -----------------------------------------------------
const ERROR_TYPES = {
  CONCEPTUAL: "CONCEPTUAL_ERROR",
  FUNCTIONAL: "FUNCTIONAL_ERROR",
  ROLE_CONFUSION: "ROLE_CONFUSION",
  DOMAIN_SHIFT: "DOMAIN_SHIFT"
};


// -----------------------------------------------------
// STEP 1 – QUESTION FAMILY SELECTION
// -----------------------------------------------------
function selectQuestionFamily(intentProfile) {
  return intentProfile.primaryIntent || "DEFINITION";
}


// -----------------------------------------------------
// STEP 2 – QUESTION TEXT REALIZATION
// -----------------------------------------------------
function realizeQuestionText(family, keyword) {
  const templates = QUESTION_TEMPLATES[family] || QUESTION_TEMPLATES.DEFINITION;
  return templates[Math.floor(Math.random() * templates.length)](keyword);
}


// -----------------------------------------------------
// STEP 3 – CORRECT ANSWER GENERATION
// -----------------------------------------------------
function generateCorrectAnswer(concept, sentenceObj, intentProfile) {
  // Prefer sentence text if confidence is high
  if (sentenceObj.confidence > 0.6) {
    return sentenceObj.text;
  }

  // Fallback to abstract definition
  return `${concept.label} is a ${concept.type.toLowerCase()} used in ${concept.domain.toLowerCase()} systems.`;
}


// -----------------------------------------------------
// STEP 4 – MISCONCEPTION-BASED DISTRACTOR GENERATION
// -----------------------------------------------------
function generateMisconceptionDistractors(concept) {
  return concept.misconceptions.map(m => ({
    text: `A common misconception is that ${m}.`,
    errorType: ERROR_TYPES.CONCEPTUAL
  }));
}


// -----------------------------------------------------
// STEP 5 – FUNCTIONAL DISTRACTOR GENERATION
// -----------------------------------------------------
function generateFunctionalDistractors(concept) {
  return [
    {
      text: `"${concept.key}" is mainly responsible for user interface rendering.`,
      errorType: ERROR_TYPES.FUNCTIONAL
    },
    {
      text: `"${concept.key}" replaces the operating system.`,
      errorType: ERROR_TYPES.DOMAIN_SHIFT
    }
  ];
}


// -----------------------------------------------------
// STEP 6 – DISTRACTOR SELECTION & BALANCING
// -----------------------------------------------------
function selectDistractors(concept, maxDistractors = 3) {
  const pool = [
    ...generateMisconceptionDistractors(concept),
    ...generateFunctionalDistractors(concept)
  ];

  return shuffle(pool)
    .slice(0, maxDistractors)
    .map(d => d.text);
}


// -----------------------------------------------------
// STEP 7 – ANSWER SET ASSEMBLY
// -----------------------------------------------------
function assembleOptions(correct, distractors) {
  return shuffle([correct, ...distractors]);
}


// -----------------------------------------------------
// MAIN API – GENERATE IT QUESTION
// -----------------------------------------------------
function generateITQuestion({
  concept,
  sentenceObj,
  intentProfile
}) {
  if (!concept || !sentenceObj) {
    throw new Error("Layer5: Missing concept or sentence object");
  }

  // Step 1: choose question family
  const family = selectQuestionFamily(intentProfile);

  // Step 2: question text
  const question = realizeQuestionText(family, concept.key);

  // Step 3: correct answer
  const correctAnswer = generateCorrectAnswer(
    concept,
    sentenceObj,
    intentProfile
  );

  // Step 4–6: distractors
  const distractors = selectDistractors(concept);

  // Step 7: final options
  const options = assembleOptions(correctAnswer, distractors);

  return {
    question,
    options,
    answer: options.indexOf(correctAnswer),
    meta: {
      concept: concept.key,
      intent: family,
      abstraction: concept.abstraction,
      confidence: sentenceObj.confidence
    }
  };
}


// -----------------------------------------------------
// UTILS
// -----------------------------------------------------
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}


// -----------------------------------------------------
// EXPORT
// -----------------------------------------------------
module.exports = {
  generateITQuestion
};
