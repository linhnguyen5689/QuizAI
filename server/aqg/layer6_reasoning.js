// =====================================================
// LAYER 6 – RULE-BASED REASONING & ROUTING ENGINE
// =====================================================
// Purpose:
//  - Decide which question strategy to use
//  - Combine intent, ontology, certainty, abstraction
//  - Route to appropriate question generator
//  - Provide explainable decision metadata
// =====================================================


// -----------------------------------------------------
// ROUTING STRATEGIES
// -----------------------------------------------------
const STRATEGIES = {
  IT_SPECIFIC: "IT_SPECIFIC",
  CAUSE_EFFECT: "CAUSE_EFFECT",
  DEFINITION_GENERIC: "DEFINITION_GENERIC",
  FALLBACK: "FALLBACK"
};


// -----------------------------------------------------
// STRATEGY WEIGHTS
// -----------------------------------------------------
const STRATEGY_WEIGHTS = {
  intentMatch: 3.0,
  abstraction: 2.0,
  certainty: 2.5,
  itDensity: 1.5,
  ambiguityPenalty: -2.0
};


// -----------------------------------------------------
// STEP 1 – STRATEGY SCORING
// -----------------------------------------------------
function scoreStrategy({
  strategy,
  sentenceObj,
  intentProfile,
  concept
}) {
  let score = 0;

  // intent alignment
  if (strategy === STRATEGIES.CAUSE_EFFECT &&
      intentProfile.intents.includes("CAUSE_EFFECT")) {
    score += STRATEGY_WEIGHTS.intentMatch;
  }

  if (strategy === STRATEGIES.IT_SPECIFIC && concept) {
    score += STRATEGY_WEIGHTS.intentMatch;
  }

  // abstraction level
  if (concept) {
    if (concept.abstraction === "HIGH") score += STRATEGY_WEIGHTS.abstraction;
    if (concept.abstraction === "CORE") score += STRATEGY_WEIGHTS.abstraction * 0.7;
  }

  // sentence certainty
  score += sentenceObj.confidence * STRATEGY_WEIGHTS.certainty;

  // IT density
  score += sentenceObj.itDensity * STRATEGY_WEIGHTS.itDensity;

  // ambiguity penalty
  score += sentenceObj.ambiguity * STRATEGY_WEIGHTS.ambiguityPenalty;

  return score;
}


// -----------------------------------------------------
// STEP 2 – EVALUATE ALL STRATEGIES
// -----------------------------------------------------
function evaluateStrategies(context) {
  const strategies = Object.values(STRATEGIES);

  return strategies.map(strategy => ({
    strategy,
    score: scoreStrategy({ strategy, ...context })
  }));
}


// -----------------------------------------------------
// STEP 3 – STRATEGY SELECTION
// -----------------------------------------------------
function selectBestStrategy(scoredStrategies) {
  return scoredStrategies.sort((a, b) => b.score - a.score)[0];
}


// -----------------------------------------------------
// STEP 4 – ROUTE QUESTION LOGIC
// -----------------------------------------------------
function routeQuestion({
  sentenceObj,
  concept,
  intentProfile,
  keywordProfile
}) {
  if (!sentenceObj || !intentProfile) {
    throw new Error("Layer6: Invalid routing context");
  }

  // Step 1–2: evaluate strategies
  const scored = evaluateStrategies({
    sentenceObj,
    intentProfile,
    concept
  });

  // Step 3: choose best
  const best = selectBestStrategy(scored);

  // Step 4: route
  switch (best.strategy) {
    case STRATEGIES.CAUSE_EFFECT:
      return {
        type: STRATEGIES.CAUSE_EFFECT,
        reason: "Intent indicates cause–effect relationship",
        confidence: best.score
      };

    case STRATEGIES.IT_SPECIFIC:
      return {
        type: STRATEGIES.IT_SPECIFIC,
        reason: "Strong IT concept with high abstraction",
        confidence: best.score
      };

    case STRATEGIES.DEFINITION_GENERIC:
      return {
        type: STRATEGIES.DEFINITION_GENERIC,
        reason: "General definition-style sentence",
        confidence: best.score
      };

    default:
      return {
        type: STRATEGIES.FALLBACK,
        reason: "No dominant strategy detected",
        confidence: best.score
      };
  }
}


// -----------------------------------------------------
// EXPORT
// -----------------------------------------------------
module.exports = {
  routeQuestion,
  STRATEGIES
};
