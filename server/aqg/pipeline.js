const { segmentText } = require("./layer1_segmentation");
const { mapConcepts } = require("./layer2_ontology");
const { extractKeywords } = require("./layer3_keyword_scoring");
const { parseIntent } = require("./layer4_intent_parsing");
const { generateITQuestion } = require("./layer5_question");
const { routeQuestion, STRATEGIES } = require("./layer6_reasoning");
const { assembleQuiz } = require("./layer7_quizAssembler");

function runPipeline({ text, numQuestions }) {
  // ✅ PHẢI là segmentText, không phải split cũ
  const sentenceObjects = segmentText(text);

  const candidateQuestions = [];

  for (const sentenceObj of sentenceObjects) {
    // 🔥 DÒNG QUAN TRỌNG NHẤT
    // sentenceObj LÀ OBJECT
    const concepts = mapConcepts(sentenceObj);

    const keywordProfile = extractKeywords(sentenceObj, concepts);
    const intentProfile = parseIntent(sentenceObj);

    const mainConcept = concepts[0] || null;

    const routing = routeQuestion({
      sentenceObj,
      concept: mainConcept,
      intentProfile,
      keywordProfile
    });

    let question = null;

    if (routing.type === STRATEGIES.IT_SPECIFIC && mainConcept) {
      question = generateITQuestion({
        concept: mainConcept,
        sentenceObj,
        intentProfile
      });
    }

    if (question) {
      candidateQuestions.push(question);
    }
  }

  return assembleQuiz(candidateQuestions, numQuestions);
}

module.exports = { runPipeline };
