// =====================================================
// LAYER 2 – IT ONTOLOGY & CONCEPT REASONING ENGINE
// (STANDARDIZED & PIPELINE-SAFE VERSION)
// =====================================================


// -----------------------------------------------------
// ONTOLOGY CONFIGURATION
// -----------------------------------------------------
const IT_ONTOLOGY = {
  api: {
    label: "Application Programming Interface",
    type: "INTERFACE",
    domain: "SOFTWARE",
    abstraction: "HIGH",
    prerequisites: ["http", "client", "server"],
    related: ["authentication", "authorization"],
    misconceptions: [
      "api is a database",
      "api stores data",
      "api is a user interface"
    ]
  },

  database: {
    label: "Database",
    type: "STORAGE",
    domain: "DATA",
    abstraction: "CORE",
    prerequisites: ["data"],
    related: ["backend"],
    misconceptions: [
      "database is a frontend",
      "database handles authentication"
    ]
  },

  authentication: {
    label: "Authentication",
    type: "SECURITY",
    domain: "ACCESS_CONTROL",
    abstraction: "HIGH",
    prerequisites: ["user", "credential"],
    related: ["authorization"],
    misconceptions: [
      "authentication encrypts data",
      "authentication equals authorization"
    ]
  },

  authorization: {
    label: "Authorization",
    type: "SECURITY",
    domain: "ACCESS_CONTROL",
    abstraction: "HIGH",
    prerequisites: ["authentication"],
    related: [],
    misconceptions: [
      "authorization verifies identity"
    ]
  },

  server: {
    label: "Server",
    type: "ARCHITECTURE",
    domain: "NETWORKING",
    abstraction: "CORE",
    prerequisites: ["network"],
    related: ["client"],
    misconceptions: [
      "server is a client application"
    ]
  },

  client: {
    label: "Client",
    type: "ARCHITECTURE",
    domain: "NETWORKING",
    abstraction: "CORE",
    prerequisites: [],
    related: ["server"],
    misconceptions: [
      "client manages database"
    ]
  }
};


// -----------------------------------------------------
// STEP 1 – SAFE CANDIDATE TERM EXTRACTION (FIXED)
// -----------------------------------------------------
function extractCandidateTerms(sentenceObj) {
  if (!sentenceObj || typeof sentenceObj.text !== "string") return [];

  const words = sentenceObj.text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .split(" ");

  const uniqueTerms = new Set();

  for (const w of words) {
    if (IT_ONTOLOGY[w]) {
      uniqueTerms.add(w);
    }
  }

  return [...uniqueTerms];
}


// -----------------------------------------------------
// STEP 2 – CONCEPT NODE CONSTRUCTION
// -----------------------------------------------------
function buildConceptNode(term) {
  const base = IT_ONTOLOGY[term];

  return {
    key: term,
    label: base.label,
    type: base.type,
    domain: base.domain,
    abstraction: base.abstraction,
    prerequisites: [...base.prerequisites],
    related: [...base.related],
    misconceptions: [...base.misconceptions]
  };
}


// -----------------------------------------------------
// STEP 3 – ABSTRACTION WEIGHTING
// -----------------------------------------------------
function computeAbstractionWeight(concept, sentenceObj) {
  let weight = 1;

  if (concept.abstraction === "HIGH") weight += 1.5;
  if (concept.abstraction === "CORE") weight += 1.2;

  if (sentenceObj.itDensity > 0.1) weight += 1;
  if (sentenceObj.discourseRole === "TECHNICAL") weight += 0.5;

  return weight;
}


// -----------------------------------------------------
// STEP 4 – MISCONCEPTION ACTIVATION
// -----------------------------------------------------
function activateMisconceptions(concept, sentenceObj) {
  if (sentenceObj.confidence < 0.4) return [];

  return concept.misconceptions.map(m => ({
    text: m,
    errorType: "CONCEPTUAL",
    severity: concept.abstraction === "HIGH" ? 0.8 : 0.5
  }));
}


// -----------------------------------------------------
// STEP 5 – PREREQUISITE CHECKING
// -----------------------------------------------------
function checkPrerequisites(concept, sentenceObj) {
  const missing = [];

  const text = sentenceObj.text.toLowerCase();

  for (const req of concept.prerequisites) {
    if (!text.includes(req)) {
      missing.push(req);
    }
  }

  return {
    required: concept.prerequisites,
    missing,
    satisfied: missing.length === 0
  };
}


// -----------------------------------------------------
// STEP 6 – SEMANTIC NEIGHBORHOOD
// -----------------------------------------------------
function buildSemanticNeighborhood(concept) {
  return {
    relatedConcepts: [...concept.related],
    inferredRelations: concept.related.map(r => ({
      from: concept.key,
      to: r,
      relation: "RELATED_TO"
    }))
  };
}


// -----------------------------------------------------
// STEP 7 – CONCEPT CONFIDENCE SCORING
// -----------------------------------------------------
function computeConceptConfidence(concept, sentenceObj, abstractionWeight) {
  let score = 0.3;

  score += abstractionWeight * 0.3;
  score += sentenceObj.confidence * 0.4;

  return Math.max(0, Math.min(1, score));
}


// -----------------------------------------------------
// STEP 8 – FULL CONCEPT ENRICHMENT
// -----------------------------------------------------
function enrichConcept(term, sentenceObj) {
  const baseConcept = buildConceptNode(term);

  const abstractionWeight = computeAbstractionWeight(baseConcept, sentenceObj);
  const misconceptions = activateMisconceptions(baseConcept, sentenceObj);
  const prerequisites = checkPrerequisites(baseConcept, sentenceObj);
  const neighborhood = buildSemanticNeighborhood(baseConcept);
  const confidence = computeConceptConfidence(
    baseConcept,
    sentenceObj,
    abstractionWeight
  );

  return {
    ...baseConcept,
    abstractionWeight,
    misconceptions,
    prerequisites,
    neighborhood,
    confidence
  };
}


// -----------------------------------------------------
// MAIN API – MAP SENTENCE TO CONCEPTS (PIPELINE-SAFE)
// -----------------------------------------------------
function mapConcepts(sentenceObj) {
  if (
    !sentenceObj ||
    typeof sentenceObj !== "object" ||
    typeof sentenceObj.text !== "string"
  ) {
    console.error("Layer2 received invalid input:", sentenceObj);
    throw new Error("Layer2: Invalid sentence object");
  }

  const candidateTerms = extractCandidateTerms(sentenceObj);

  if (candidateTerms.length === 0) return [];

  const enrichedConcepts = candidateTerms.map(term =>
    enrichConcept(term, sentenceObj)
  );

  return enrichedConcepts.sort(
    (a, b) =>
      b.confidence * b.abstractionWeight -
      a.confidence * a.abstractionWeight
  );
}


// -----------------------------------------------------
// EXPORT
// -----------------------------------------------------
module.exports = {
  mapConcepts
};
