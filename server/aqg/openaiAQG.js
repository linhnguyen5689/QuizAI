// server/aqg/openaiAQG.js
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function safeParseJSON(text) {
  try {
    // remove markdown ```json ``` if exists
    const cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error("OpenAI response is not valid JSON");
  }
}

exports.generateOpenAIQuiz = async ({
  text,
  difficulty = "medium",
  numQuestions = 10,
  language = "en",
}) => {
  try {
    const prompt = `
You are an AI quiz generator.

Create ${numQuestions} multiple-choice questions.
Difficulty: ${difficulty}
Language: ${language === "vi" ? "Vietnamese" : "English"}

Rules:
- Each question has 4 options
- Only ONE correct answer
- Answer must be an INDEX (0–3)
- Return JSON ONLY (no markdown, no explanation)

Format:
[
  {
    "question": "Question text",
    "options": ["A", "B", "C", "D"],
    "answer": 0
  }
]

Content:
"""
${text.slice(0, 12000)}
"""
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
    });

    const raw = completion.choices?.[0]?.message?.content;
    if (!raw) {
      throw new Error("Empty response from OpenAI");
    }

    const questions = safeParseJSON(raw);

    if (!Array.isArray(questions)) {
      throw new Error("OpenAI response is not an array");
    }

    return questions;
  } catch (err) {
    console.error("OpenAI AQG error:", err.message);
    throw err; // để controller catch và trả 500
  }
};