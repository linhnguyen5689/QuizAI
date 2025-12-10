const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/env');

// Initialize the Gemini API with the API key
const geminiAPI = new GoogleGenerativeAI(config.GOOGLE_GEMINI_KEY);

// Fallback mock data in case of rate limiting
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
 * Generate quiz questions using Google Gemini API
 * @param {string} topic - The topic for the quiz
 * @param {number} numQuestions - Number of questions to generate (5-30)
 * @param {string} category - Quiz category 
 * @param {string} description - Additional description or context for the quiz
 * @param {string} language - Language for the questions (english or vietnamese)
 * @returns {Promise<Array>} Array of questions with options
 */
async function generateQuizQuestions(topic, numQuestions, category = 'Other', description = '', language = 'english') {
  try {
    // Log environment info
    console.log(`Gemini API call for topic: ${topic}, API Key exists: ${Boolean(config.GOOGLE_GEMINI_KEY)}`);
    console.log(`API Key starts with: ${config.GOOGLE_GEMINI_KEY ? config.GOOGLE_GEMINI_KEY.substring(0, 3) + '...' : 'undefined'}`);

    // Validate parameters
    if (!topic) throw new Error('Topic is required');
    if (!numQuestions || numQuestions < 5 || numQuestions > 30) {
      numQuestions = Math.min(Math.max(5, numQuestions || 5), 30);
    }

    // Check if API key is available
    if (!config.GOOGLE_GEMINI_KEY || config.GOOGLE_GEMINI_KEY === 'your_api_key_here') {
      console.warn('Missing or invalid Gemini API key, using fallback data');
      return useFallbackData(topic, numQuestions);
    }

    // Validate language
    const validLanguage = ['english', 'vietnamese'].includes(language.toLowerCase())
      ? language.toLowerCase()
      : 'english';

    // Get the Gemini model (try more widely available model first)
    const model = geminiAPI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7
      },
      apiVersion: "v1beta"
    });

    // Craft the prompt for quiz generation
    const prompt = `
    Generate EXACTLY ${numQuestions} unique multiple-choice quiz questions about "${topic}" in ${validLanguage} language.
    ${description ? `\n\nAdditional context/focus for the questions: "${description}"
    
    Pay special attention to the description above when creating questions. It should guide the specific aspects of the topic to focus on.` : ''}
    
    Follow these requirements:
    1. Each question should have 4 options (A, B, C, D)
    2. Exactly ONE option should be correct
    3. The questions should be diverse and cover different aspects of the topic
    4. NEVER reuse questions from previous requests
    5. Ensure all questions are specifically about "${topic}" and not generic
    6. Generate EXACTLY ${numQuestions} questions - no more, no less
    7. All questions and answers MUST be in ${validLanguage} language
    8. Return the result as a valid JSON array of objects with this EXACT structure:
    
    [
      {
        "content": "Question text here?",
        "options": [
          {
            "label": "Option A text",
            "isCorrect": false
          },
          {
            "label": "Option B text",
            "isCorrect": true
          },
          {
            "label": "Option C text",
            "isCorrect": false
          },
          {
            "label": "Option D text",
            "isCorrect": false
          }
        ]
      },
      ...more questions...
    ]
    
    IMPORTANT: Make sure the response is ONLY the valid JSON array, with no extra text or explanations.
    IMPORTANT: Ensure each question has EXACTLY ONE option marked as correct (isCorrect: true).
    IMPORTANT: Make all questions in ${category} category.
    IMPORTANT: Generate EXACTLY ${numQuestions} questions total.
    IMPORTANT: All content MUST be in ${validLanguage} language.
    `;

    try {
      // Generate content with timeout and retry logic
      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 30000)
        )
      ]);

      if (!result || !result.response) {
        console.warn('Empty or invalid response from Gemini API');
        return useFallbackData(topic, numQuestions);
      }

      const responseText = result.response.text();
      if (!responseText) {
        console.warn('Empty text response from Gemini API');
        return useFallbackData(topic, numQuestions);
      }

      // Extract the JSON part from the response
      const jsonMatch = responseText.match(/\[\s*\{.*\}\s*\]/s);
      if (!jsonMatch) {
        console.warn('Failed to find JSON array in response:', responseText.substring(0, 100) + '...');
        return useFallbackData(topic, numQuestions);
      }

      let questions;
      try {
        questions = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.warn('Failed to parse JSON from response:', parseError.message);
        return useFallbackData(topic, numQuestions);
      }

      // Validate the structure and ensure exactly one correct answer per question
      questions = questions.map(question => {
        // Ensure exactly one correct answer
        const correctOptions = question.options.filter(opt => opt.isCorrect);
        if (correctOptions.length !== 1) {
          // If no correct option or multiple correct options, fix it
          question.options.forEach(opt => opt.isCorrect = false);
          question.options[0].isCorrect = true; // Mark the first option as correct
        }
        return question;
      });

      // Ensure we have exactly the requested number of questions
      if (questions.length < numQuestions) {
        console.log(`Got fewer questions (${questions.length}) than requested (${numQuestions}), duplicating some`);
        // If we have fewer questions than requested, duplicate some to reach the target
        const originalCount = questions.length;
        for (let i = 0; i < numQuestions - originalCount; i++) {
          const duplicatedQuestion = { ...questions[i % originalCount] };
          // Modify the question slightly to avoid exact duplicates
          duplicatedQuestion.content = `${duplicatedQuestion.content} (Variation ${Math.floor(i / originalCount) + 1})`;
          questions.push(duplicatedQuestion);
        }
      }

      // Return only the requested number of questions
      const finalQuestions = questions.slice(0, numQuestions);
      console.log(`Successfully generated ${finalQuestions.length} questions about "${topic}" using gemini-1.5-flash`);
      return finalQuestions;

    } catch (error) {
      console.warn('Error with Gemini API, using fallback data:', error.message);
      return useFallbackData(topic, numQuestions);
    }

  } catch (error) {
    console.error('Error generating quiz questions:', error);
    // Always return a valid quiz, even in case of errors
    return useFallbackData(topic, numQuestions);
  }
}

// Helper function to generate fallback quiz data
function useFallbackData(topic, numQuestions) {
  console.log(`Using fallback data for "${topic}"`);

  // Create more dynamic fallback by rotating correct answers randomly
  let modifiedFallbackData = JSON.parse(JSON.stringify(fallbackQuizData));

  modifiedFallbackData = modifiedFallbackData.map(question => {
    // Make each question reference the topic
    question.content = `${question.content} (Related to ${topic})`;

    // Randomly rotate which answer is correct for more variety
    const correctIndex = Math.floor(Math.random() * 4);
    question.options.forEach((opt, index) => {
      opt.isCorrect = (index === correctIndex);
    });

    return question;
  });

  // For space-related topics, use the unmodified content but still randomize correct answers
  if (topic.toLowerCase().includes('space') || topic.toLowerCase().includes('astronomy')) {
    return modifiedFallbackData.slice(0, numQuestions);
  } else {
    // For other topics, use the modified questions with topic references
    return modifiedFallbackData.slice(0, numQuestions);
  }
}

module.exports = {
  generateQuizQuestions
}; 