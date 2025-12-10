import axios from "axios";
import { saveUser } from "../utils/jwtUtils";

const API_URL = "https://cte-quiz-ml27.onrender.com/api";
//const API_URL = "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to attach auth token
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Token expired error
      if (error.response.status === 401 && error.response.data.message === 'Not authorized, token failed') {
        // Clear user data from localStorage
        localStorage.removeItem('user');
        // Redirect to login page
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const register = async (userData) => {
  const response = await api.post("/users/register", userData);
  return response.data;
};

export const login = async (credentials) => {
  try {
    const response = await api.post("/users/login", credentials);
    if (response.data && response.data.token) {
      const userData = {
        ...response.data.user,
        token: response.data.token,
      };

      // Save user data using our JWT utils
      saveUser(userData);
      return userData;
    }
    throw new Error("Invalid response from server");
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const verifyEmail = async (token) => {
  const response = await api.get(`/users/verify-email/${token}`);
  return response.data;
};

export const requestPasswordReset = async (email) => {
  const response = await api.post("/users/request-password-reset", { email });
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await api.post("/users/reset-password", {
    token,
    newPassword,
  });
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get("/users/profile");
  return response.data;
};

export const updateUserProfile = async (formData) => {
  try {
    // Get the current user data with token
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.token) {
      throw new Error("Authentication required");
    }

    const response = await api.put("/users/profile", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${user.token}`,
      },
    });
    console.log("Server response:", response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error("Profile update error:", error.response?.data || error);
    throw error;
  }
};

// Quiz API calls
export const createQuiz = async (quizData) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !user.token) {
    throw new Error("Authentication required");
  }

  const response = await api.post("/quizzes", quizData, {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  });
  return response.data;
};

export const uploadQuiz = async (formData) => {
  // Get the current user data with token
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !user.token) {
    throw new Error("Authentication required");
  }

  // Create a new FormData object with the correct field name
  const serverFormData = new FormData();

  // Loop through the original formData entries
  for (const [key, value] of formData.entries()) {
    if (key === "pdf") {
      // Change the field name from 'pdf' to 'pdfFile'
      serverFormData.append("pdfFile", value);
    } else {
      // Keep other fields as is
      serverFormData.append(key, value);
    }
  }

  const response = await api.post("/quizzes/upload", serverFormData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${user.token}`,
    },
  });
  return response.data;
};

export const getUserQuizzes = async () => {
  try {
    const response = await api.get("/quizzes", {
      params: {
        createdBy: "me" // Server will get userId from token
      }
    });

    // Check if we have a valid response
    if (!response.data) {
      throw new Error("Invalid response from server");
    }

    // Handle different response structures
    const quizData = response.data.data || response.data;

    // Ensure _id has string format, preserve original createdBy data from server
    const processedQuizData = quizData
      .filter(quiz => quiz && (quiz._id || quiz.id))
      .map((quiz) => ({
        ...quiz,
        _id: (quiz._id || quiz.id || '').toString().trim()
        // Keep createdBy data as received from server
      }));

    // Log warning if quizzes were filtered out
    if (processedQuizData.length < quizData.length) {
      console.warn(`Filtered out ${quizData.length - processedQuizData.length} quizzes with invalid IDs`);
    }

    return {
      success: true,
      data: processedQuizData,
    };
  } catch (error) {
    console.error("Error getting user quizzes:", error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || "Failed to load your quizzes",
    };
  }
};

export const getPublicQuizzes = async () => {
  try {
    const response = await api.get("/quizzes/public");

    // Check if we have a valid response
    if (!response.data) {
      throw new Error("Invalid response from server");
    }

    // Handle different response structures
    const quizData = response.data.data || response.data;

    // Ensure _id has string format, preserve original createdBy data from server
    const processedQuizData = quizData.filter(quiz => quiz && (quiz._id || quiz.id))
      .map((quiz) => ({
        ...quiz,
        _id: (quiz._id || quiz.id || '').toString().trim()
        // Keep createdBy data as received from server
      }));

    // Log warning if quizzes were filtered out
    if (processedQuizData.length < quizData.length) {
      console.warn(`Filtered out ${quizData.length - processedQuizData.length} quizzes with invalid IDs`);
    }

    return {
      success: true,
      data: processedQuizData,
    };
  } catch (error) {
    console.error("Error getting public quizzes:", error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || "Failed to load public quizzes",
    };
  }
};

export const getQuizById = async (quizId) => {
  try {
    if (!quizId) {
      console.error('getQuizById called with invalid quizId:', quizId);
      throw new Error('Quiz ID is required');
    }

    const response = await api.get(`/quizzes/${quizId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching quiz with ID ${quizId}:`, error);
    throw error;
  }
};

export const deleteQuiz = async (quizId) => {
  try {
    // Ensure we have authentication
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.token) {
      throw new Error("Authentication required");
    }

    const response = await api.delete(`/quizzes/${quizId}`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
    return { success: true, message: "Quiz deleted successfully" };
  } catch (error) {
    console.error("Error deleting quiz:", error);
    throw error;
  }
};

export const updateQuiz = async (quizId, quizData) => {
  try {
    // Ensure we have authentication
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.token) {
      throw new Error("Authentication required");
    }

    const response = await api.put(`/quizzes/${quizId}`, quizData, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
    return {
      success: true,
      message: "Quiz updated successfully",
      data: response.data
    };
  } catch (error) {
    console.error("Error updating quiz:", error);
    throw error;
  }
};

// Quiz Submission API calls
export const submitQuizSubmission = async (quizId, answers) => {
  const response = await api.post(`/quizzes/${quizId}/submit`, { answers });
  return response.data;
};

export const getUserSubmissions = async () => {
  const response = await api.get("/submissions/user");
  return response.data;
};

export const getSubmissionById = async (submissionId) => {
  const response = await api.get(`/submissions/${submissionId}`);
  return response.data;
};

// Room API calls for multiplayer functionality
export const createRoom = async (quizId, options = {}) => {
  try {
    console.log("Creating room with quizId:", quizId, "options:", options);
    const response = await api.post("/rooms", { quizId, ...options });

    // Ensure we have a valid response with data
    if (!response.data || !response.data.data) {
      throw new Error("Invalid response from server");
    }

    console.log("Server response for createRoom:", response.data);
    const roomData = response.data.data;

    // Ensure the user knows they are the host by adding a flag
    return {
      success: true,
      data: {
        ...roomData,
        code: roomData.code,
        // Make sure hostId is properly formatted
        hostId: typeof roomData.hostId === "object" ? roomData.hostId._id : roomData.hostId,
        // Explicit flag to indicate this user is the host
        isCreator: true,
        // Host name for display
        hostName: typeof roomData.hostId === "object"
          ? roomData.hostId.displayName || roomData.hostId.username
          : "Host",
      },
    };
  } catch (error) {
    console.error("Error creating room:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to create room",
    };
  }
};

export const getUserRooms = async () => {
  const response = await api.get("/rooms/user");
  return response.data;
};

export const getRoomByCode = async (code) => {
  try {
    // Validate code before making the request
    if (!code || code === "undefined") {
      console.error("Invalid room code received in getRoomByCode:", code);
      return {
        success: false,
        message: "Invalid room code",
      };
    }

    console.log("Fetching room with code:", code);
    const response = await api.get(`/rooms/${code}`);

    // Check if we have a valid response
    if (!response.data) {
      throw new Error("Invalid response from server");
    }

    // Handle different response structures
    const roomData = response.data.data || response.data;

    // Log the raw data we received from the server
    console.log("Raw room data from server:", JSON.stringify(roomData));

    // Special handling for hostId to ensure consistency
    if (roomData.hostId) {
      console.log("Original hostId:", roomData.hostId);
      // If hostId is an object, extract just the _id
      if (typeof roomData.hostId === "object" && roomData.hostId._id) {
        console.log("Converting hostId object to string:", roomData.hostId._id);
        roomData.hostId = roomData.hostId._id.toString();
      } else if (typeof roomData.hostId === "string") {
        console.log("hostId is already a string:", roomData.hostId);
      }
    }

    return {
      success: true,
      data: roomData,
    };
  } catch (error) {
    console.error(`Error getting room with code "${code}":`, error);
    return {
      success: false,
      message: error.response?.data?.message || "Room not found",
    };
  }
};

export const joinRoom = async (code) => {
  const response = await api.post(`/rooms/${code}/join`);
  return response.data;
};

export const startRoom = async (code) => {
  try {
    const response = await api.post(`/rooms/${code}/start`);
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error starting room:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to start room",
    };
  }
};

