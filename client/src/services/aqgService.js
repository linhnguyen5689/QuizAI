// client/src/services/aqgService.js
import axios from "axios";

const API_URL = "http://localhost:5000/api/aqg";

function getAuthHeaders() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || !user.token) {
    throw new Error("Authentication required");
  }

  return {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  };
}


const aqgService = {
  uploadFile: async (formData) => {
    const user = JSON.parse(localStorage.getItem("user"));

    const res = await axios.post(
      "http://localhost:5000/api/aqg/upload",
      formData,
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );

    return res.data;
  },

  generate: async (payload) => {
    const res = await axios.post(
      `${API_URL}/generate`,
      payload,
      getAuthHeaders()
    );
    return res.data;
  },

  saveAQGQuiz: async (payload) => {
    const res = await axios.post(
       "http://localhost:5000/api/aqg/save",
      payload,
      getAuthHeaders()
    );
    return res.data;
  },
};

export default aqgService;
