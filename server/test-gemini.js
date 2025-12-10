const { generateQuizQuestions } = require('./utils/gemini');

async function testGemini() {
  try {
    console.log('Testing Gemini quiz generation...');
    const quiz = await generateQuizQuestions('Space Exploration', 2);
    console.log('Successfully generated quiz:');
    console.log(JSON.stringify(quiz, null, 2));
  } catch (error) {
    console.error('Error generating quiz:', error);
  }
}

testGemini(); 