export const endRoom = async (code) => {
  try {
    const response = await api.post(`/rooms/${code}/end`);
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error ending room:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to end room",
    };
  }
};

export const submitAnswer = async (code, questionId, answerId) => {
  try {
    const response = await api.post(`/rooms/${code}/answer`, {
      questionId,
      answerId,
    });
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error submitting answer:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to submit answer",
    };
  }
};

export const getRoomParticipants = async (code) => {
  try {
    const response = await api.get(`/rooms/${code}/participants`);
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error getting room participants:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to load participants",
    };
  }
};

// Achievement APIs
export const getUserAchievements = async () => {
  try {
    const response = await api.get('/achievements');

    // Validate data before returning it
    if (response && response.data && response.data.data) {
      // Process the data to ensure all objects are valid
      const safeData = (response.data.data || [])
        .filter(item => item !== null && typeof item === 'object')
        .map(item => ({
          ...item,
          // Ensure _id is a string to prevent toString() errors
          _id: item._id ? String(item._id) : `temp-${Math.random().toString(36).substr(2, 9)}`
        }));

      return {
        success: true,
        data: safeData
      };
    } else {
      // If data structure is unexpected, still return a valid response
      console.warn("Unexpected achievements data structure:", response?.data);
      return {
        success: true,
        data: []
      };
    }
  } catch (error) {
    console.error("Error getting achievements:", error);
    // Return empty data array instead of failing
    return {
      success: false,
      message: error.response?.data?.message || "Failed to load achievements",
      data: [] // Ensure we return an empty array on error
    };
  }
};

