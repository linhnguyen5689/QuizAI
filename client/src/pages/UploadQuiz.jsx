import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadQuiz } from '../services/api';
import { toast } from 'react-toastify';
import { FiUpload, FiX, FiCheck, FiFileText } from 'react-icons/fi';
import { FaGamepad, FaStar, FaTrophy } from 'react-icons/fa';
import { motion } from 'framer-motion';

const UploadQuiz = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isPublic: false,
    category: 'Other',
    pdfFile: null
  });
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();

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

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'file') {
      if (files[0]) {
        setFormData({
          ...formData,
          pdfFile: files[0]
        });
        setFileName(files[0].name);
      }
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setFormData({
        ...formData,
        pdfFile: file
      });
      setFileName(file.name);
    } else {
      toast.error('Please upload a PDF file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.pdfFile) {
      toast.error('Please select a PDF file');
      return;
    }

    setLoading(true);

    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData || !userData.token) {
        toast.error('Please log in to upload a quiz');
        navigate('/login');
        return;
      }

      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('isPublic', formData.isPublic);
      data.append('pdfFile', formData.pdfFile);

      const response = await uploadQuiz(data);

      toast.success('Quiz created successfully!');
      navigate(`/quiz/${response.quiz._id}`);
    } catch (error) {
      console.error('Error uploading quiz:', error);

      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to upload quiz');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Theme colors (only colors changed — logic & animations preserved)
   * Primary theme: cool blue gradient
   * Accent: warm yellow for CTAs, subtle teal/green for highlights
   */
  const THEME = {
    bgStart: '#072A5F', // deep navy
    bgEnd: '#1E6FB8',   // bright blue
    cardFrom: 'rgba(8,30,72,0.9)', // card dark
    cardTo: 'rgba(27,41,83,0.85)',
    accent: '#F6C84C', // warm yellow accent (CTA highlight)
    accentSoft: 'rgba(246,200,76,0.08)', // soft accent bg
    subtle: '#BFD8FF', // muted text
    inputBg: 'rgba(0,0,0,0.6)',
    borderSoft: 'rgba(110,150,255,0.12)',
    fileIcon: '#5DD1FF' // file icon teal-blue
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-8 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${THEME.bgStart}, ${THEME.bgEnd})`
      }}
    >
      {/* Animated SVG background */}
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
        style={{ filter: 'blur(2px)' }}
      >
        <defs>
          <radialGradient id="g1" cx="50%" cy="50%" r="80%">
            <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="80%" cy="20%" r="300" fill="url(#g1)">
          <animate attributeName="cx" values="80%;20%;80%" dur="12s" repeatCount="indefinite" />
        </circle>
        <circle cx="20%" cy="80%" r="200" fill="url(#g1)">
          <animate attributeName="cy" values="80%;20%;80%" dur="16s" repeatCount="indefinite" />
        </circle>
      </svg>

      <div className="absolute inset-0 opacity-8 pointer-events-none z-0" style={{ backgroundImage: "url('/images/pattern.svg')" }} />

      <div className="relative min-h-screen flex items-center justify-center p-4 w-full z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="w-full max-w-3xl">
          <div
            className="backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border-4"
            style={{
              background: `linear-gradient(180deg, ${THEME.cardFrom}, ${THEME.cardTo})`,
              borderColor: 'rgba(93,209,255,0.06)'
            }}
          >
            <div className="p-10">
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-center mb-10">
                <h1
                  className="text-4xl md:text-5xl font-extrabold font-orbitron mb-2 flex items-center justify-center gap-3"
                  style={{
                    background: `linear-gradient(90deg, ${THEME.accent}, ${THEME.fileIcon})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    dropShadow: '0 8px 24px rgba(0,0,0,0.3)'
                  }}
                >
                  <FaGamepad style={{ color: THEME.accent }} className="inline-block animate-bounce" />
                  Upload Quiz
                  <FaStar style={{ color: THEME.fileIcon }} className="inline-block animate-spin-slow" />
                </h1>
                <p className="text-lg font-orbitron" style={{ color: THEME.subtle, textShadow: '0 2px 8px rgba(0,0,0,0.35)' }}>
                  Create a quiz by uploading a PDF file
                </p>
              </motion.div>

              <form onSubmit={handleSubmit}>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="mb-6">
                  <label htmlFor="title" className="block text-sm font-bold mb-2 font-orbitron" style={{ color: THEME.accent }}>
                    Quiz Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 rounded-xl font-orbitron text-lg placeholder:text-pink-200 focus:ring-2 transition-colors shadow-lg"
                    placeholder="Enter a title for your quiz"
                    style={{
                      background: THEME.inputBg,
                      color: '#E8F3FF',
                      borderColor: THEME.borderSoft
                    }}
                  />
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="mb-6">
                  <label htmlFor="description" className="block text-sm font-bold mb-2 font-orbitron" style={{ color: THEME.accent }}>
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 border-2 rounded-xl font-orbitron text-lg placeholder:text-pink-200 focus:ring-2 transition-colors shadow-lg"
                    placeholder="Describe what this quiz is about"
                    style={{
                      background: THEME.inputBg,
                      color: '#E8F3FF',
                      borderColor: THEME.borderSoft
                    }}
                  ></textarea>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.5 }} className="mb-6">
                  <label htmlFor="category" className="block text-sm font-bold mb-2 font-orbitron" style={{ color: THEME.accent }}>
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 rounded-xl font-orbitron text-lg focus:ring-2 transition-colors shadow-lg"
                    style={{
                      background: THEME.inputBg,
                      color: '#E8F3FF',
                      borderColor: THEME.borderSoft
                    }}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category} className="bg-black/80" style={{ background: 'transparent', color: '#0ff' }}>
                        {category}
                      </option>
                    ))}
                  </select>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="mb-8">
                  <label className="flex items-center font-orbitron" style={{ color: THEME.subtle }}>
                    <input
                      type="checkbox"
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handleChange}
                      className="h-4 w-4 rounded shadow"
                      style={{ accentColor: THEME.accent }}
                    />
                    <span className="ml-2">Make this quiz public</span>
                  </label>
                  <p className="text-sm mt-1 ml-6 font-orbitron" style={{ color: '#CFE8FF' }}>
                    Public quizzes can be viewed and taken by everyone
                  </p>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.7 }} className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold font-orbitron" style={{ color: THEME.accent }}>
                      Upload PDF File
                    </h2>
                  </div>

                  <div
                    className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition-all duration-200`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={{
                      borderColor: isDragging ? THEME.accent : 'rgba(255,255,255,0.06)',
                      background: isDragging ? THEME.accentSoft : 'transparent'
                    }}
                  >
                    <div className="space-y-3 text-center">
                      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex justify-center">
                        <FiFileText className="h-16 w-16 transition-colors" style={{ color: isDragging ? THEME.accent : THEME.fileIcon }} />
                      </motion.div>

                      <div className="flex flex-col items-center space-y-2">
                        <label
                          htmlFor="pdf-upload"
                          className="relative cursor-pointer rounded-xl font-medium px-4 py-2 border-2 transition-all duration-200"
                          style={{
                            background: THEME.inputBg,
                            color: THEME.accent,
                            borderColor: isDragging ? THEME.accent : 'rgba(255,255,255,0.06)'
                          }}
                        >
                          <span className="flex items-center">
                            <FiUpload className="mr-2" />
                            Choose PDF file
                          </span>
                          <input id="pdf-upload" name="pdfFile" type="file" accept=".pdf" className="sr-only" onChange={handleChange} />
                        </label>
                        <p className="text-sm" style={{ color: '#CFE8FF' }}>or drag and drop file here</p>
                      </div>

                      <p className="text-xs font-orbitron" style={{ color: '#9EC9FF' }}>PDF up to 10MB</p>

                      {fileName && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.48)', border: `1px solid rgba(255,255,255,0.04)` }}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <FiFileText style={{ color: THEME.accent }} />
                              <span className="text-sm font-orbitron" style={{ color: '#DFF4FF' }}>{fileName}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, pdfFile: null }));
                                setFileName('');
                              }}
                              className="hover:text-yellow-300"
                              style={{ color: '#9EC9FF' }}
                            >
                              <FiX />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }} className="flex space-x-4 mt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-4 px-6 font-orbitron text-white font-bold rounded-2xl shadow-xl focus:outline-none focus:ring-2 transition-all duration-300 transform"
                    style={{
                      background: `linear-gradient(90deg, ${THEME.accent}, ${THEME.fileIcon})`,
                      border: '1px solid rgba(255,255,255,0.06)',
                      boxShadow: '0 12px 30px rgba(18,40,90,0.45)'
                    }}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </div>
                    ) : (
                      <span className="flex items-center gap-2 justify-center"><FaTrophy style={{ color: THEME.accent }} />Upload Quiz</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="flex-1 py-4 px-6 font-orbitron font-bold rounded-2xl transition-all duration-300 shadow-xl"
                    style={{
                      background: 'rgba(0,0,0,0.48)',
                      color: '#CFE8FF',
                      border: `1px solid rgba(255,255,255,0.04)`
                    }}
                  >
                    Cancel
                  </button>
                </motion.div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UploadQuiz;
