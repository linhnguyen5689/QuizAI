const axios = require("axios");
const config = require("../config/env");

/**
 * Fallback mock data in case Gemini fails
 */
const fallbackQuizData = [
  {
    content: "What was the first spacecraft to successfully land on Mars?",
    options: [
      { label: "Voyager 1", isCorrect: false },
      { label: "Viking 1", isCorrect: true },
      { label: "Pathfinder", isCorrect: false },
      { label: "Curiosity", isCorrect: false }
    ]
  },
  {
    content: "Who was the first human to travel to space?",
    options: [
      { label: "Neil Armstrong", isCorrect: false },
      { label: "Buzz Aldrin", isCorrect: false },
      { label: "Yuri Gagarin", isCorrect: true },
      { label: "Alan Shepard", isCorrect: false }
    ]
  },
  {
    content: "Which planet has the most moons in our solar system?",
    options: [
      { label: "Jupiter", isCorrect: false },
      { label: "Saturn", isCorrect: true },
      { label: "Uranus", isCorrect: false },
      { label: "Neptune", isCorrect: false }
    ]
  },
  {
    content: "What is the name of SpaceX's first crewed spacecraft?",
    options: [
      { label: "Falcon", isCorrect: false },
      { label: "Dragon", isCorrect: true },
      { label: "Starship", isCorrect: false },
      { label: "Voyager", isCorrect: false }
    ]
  },
  {
    content: "Which space telescope was launched in 1990 and remains operational?",
    options: [
      { label: "Hubble Space Telescope", isCorrect: true },
      { label: "James Webb Space Telescope", isCorrect: false },
      { label: "Spitzer Space Telescope", isCorrect: false },
      { label: "Kepler Space Telescope", isCorrect: false }
    ]
  }
];

/**
 * Call Gemini via REST API v1 (FREE, stable)
 */
async function generateWithGemini(prompt) {
  const url =
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent?key=${config.GOOGLE_GEMINI_KEY}`;

  const response = await axios.post(url, {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ]
  });

  return response.data.candidates[0].content.parts[0].text;
}

/**
 * Generate quiz questions using Gemini (REST API)
 */
async function generateQuizQuestions(
  topic,
  numQuestions,
  category = "Other",
  description = "",
  language = "english"
) {
  try {
    console.log(
      `Gemini API call for topic: ${topic}, API Key exists: ${Boolean(
        config.GOOGLE_GEMINI_KEY
      )}`
    );

    if (!topic) throw new Error("Topic is required");

    if (!numQuestions || numQuestions < 5 || numQuestions > 30) {
      numQuestions = Math.min(Math.max(5, numQuestions || 5), 30);
    }

    if (!config.GOOGLE_GEMINI_KEY) {
      console.warn("Missing Gemini API key, using fallback");
      return useFallbackData(topic, numQuestions);
    }

    const validLanguage = ["english", "vietnamese"].includes(language.toLowerCase())
      ? language.toLowerCase()
      : "english";

    const prompt = `
Generate EXACTLY ${numQuestions} unique multiple-choice quiz questions about "${topic}" in ${validLanguage}.
${description ? `Context: ${description}` : ""}

Rules:
- Each question has 4 options
- EXACTLY one correct answer
- Return ONLY valid JSON
- Structure:

[
  {
    "content": "Question text?",
    "options": [
      { "label": "A", "isCorrect": false },
      { "label": "B", "isCorrect": true },
      { "label": "C", "isCorrect": false },
      { "label": "D", "isCorrect": false }
    ]
  }
]
`;

    const responseText = await generateWithGemini(prompt);

    const jsonMatch = responseText.match(/\[\s*\{.*\}\s*\]/s);
    if (!jsonMatch) {
      console.warn("Gemini response is not valid JSON, using fallback");
      return useFallbackData(topic, numQuestions);
    }

    let questions = JSON.parse(jsonMatch[0]);

    // Ensure exactly one correct answer
    questions = questions.map((q) => {
      const correct = q.options.filter((o) => o.isCorrect);
      if (correct.length !== 1) {
        q.options.forEach((o) => (o.isCorrect = false));
        q.options[0].isCorrect = true;
      }
      return q;
    });

    return questions.slice(0, numQuestions);
  } catch (error) {
    console.error("Gemini error, using fallback:", error.message);
    return useFallbackData(topic, numQuestions);
  }
}

/**
 * Fallback generator
 */
function useFallbackData(topic, numQuestions) {
  console.log(`Using fallback data for "${topic}"`);

  const data = JSON.parse(JSON.stringify(fallbackQuizData)).map((q) => {
    q.content = `${q.content} (Related to ${topic})`;
    const correctIndex = Math.floor(Math.random() * 4);
    q.options.forEach((o, i) => (o.isCorrect = i === correctIndex));
    return q;
  });

  return data.slice(0, numQuestions);
}

module.exports = {
  generateQuizQuestions
};
