const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateAdvanced({ text, difficulty, numQuestions, language = "en" }) {
  const prompt = `
You are an expert lecturer.

Generate ${numQuestions} multiple-choice questions.
Difficulty: ${difficulty}
Language: ${language}

Rules:
- Exactly 4 options per question
- Only one correct answer
- No duplicated questions
- Clear and concise wording
- Return ONLY valid JSON array

JSON format:
[
  {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "answer": 0
  }
]

Content:
"""${text}"""
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a professional exam question generator." },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
  });

  const raw = completion.choices[0].message.content;

  // 🔐 an toàn JSON
  const jsonStart = raw.indexOf("[");
  const jsonEnd = raw.lastIndexOf("]") + 1;

  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("OpenAI did not return valid JSON");
  }

  return JSON.parse(raw.slice(jsonStart, jsonEnd));
}

module.exports = { generateAdvanced };
