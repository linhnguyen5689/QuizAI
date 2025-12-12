// client/src/pages/CreateAIQuiz2.jsx
import React, { useState, useRef } from "react";
import aqgService from "../services/aqgService";
import { useNavigate } from "react-router-dom";
import { FaCloudUploadAlt, FaSpinner, FaRobot, FaSave, FaSyncAlt, FaTrashAlt } from "react-icons/fa";
import "./CreateAIQuiz2.css";

export default function CreateAIQuiz2() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [inputText, setInputText] = useState("");
  const [mode, setMode] = useState("semantic");
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState("medium");
  const [language, setLanguage] = useState("en");
  const [isPublic, setIsPublic] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // handle file selection / upload
  const handleFileChange = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", selected);
      const res = await aqgService.uploadFile(formData); // expects { success: true, text }
      if (res?.text) {
        setInputText(res.text);
      } else if (res?.data?.text) {
        setInputText(res.data.text);
      }
    } catch (err) {
      console.error(err);
      setError("Không thể đọc file — kiểm tra server hoặc định dạng file.");
    } finally {
      setUploading(false);
    }
  };

  // generate questions
  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setError("Vui lòng nhập hoặc upload tài liệu trước khi sinh câu hỏi.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const payload = {
        text: inputText,
        numQuestions,
        mode,
        difficulty,
        language,
      };
      const res = await aqgService.generate(payload); // expects { success: true, questions: [...] }
      const qs = res.questions || res.data?.questions || [];
      setQuestions(qs);
    } catch (err) {
      console.error(err);
      setError("Sinh câu hỏi thất bại. Kiểm tra server hoặc logs.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveQuestion = (i) => {
    setQuestions(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleRegenerateQuestion = (index) => {
    // simple: regenerate entire set (you can refine to regenerate single later)
    handleGenerate();
  };

    const handleSaveQuiz = async () => {
    if (!questions.length) return setError("No questions to save.");

    try {
        const payload = {
        title: "AI Generated Quiz",
        questions,
        isPublic,
        };

        const res = await aqgService.saveQuiz(payload);

        if (res.success) {
        alert("Quiz saved successfully!");
        navigate(`/quiz/${res.quiz._id}`);
        }
    } catch (err) {
        console.error(err);
        alert("Failed to save quiz.");
    }
    };


  const clearFile = () => {
    setFile(null);
    setInputText("");
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  return (
    <div className="ai2-page">
      <div className="ai2-background">
        <svg className="blob blob-1" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(300,300)">
            <path d="M120,-162C153,-126,178,-95,190,-57C202,-18,202,28,179,62C156,96,110,118,68,142C25,166,-14,192,-55,181C-96,170,-138,122,-151,76C-164,30,-148,-13,-127,-52C-106,-90,-80,-124,-46,-155C-12,-187,27,-216,66,-206C105,-196,135,-178,120,-162Z" />
          </g>
        </svg>
        <svg className="blob blob-2" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(300,300)">
            <path d="M120,-162C153,-126,178,-95,190,-57C202,-18,202,28,179,62C156,96,110,118,68,142C25,166,-14,192,-55,181C-96,170,-138,122,-151,76C-164,30,-148,-13,-127,-52C-106,-90,-80,-124,-46,-155C-12,-187,27,-216,66,-206C105,-196,135,-178,120,-162Z" />
          </g>
        </svg>
      </div>

      <div className="ai2-container glass">
        <header className="ai2-header">
          <div className="title-left">
            <FaRobot className="robot-icon" />
            <div>
              <h1>AI Quiz Generator 2.0</h1>
              <p className="subtitle">Split layout — Upload & settings (left) · Live preview (right)</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn ghost" onClick={() => navigate(-1)}>Back</button>
            <button className="btn accent" onClick={handleGenerate}>
              {loading ? <FaSpinner className="spin" /> : "Generate"}
            </button>
          </div>
        </header>

        <main className="ai2-main">
          {/* LEFT: Upload + Settings */}
          <section className="left-col">
            <div className="card upload-card">
              <div className="upload-top">
                <h3>Upload or paste materials</h3>
                <p className="muted">PDF / DOCX / TXT — max 20MB</p>
              </div>

              <label className="dropzone" onDragOver={(e)=>e.preventDefault()}>
                <div className="dz-inner">
                  <FaCloudUploadAlt className="dz-icon" />
                  <div>
                    <div className="dz-line">Drag & drop or click to upload</div>
                    <div className="dz-sub">File: {file ? file.name : "No file selected"}</div>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  className="file-input"
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                />
              </label>

              <div className="or-sep">OR</div>

              <textarea
                className="material-input"
                placeholder="Paste your study materials here (or upload file)..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={10}
              />

              <div className="upload-actions">
                <button className="btn subtle" onClick={clearFile}>Clear</button>
                <div className="uploader-status">
                  {uploading && <><FaSpinner className="spin small" /> Extracting text...</>}
                </div>
              </div>
            </div>

            <div className="card settings-card">
              <h3>AI Settings</h3>
              <div className="settings-grid">
                <label>
                  Mode
                  <select value={mode} onChange={(e)=>setMode(e.target.value)}>
                    <option value="template">Template-based (Fast)</option>
                    <option value="semantic">Semantic-based (Best)</option>
                  </select>
                </label>

                <label>
                  Difficulty
                  <select value={difficulty} onChange={(e)=>setDifficulty(e.target.value)}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </label>

                <label>
                  Number of Questions
                  <input type="number" min="1" max="50" value={numQuestions} onChange={(e)=>setNumQuestions(parseInt(e.target.value||0))} />
                </label>

                <label>
                  Language
                  <select value={language} onChange={(e)=>setLanguage(e.target.value)}>
                    <option value="en">English</option>
                    <option value="vi">Vietnamese</option>
                  </select>
                </label>

                <label className="toggle-row">
                  <input type="checkbox" checked={isPublic} onChange={(e)=>setIsPublic(e.target.checked)} />
                  <span>Make quiz public</span>
                </label>
              </div>

              <div className="settings-actions">
                <button className="btn secondary" onClick={handleGenerate}>
                  {loading ? <FaSpinner className="spin" /> : "⚡ Generate Questions"}
                </button>
                <button className="btn save" onClick={handleSaveQuiz}><FaSave /> Save Quiz</button>
              </div>
              {error && <div className="error">{error}</div>}
            </div>
          </section>

          {/* RIGHT: Preview */}
          <section className="right-col">
            <div className="card preview-card">
              <div className="preview-header">
                <h3>Preview</h3>
                <div className="preview-actions">
                  <button className="icon-btn" onClick={()=>{ setQuestions([]); }}>
                    <FaTrashAlt />
                  </button>
                  <button className="icon-btn" onClick={()=>handleRegenerateQuestion()}>
                    <FaSyncAlt />
                  </button>
                </div>
              </div>

              {questions.length === 0 ? (
                <div className="empty-preview">
                  <p>No questions yet — generate to preview.</p>
                  <button className="btn ghost" onClick={handleGenerate}>
                    {loading ? <FaSpinner className="spin" /> : <><FaRobot /> Generate Sample</>}
                  </button>
                </div>
              ) : (
                <div className="questions-list">
                  {questions.map((q, idx) => (
                    <article key={idx} className="question-card">
                      <div className="q-top">
                        <div className="q-index">Q{idx+1}</div>
                        <div className="q-text">{q.question || q.prompt || "No question text"}</div>
                      </div>

                      <ol className="q-options" type="A">
                        {(q.options || []).map((opt, i) => (
                          <li key={i} className={i === q.answer ? "correct" : ""}>{opt}</li>
                        ))}
                      </ol>

                      <div className="q-footer">
                        <div className="q-meta">Difficulty: {q.difficulty || difficulty}</div>
                        <div className="q-actions">
                          <button className="icon-btn" title="Remove" onClick={()=>handleRemoveQuestion(idx)}><FaTrashAlt /></button>
                          <button className="icon-btn" title="Regenerate" onClick={()=>handleRegenerateQuestion(idx)}><FaSyncAlt /></button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