export const checkAchievements = async () => {
  try {
    const response = await api.post('/achievements/check');
    return {
      success: true,
      data: response.data.data || []
    };
  } catch (error) {
    console.error("Error checking achievements:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to check achievements",
      data: []
    };
  }
};

export const updateAchievement = async (id, data) => {
  try {
    const response = await api.patch(`/achievements/${id}`, data);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error("Error updating achievement:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update achievement"
    };
  }
};

export const checkIsHost = async (code) => {
  try {
    // Call an endpoint that requires authentication to see if the current user is the host
    const response = await api.get(`/rooms/${code}/check-host`);
    return {
      success: true,
      isHost: response.data?.isHost || false
    };
  } catch (error) {
    // If there's an error, default to false but don't treat it as a failure
    console.log("Error checking host status:", error);
    return {
      success: true,
      isHost: false
    };
  }
};

// Admin API endpoints

// Get all users (admin only)
export const getAllUsers = async () => {
  try {
    const response = await api.get('/admin/users');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error("Error getting all users:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to load users",
      data: []
    };
  }
};

// Delete user by ID (admin only)
export const deleteUserById = async (userId) => {
  try {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete user",
      data: null
    };
  }
};

// Get all quizzes (admin only)
export const getAllQuizzes = async () => {
  try {
    const response = await api.get('/admin/quizzes');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error("Error getting all quizzes:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to load quizzes",
      data: []
    };
  }
};

// Delete quiz by ID (admin only)
export const deleteQuizById = async (quizId) => {
  try {
    const response = await api.delete(`/admin/quizzes/${quizId}`);
    return {
      success: true,
      message: response.data.message || "Quiz deleted successfully",
      data: response.data
    };
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete quiz",
      data: null
    };
  }
};

// Update user permissions (admin only)
export const updateUserPermission = async (userId, accountType) => {
  try {
    const response = await api.put('/admin/users/permissions', {
      userId,
      accountType
    });
    return {
      success: true,
      data: response.data,
      message: response.data.message || "User permissions updated successfully"
    };
  } catch (error) {
    console.error("Error updating user permissions:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update user permissions",
      data: null
    };
  }
};

const BASE_URL = 'http://localhost:5000';

export const getLeaderboard = async (timeFrame = 'all', category = 'score', page = 1, limit = 20) => {
  try {
    const response = await api.get(`/leaderboard`, {
      params: { timeFrame, category, page, limit }
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch leaderboard');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching leaderboard:', error.response?.data || error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch leaderboard',
      data: {
        topScorers: [],
        stats: {
          totalParticipants: 0,
          totalQuizzesTaken: 0,
          averageScore: 0,
        },
        pagination: {
          page: 1,
          limit: 20,
          totalUsers: 0,
          totalPages: 1
        }
      }
    };
  }
};

// Rating API calls
export const addRating = async (quizId, rating, comment) => {
  try {
    const response = await api.post("/ratings", { quizId, rating, comment });
    return response.data;
  } catch (error) {
    console.error("Error adding rating:", error);
    throw error;
  }
};

export const getQuizRatings = async (quizId) => {
  try {
    const response = await api.get(`/ratings/quiz/${quizId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting quiz ratings:", error);
    throw error;
  }
};

export const getUserRatings = async () => {
  try {
    const response = await api.get("/ratings/user");
    return response.data;
  } catch (error) {
    console.error("Error getting user ratings:", error);
    throw error;
  }
};

export const deleteRating = async (ratingId) => {
  try {
    const response = await api.delete(`/ratings/${ratingId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting rating:", error);
    throw error;
  }
};
