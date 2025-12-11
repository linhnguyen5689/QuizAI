import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/api";
import toast from "react-hot-toast";
import "../styles/CreateRoom.css";

const Login = ({ login: loginUser, user }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (error) {
      toast.error("Invalid email or password", { duration: 4000 });
    }
  }, [error]);

  return (
    <div className="create-room-container" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      
      {/* Card Container */}
      <div
        className="create-room-card"
        style={{
          maxWidth: 900,
          padding: "2.5rem 2.5rem",
          display: "flex",
          gap: "2rem",
          alignItems: "center",
        }}
      >

        {/* LOGO HAU (động) */}
        <img
          src="https://haitrieu.com/wp-content/uploads/2022/01/Logo-DH-Kien-Truc-Ha-Noi-HAU-Tra-1024x1024.png"
          className="logo-animated"
          style={{
            width: "40%",
            height: "auto",
            paddingTop: "20px",
            objectFit: "contain",
          }}
        />

        {/* FORM LOGIN */}
        <div className="login-form" style={{ flex: 1 }}>
          <div className="mb-8 text-center">
            <h1 className="create-room-title" style={{ fontSize: "2.2rem", color: "#003A70" }}>
              Welcome Back
            </h1>
            <p className="create-room-subtitle" style={{ color: "#1E74D7" }}>
              Sign in to your account
            </p>
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
            
            {/* EMAIL INPUT */}
            <div className="form-group">
              <label className="form-label" htmlFor="email" style={{ color: "#003A70" }}>
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
                style={{ backgroundColor: "#ffffff", color: "#000" }}
              />
            </div>

            {/* PASSWORD INPUT */}
            <div className="form-group">
              <label className="form-label" htmlFor="password" style={{ color: "#003A70" }}>
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
                style={{ backgroundColor: "#ffffff", color: "#000" }}
              />
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              className="create-button"
              disabled={loading}
              style={{ width: "100%", marginTop: 16 }}
            >
              {loading ? (
                <div className="loading-spinner" style={{ height: 24, width: 24 }}></div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* FOOTER LINKS */}
          <div style={{ marginTop: 32, textAlign: "center" }}>
            <Link
              to="/forgot-password"
              className="auth-link"
              style={{ color: "#1E74D7", fontWeight: 600 }}
            >
              Forgot password?
            </Link>

            <p style={{ color: "#003A70", marginTop: 8 }}>
              Don't have an account?{" "}
              <Link
                to="/register"
                className="auth-link"
                style={{ color: "#1E74D7", fontWeight: 600 }}
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
