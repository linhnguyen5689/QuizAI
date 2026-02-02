const OpenAI = require("openai");
const config = require("../config/env");

const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY,
});

async function generateQuizQuestions(
  topic,
  numQuestions,
  category = "Other",
  description = "",
  language = "english"
) {
  // ✅ Normalize language
  const validLanguage = ["english", "vietnamese"].includes(
    String(language).toLowerCase()
  )
    ? language.toLowerCase()
    : "english";

  const prompt = `
CRITICAL INSTRUCTION:
- ALL questions and answers MUST be written strictly in ${validLanguage}.
- DO NOT mix languages.
- If language is "vietnamese", use ONLY Vietnamese.
- If language is "english", use ONLY English.

Task:
Generate EXACTLY ${numQuestions} UNIQUE multiple-choice questions.

Quiz Information:
- Topic: "${topic}"
- Category: "${category}"
${description ? `- Description: ${description}` : ""}

Rules:
- Each question has EXACTLY 4 options
- EXACTLY ONE option is correct
- NO explanations
- NO extra text

Output:
Return ONLY valid JSON in this format:

[
  {
    "content": "Question text?",
    "options": [
      { "label": "Option A", "isCorrect": false },
      { "label": "Option B", "isCorrect": true },
      { "label": "Option C", "isCorrect": false },
      { "label": "Option D", "isCorrect": false }
    ]
  }
]
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.6,
  });

  const text = response.choices[0].message.content;

  const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
  if (!jsonMatch) throw new Error("Invalid JSON from OpenAI");

  return JSON.parse(jsonMatch[0]);
}

module.exports = { generateQuizQuestions };
