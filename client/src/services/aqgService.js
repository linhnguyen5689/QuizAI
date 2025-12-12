import axios from "axios";

const API_URL = "http://localhost:5000/api/aqg";

export default {
  uploadFile(formData) {
    return axios.post(`${API_URL}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(res => res.data);
  },

  generate(payload) {
    return axios.post(`${API_URL}/generate`, payload)
      .then(res => res.data);
  },

    saveQuiz: (payload) =>
    axios.post(`${API}/save`, payload, { withCredentials: true }).then((res) => res.data),
};
