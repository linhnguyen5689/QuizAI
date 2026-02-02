// server/aqg/localAQG.js
// =======================
// SMART LOCAL QUESTION GENERATOR – IT VERSION (NO AI)
// =======================

const { runPipeline } = require("./pipeline");

function generateLocalQuiz({ text, numQuestions }) {
  if (typeof text !== "string") {
    throw new Error("Text must be a string");
  }

  return runPipeline({
    text,
    numQuestions: numQuestions || 5
  });
}

module.exports = { generateLocalQuiz };
