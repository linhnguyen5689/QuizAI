const Quiz = require("../models/Quiz");
const User = require("../models/User");
const Submission = require("../models/Submission");
const { generateQuizQuestions } = require("../utils/gemini");
const fs = require('fs');
const pdfParse = require('pdf-parse');

const quizService = {
  async createQuiz(userId, quizData) {
    try {
      if (
        !quizData.title ||
        !quizData.questions ||
        !Array.isArray(quizData.questions) ||
        quizData.questions.length === 0
      ) {
        throw new Error("Please type a valid title and list of questions.");
      }

      for (const question of quizData.questions) {
        if (
          !question.content ||
          !question.options ||
          !Array.isArray(question.options) ||
          question.options.length === 0
        ) {
          throw new Error(
            "Question must have content and at least one option."
          );
        }

        for (const option of question.options) {
          if (
            !option.label ||
            typeof option.isCorrect !== "boolean"
          ) {
            throw new Error(
              "Each option must have label and correct/incorrect status."
            );
          }
        }
      }

      const quiz = await Quiz.create({
        title: quizData.title,
        description: quizData.description || "",
        category: quizData.category || "Other",
        questions: quizData.questions,
        createdBy: userId,
        isPublic: quizData.isPublic || false,
      });

      return {
        message: "Quiz created successfully",
        quiz,
      };
    } catch (error) {
      console.error("Error creating quiz:", error);
      throw error;
    }
  },

  async getPublicQuizzes() {
    try {
      const quizzes = await Quiz.find({ isPublic: true })
        .populate("createdBy", "username displayName")
        .sort({ createdAt: -1 });
      return quizzes;
    } catch (error) {
      console.error("Error in getPublicQuizzes:", error);
      throw error;
    }
  },
  async createQuizFromPDF(file, userId, quizData = {}) {
    try {
      // Parse PDF and extract questions
      const questions = await parsePdfForQuestions(file.path);

      // Create quiz
      const quiz = await Quiz.create({
        title: quizData.title || file.originalname.replace(".pdf", ""),
        description: quizData.description || "Quiz created from PDF",
        category: quizData.category || "Other",
        questions,
        createdBy: userId,
        originalPdfName: file.originalname,
        pdfPath: file.path,
        isPublic: quizData.isPublic === "true",
      });

      return {
        message: "Quiz created successfully",
        quiz,
      };
    } catch (error) {
      console.error("Error creating quiz from PDF:", error);
      throw new Error("Failed to create quiz from PDF");
    }
  },

  /**
   * Get all quizzes with optional filters
   */
  async getAllQuizzes(filters = {}) {
    const query = { createdBy: filters.createdBy };

    // Apply additional filters
    if (filters.status) query.status = filters.status;
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
      ];
    }

    const quizzes = await Quiz.find(query)
      .populate("createdBy", "username displayName")
      .sort({ createdAt: -1 });

    return quizzes;
  },

  /**
   * Get a single quiz by ID
   */
  async getQuizById(quizId) {
    try {
      console.log("QuizService: Getting quiz with ID:", quizId);
      const quiz = await Quiz.findById(quizId).populate(
        "createdBy",
        "username displayName"
      );

      if (!quiz) {
        console.log("QuizService: Quiz not found with ID:", quizId);
        throw new Error("Quiz not found");
      }

      console.log("QuizService: Found quiz:", quiz);
      return quiz;
    } catch (error) {
      console.error("Error in getQuizById:", error);
      throw error;
    }
  },

  /**
   * Update a quiz
   */
  async updateQuiz(quizId, userId, updateData) {
    try {
      const quiz = await Quiz.findById(quizId);

      if (!quiz) {
        throw new Error("Quiz not found");
      }

      // For debugging purposes
      console.log("Updating quiz - comparing ownership:", {
        quizCreator: quiz.createdBy.toString(),
        userId: userId.toString()
      });

      // Check ownership using toString() for accurate comparison
      if (quiz.createdBy.toString() !== userId.toString()) {
        throw new Error("Not authorized to update this quiz");
      }

      // Update fields
      if (updateData.title) quiz.title = updateData.title;
      if (updateData.description) quiz.description = updateData.description;
      if (updateData.questions) quiz.questions = updateData.questions;
      if (updateData.status) quiz.status = updateData.status;
      if (updateData.timeLimit) quiz.timeLimit = updateData.timeLimit;
      if (updateData.passingScore) quiz.passingScore = updateData.passingScore;

      await quiz.save();

      return {
        message: "Quiz updated successfully",
        quiz,
      };
    } catch (error) {
      console.error("Error in updateQuiz:", error);
      throw error;
    }
  },

  /**
   * Delete a quiz
   */
  async deleteQuiz(quizId, userId) {
    try {
      const quiz = await Quiz.findById(quizId);

      if (!quiz) {
        throw new Error("Quiz not found");
      }

      // For debugging purposes
      console.log("Deleting quiz - comparing ownership:", {
        quizCreator: quiz.createdBy.toString(),
        userId: userId.toString()
      });

      // Check ownership using toString() for accurate comparison
      if (quiz.createdBy.toString() !== userId.toString()) {
        throw new Error("Not authorized to delete this quiz");
      }

      await quiz.deleteOne();

      return {
        message: "Quiz deleted successfully",
      };
    } catch (error) {
      console.error("Error in deleteQuiz:", error);
      throw error;
    }
  },

  /**
   * Submit quiz answers
   */
  async submitQuizAnswers(quizId, userId, answers) {
    const quiz = await Quiz.findById(quizId).populate('questions.options');
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    // Validate answers format
    if (!Array.isArray(answers)) {
      throw new Error('Answers must be an array');
    }

    // Calculate score and validate answers
    let correctAnswers = 0;
    let totalQuestions = quiz.questions.length;

    answers.forEach(answer => {
      const question = quiz.questions.find(q => q._id.toString() === answer.questionId);
      if (!question) return;

      const correctOption = question.options.find(opt => opt.isCorrect);
      if (!correctOption) return;

      if (answer.selectedAnswer && correctOption._id.toString() === answer.selectedAnswer) {
        correctAnswers++;
      }
    });

    // Create QuizSubmission
    const QuizSubmission = require('../models/QuizSubmission');
    const submission = await QuizSubmission.create({
      userId: userId,
      quizId: quizId,
      score: correctAnswers,
      correctAnswers: correctAnswers,
      totalQuestions: totalQuestions,
      timeSpent: answers.timeSpent || 10, // Default to 10 minutes if not provided
      submittedAt: new Date()
    });

    console.log('Created QuizSubmission:', submission);

    // Forward to submission service for detailed submission
    const submissionService = require('./submissionService');
    return await submissionService.createSubmission(quizId, userId, answers);
  },

  /**
   * Get quiz submissions
   */
  async getQuizSubmissions(quizId, userId) {
    try {
      const quiz = await Quiz.findById(quizId);

      if (!quiz) {
        throw new Error("Quiz not found");
      }

      // For debugging purposes
      console.log("Getting quiz submissions - comparing ownership:", {
        quizCreator: quiz.createdBy.toString(),
        userId: userId.toString()
      });

      // Check ownership using toString() for accurate comparison
      if (quiz.createdBy.toString() !== userId.toString()) {
        throw new Error("Not authorized to view submissions");
      }

      const submissions = await Submission.find({ quizId: quizId })
        .populate("userId", "username displayName")
        .sort({ createdAt: -1 });

      return submissions;
    } catch (error) {
      console.error("Error in getQuizSubmissions:", error);
      throw error;
    }
  },

  async createQuizWithAI(userId, aiQuizData) {
    try {
      // Validate required fields
      if (!aiQuizData.topic) {
        throw new Error("Topic is required for AI quiz generation");
      }

      // Parse and validate number of questions (5-30)
      const numQuestions = parseInt(aiQuizData.numQuestions) || 10;
      if (numQuestions < 5 || numQuestions > 30) {
        throw new Error("Number of questions must be between 5 and 30");
      }

      // Get category or use default
      const category = aiQuizData.category || 'Other';

      // Get language preference or default to English
      const language = aiQuizData.language || 'english';

      // Generate quiz questions using AI
      const generatedQuestions = await generateQuizQuestions(
        aiQuizData.topic,
        numQuestions,
        category,
        aiQuizData.description || '',
        language
      );

      // Create the quiz with the generated questions
      const quiz = await Quiz.create({
        title: aiQuizData.title || `Quiz on ${aiQuizData.topic}`,
        description: aiQuizData.description || `Generated quiz about ${aiQuizData.topic}`,
        category: category,
        language: language,
        questions: generatedQuestions,
        createdBy: userId,
        isPublic: aiQuizData.isPublic || false,
      });

      return {
        message: "AI-generated quiz created successfully",
        quiz,
      };
    } catch (error) {
      console.error("Error creating AI quiz:", error);
      throw error;
    }
  },
};

