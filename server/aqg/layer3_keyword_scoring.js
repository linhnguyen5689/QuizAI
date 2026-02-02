// =====================================================
// LAYER 3 – MULTI-FACTOR KEYWORD SCORING ENGINE
// =====================================================
// Purpose:
//  - Score candidate terms using multiple linguistic
//    and semantic factors
//  - Select central concept(s) of a sentence
//  - Provide explainable scoring for later reasoning
// =====================================================


// -----------------------------------------------------
// CONFIGURATION – WEIGHT SETTINGS
// -----------------------------------------------------
const WEIGHTS = {
  frequency: 1.0,
  ontologyPresence: 3.0,
  abstractionWeight: 2.0,
  conceptConfidence: 2.5,
  discourseRole: 1.5,
  itDensity: 1.2,
  ambiguityPenalty: -1.5,
  positionBoost: 1.0,
  prerequisitePenalty: -0.8,
  neighborhoodBoost: 1.3
};


// -----------------------------------------------------
// STEP 1 – TOKENIZATION & FREQUENCY MAP
// -----------------------------------------------------
function tokenize(sentenceText) {
  return sentenceText
    .split(" ")
    .map(w => w.trim())
    .filter(w => w.length > 2);
}

function computeFrequency(tokens) {
  const freq = {};
  tokens.forEach(t => {
    freq[t] = (freq[t] || 0) + 1;
  });
  return freq;
}


// -----------------------------------------------------
// STEP 2 – POSITIONAL IMPORTANCE
// -----------------------------------------------------
function computePositionScore(index, total) {
  // words near beginning get higher importance
  if (index < total * 0.2) return 1.0;
  if (index < total * 0.5) return 0.6;
  return 0.2;
}


// -----------------------------------------------------
// STEP 3 – DISCOURSE ROLE CONTRIBUTION
// -----------------------------------------------------
function discourseRoleBoost(discourseRole) {
  if (discourseRole === "TECHNICAL") return 1.0;
  if (discourseRole === "SEMI_TECHNICAL") return 0.6;
  return 0.2;
}


// -----------------------------------------------------
// STEP 4 – AMBIGUITY PENALTY
// -----------------------------------------------------
function ambiguityPenalty(ambiguityScore) {
  return ambiguityScore * WEIGHTS.ambiguityPenalty;
}


// -----------------------------------------------------
// STEP 5 – PREREQUISITE SATISFACTION CHECK
// -----------------------------------------------------
function prerequisitePenalty(concept) {
  if (!concept.prerequisites) return 0;
  return concept.prerequisites.missing.length * WEIGHTS.prerequisitePenalty;
}


// -----------------------------------------------------
// STEP 6 – SEMANTIC NEIGHBORHOOD BOOST
// -----------------------------------------------------
function neighborhoodBoost(concept) {
  if (!concept.neighborhood) return 0;
  return concept.neighborhood.relatedConcepts.length * WEIGHTS.neighborhoodBoost;
}


// -----------------------------------------------------
// STEP 7 – SCORE SINGLE TERM
// -----------------------------------------------------
function scoreTerm({
  term,
  frequency,
  positionScore,
  sentenceObj,
  concept
}) {
  let score = 0;

  // base frequency
  score += frequency * WEIGHTS.frequency;

  // discourse & IT density
  score += discourseRoleBoost(sentenceObj.discourseRole) * WEIGHTS.discourseRole;
  score += sentenceObj.itDensity * WEIGHTS.itDensity;

  // ambiguity penalty
  score += ambiguityPenalty(sentenceObj.ambiguity);

  // position importance
  score += positionScore * WEIGHTS.positionBoost;

  // ontology-based contributions
  if (concept) {
    score += WEIGHTS.ontologyPresence;
    score += concept.abstractionWeight * WEIGHTS.abstractionWeight;
    score += concept.confidence * WEIGHTS.conceptConfidence;
    score += neighborhoodBoost(concept);
    score += prerequisitePenalty(concept);
  }

  return score;
}


// -----------------------------------------------------
// STEP 8 – FULL SCORING PIPELINE
// -----------------------------------------------------
function scoreKeywords(sentenceObj, concepts) {
  const tokens = tokenize(sentenceObj.text);
  const freqMap = computeFrequency(tokens);
  const totalTokens = tokens.length;

  const conceptMap = {};
  concepts.forEach(c => {
    conceptMap[c.key] = c;
  });

  const scored = tokens.map((token, index) => {
    const concept = conceptMap[token] || null;

    const score = scoreTerm({
      term: token,
      frequency: freqMap[token],
      positionScore: computePositionScore(index, totalTokens),
      sentenceObj,
      concept
    });

    return {
      term: token,
      score,
      hasConcept: Boolean(concept),
      conceptType: concept ? concept.type : null,
      explanation: {
        frequency: freqMap[token],
        discourseRole: sentenceObj.discourseRole,
        abstraction: concept?.abstraction,
        confidence: concept?.confidence
      }
    };
  });

  return scored;
}


// -----------------------------------------------------
// STEP 9 – CENTRAL CONCEPT SELECTION
// -----------------------------------------------------
function selectCentralConcepts(scoredTerms, topK = 2) {
  return scoredTerms
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}


// -----------------------------------------------------
// MAIN API – EXTRACT KEYWORDS
// -----------------------------------------------------
function extractKeywords(sentenceObj, concepts) {
  if (!sentenceObj || !sentenceObj.text) {
    throw new Error("Layer3: Invalid sentence object");
  }

  const scoredTerms = scoreKeywords(sentenceObj, concepts);
  const central = selectCentralConcepts(scoredTerms);

  return {
    centralTerms: central.map(c => c.term),
    scoredTerms
  };
}


// -----------------------------------------------------
// EXPORT
// -----------------------------------------------------
module.exports = {
  extractKeywords
};
