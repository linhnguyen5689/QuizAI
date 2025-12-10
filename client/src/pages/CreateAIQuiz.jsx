import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaRobot, FaGamepad, FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const CreateAIQuiz = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [quizData, setQuizData] = useState({
    title: '',
    topic: '',
    description: '',
    category: 'Other',
    numQuestions: 10,
    isPublic: false,
    language: 'english'
  });

  const categories = [
    'General Knowledge',
    'Science',
    'History',
    'Geography',
    'Mathematics',
    'Literature',
    'Sports',
    'Entertainment',
    'Technology',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuizData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNumberInput = (e) => {
    const value = parseInt(e.target.value);
    // Limit to range 5-30
    const numQuestions = Math.min(Math.max(5, value || 5), 30);
    setQuizData(prev => ({ ...prev, numQuestions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!quizData.topic) {
      toast.error('Please enter a topic');
      return;
    }

    try {
      setIsLoading(true);
      const toastId = toast.loading('Generating quiz with AI...');

      // Call the AI endpoint
      const response = await fetch('/api/quizzes/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user') || '{}').token}`
        },
        body: JSON.stringify(quizData)
      }).catch(error => {
        console.error('Network error:', error);
        throw new Error('Network error. Please check your connection and try again.');
      });

      // Check if response is OK before trying to parse JSON
      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorText = await response.text();
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (jsonError) {
            // If JSON parsing fails, use the raw text if it's not empty
            if (errorText && errorText.trim()) {
              errorMessage = `Server error: ${errorText.substring(0, 100)}`;
            }
          }
        } catch (textError) {
          console.error('Failed to read error response:', textError);
        }
        throw new Error(errorMessage);
      }

      // Safely parse JSON with additional safeguards
      let data;
      let rawText = '';
      try {
        // First get the raw text
        rawText = await response.text();
        // Then try to parse it
        if (!rawText || !rawText.trim()) {
          throw new Error('Empty response from server');
        }
        data = JSON.parse(rawText);
      } catch (jsonError) {
        console.error('Failed to parse response JSON:', jsonError);
        console.error('Raw response:', rawText.substring(0, 500));
        throw new Error('Invalid server response. The server may be experiencing issues with the AI service.');
      }

      toast.dismiss(toastId);

      if (!data || !data.success) {
        throw new Error(data?.message || 'Failed to create quiz');
      }

      if (!data.data || !data.data._id) {
        throw new Error('Invalid quiz data returned from server');
      }

      toast.success('Quiz created successfully!');
      navigate(`/quiz/${data.data._id}`);
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast.error(error.message || 'Failed to create quiz');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-screen min-h-screen overflow-x-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Animated SVG background */}
      <svg
        className="absolute top-0 left-0 z-0 w-full h-full pointer-events-none"
        style={{ filter: "blur(2px)" }}
      >
        <defs>
          <radialGradient id="g1" cx="50%" cy="50%" r="80%">
            <stop offset="0%" stopColor="#f472b6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="80%" cy="20%" r="300" fill="url(#g1)">
          <animate
            attributeName="cx"
            values="80%;20%;80%"
            dur="12s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="20%" cy="80%" r="200" fill="url(#g1)">
          <animate
            attributeName="cy"
            values="80%;20%;80%"
            dur="16s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>

      <div className="relative z-10 px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-pink-200 hover:text-white transition-all"
            >
              <FaArrowLeft />
              <span className="font-orbitron">Back to Dashboard</span>
            </Link>
          </div>
          <h1 className="flex items-center gap-3 text-4xl font-extrabold text-transparent md:text-5xl font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 drop-shadow-lg">
            <FaRobot className="inline-block text-yellow-300 animate-bounce" />
            Create AI Quiz
            <FaStar className="inline-block text-pink-300 animate-spin-slow" />
          </h1>
          <div></div> {/* Empty div for flex justify-between */}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="p-8 border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40">
            <div className="mb-8 p-6 bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 rounded-2xl border-2 border-pink-400/40">
              <h2 className="text-2xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 mb-4">
                How it works:
              </h2>
              <p className="text-pink-200 font-orbitron mb-4">
                Enter a topic and our AI will automatically create quiz questions for you!
                You can specify how many questions (5-30) you want, choose a category, select a language (English or Vietnamese), and add a description to guide the question generation.
              </p>
              <p className="text-pink-200 font-orbitron">
                <span className="text-yellow-400 font-bold">Pro tip:</span> Adding a detailed description helps the AI generate more focused and relevant questions. For example, instead of just "Solar System", you could specify "Focus on planetary moons and their unique features."
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-pink-200 font-orbitron mb-2">Quiz Title</label>
                <input
                  type="text"
                  name="title"
                  value={quizData.title}
                  onChange={handleInputChange}
                  placeholder="Leave blank to auto-generate from topic"
                  className="w-full p-3 bg-indigo-900/50 border-2 border-pink-400/40 rounded-xl text-pink-200 placeholder-pink-300/50 focus:outline-none focus:border-pink-400 font-orbitron"
                />
              </div>

              <div>
                <label className="block text-pink-200 font-orbitron mb-2">Topic (required)</label>
                <input
                  type="text"
                  name="topic"
                  value={quizData.topic}
                  onChange={handleInputChange}
                  placeholder="e.g., Solar System, World War II, Machine Learning"
                  className="w-full p-3 bg-indigo-900/50 border-2 border-pink-400/40 rounded-xl text-pink-200 placeholder-pink-300/50 focus:outline-none focus:border-pink-400 font-orbitron"
                  required
                />
                <p className="text-sm text-pink-300/80 mt-1 font-orbitron">
                  Be specific for better results: "Ancient Egyptian Mythology" instead of just "History"
                </p>
              </div>

              <div>
                <label className="block text-pink-200 font-orbitron mb-2">Description</label>
                <textarea
                  name="description"
                  value={quizData.description}
                  onChange={handleInputChange}
                  placeholder="Add specific details or context to guide the AI in generating better questions"
                  className="w-full p-3 bg-indigo-900/50 border-2 border-pink-400/40 rounded-xl text-pink-200 placeholder-pink-300/50 focus:outline-none focus:border-pink-400 font-orbitron h-32"
                />
                <p className="text-sm text-pink-300/80 mt-1 font-orbitron">
                  The description will be used to help the AI understand the specific focus and context of your quiz
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-pink-200 font-orbitron mb-2">Category</label>
                  <select
                    name="category"
                    value={quizData.category}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-indigo-900/50 border-2 border-pink-400/40 rounded-xl text-pink-200 focus:outline-none focus:border-pink-400 font-orbitron"
                  >
                    {categories.map(category => (
                      <option key={category} value={category} className="bg-indigo-900">{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-pink-200 font-orbitron mb-2">Number of Questions (5-30)</label>
                  <input
                    type="number"
                    name="numQuestions"
                    value={quizData.numQuestions}
                    onChange={handleNumberInput}
                    min="5"
                    max="30"
                    className="w-full p-3 bg-indigo-900/50 border-2 border-pink-400/40 rounded-xl text-pink-200 focus:outline-none focus:border-pink-400 font-orbitron"
                  />
                </div>
              </div>

              <div>
                <label className="block text-pink-200 font-orbitron mb-2">Language</label>
                <div className="flex space-x-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="language"
                      value="english"
                      checked={quizData.language === 'english'}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-pink-400 border-pink-400/40 focus:ring-pink-400"
                    />
                    <span className="ml-2 text-pink-200 font-orbitron">English</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="language"
                      value="vietnamese"
                      checked={quizData.language === 'vietnamese'}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-pink-400 border-pink-400/40 focus:ring-pink-400"
                    />
                    <span className="ml-2 text-pink-200 font-orbitron">Vietnamese</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  name="isPublic"
                  checked={quizData.isPublic}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-pink-400 border-pink-400/40 focus:ring-pink-400"
                />
                <label htmlFor="isPublic" className="ml-2 text-pink-200 font-orbitron">
                  Make this quiz public
                </label>
              </div>

              <div className="flex justify-end space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 text-pink-200 transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 rounded-xl hover:from-pink-900/50 hover:to-indigo-900/50 hover:scale-105 active:scale-95 border-pink-400/40"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isLoading || !quizData.topic}
                  className={`px-6 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Generating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <FaRobot className="w-5 h-5" />
                      <span>Generate Quiz</span>
                    </div>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateAIQuiz; 