// Simple PDF parser function
const parsePdfForQuestions = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    const text = data.text;

    // Simple question extraction (this is a basic implementation)
    // In a real application, you'd want more sophisticated parsing
    const lines = text.split('\n').filter(line => line.trim());
    const questions = [];

    // Look for patterns like "1. Question text?" or "Question: text"
    let currentQuestion = null;
    let questionCounter = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check if line looks like a question
      if (line.includes('?') || line.toLowerCase().includes('question')) {
        if (currentQuestion) {
          questions.push(currentQuestion);
        }

        currentQuestion = {
          content: line,
          options: [
            { label: "Option A", isCorrect: false },
            { label: "Option B", isCorrect: true },
            { label: "Option C", isCorrect: false },
            { label: "Option D", isCorrect: false }
          ]
        };
      }
    }

    // Add the last question if exists
    if (currentQuestion) {
      questions.push(currentQuestion);
    }

    // If no questions found, create a default one
    if (questions.length === 0) {
      questions.push({
        content: "Sample question from PDF: " + lines[0] || "Default question",
        options: [
          { label: "Option A", isCorrect: false },
          { label: "Option B", isCorrect: true },
          { label: "Option C", isCorrect: false },
          { label: "Option D", isCorrect: false }
        ]
      });
    }

    return questions;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    // Return a default question if parsing fails
    return [{
      content: "Default question - PDF parsing failed",
      options: [
        { label: "Option A", isCorrect: false },
        { label: "Option B", isCorrect: true },
        { label: "Option C", isCorrect: false },
        { label: "Option D", isCorrect: false }
      ]
    }];
  }
};

module.exports = quizService;
