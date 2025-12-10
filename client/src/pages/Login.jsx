import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/api";
import toast from "react-hot-toast";
import { FaUserAstronaut } from "react-icons/fa";
import "../styles/CreateRoom.css";

const Login = ({ login: loginUser, user }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Redirect nếu đã đăng nhập → về dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = await login({ email, password });
      loginUser(userData);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (error) {
      toast.error("Invalid email or password   ", { duration: 4000 });
    }
  }, [error]);

  return (
    <div className="create-room-container">
      {/* Animated SVG background */}
      <svg
        className="animated-bg-svg"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          filter: "blur(2px)",
        }}
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
      <div
        className="create-room-card"
        style={{
          zIndex: 1,
          position: "relative",
          maxWidth: 540,
          padding: "2.5rem 2.5rem",
          margin: "48px auto",
        }}
      >
        <div className="mb-8 text-center">
          <h1 className="create-room-title" style={{ fontSize: "2.2rem" }}>
            <FaUserAstronaut className="create-room-animated-icon" />
            Welcome Back
          </h1>
          <p className="create-room-subtitle">Sign in to your account</p>
        </div>
        {error && (
          <div className="error-message">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label
              className="form-label"
              htmlFor="email"
              style={{ color: "#ffe259" }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              style={{ color: "#000000", backgroundColor: "#ffffff" }}
            />
          </div>
          <div className="form-group">
            <label
              className="form-label"
              htmlFor="password"
              style={{ color: "#ffe259" }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{ color: "#000000", backgroundColor: "#ffffff" }}
            />
          </div>
          <button
            type="submit"
            className="create-button"
            disabled={loading}
            style={{ width: "100%", marginTop: 16 }}
          >
            {loading ? (
              <div
                className="ml-44 loading-spinner"
                style={{ height: 24, width: 24 }}
              ></div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
        <div style={{ marginTop: 32, textAlign: "center" }}>
          <Link
            to="/forgot-password"
            className="auth-link"
            style={{
              color: "#ffe259",
              fontWeight: 600,
              marginBottom: 8,
              display: "inline-block",
            }}
          >
            Forgot password?
          </Link>
          <p style={{ color: "#e0e7ff", marginTop: 8 }}>
            Don't have an account?{" "}
            <Link
              to="/register"
              className="auth-link"
              style={{ color: "#f472b6", fontWeight: 600 }}
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
