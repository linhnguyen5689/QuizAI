import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  FaUser,
  FaEdit,
  FaLock,
  FaEnvelope,
  FaCalendarAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import "../../styles/Dashboard.css";

const UserProfile = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsEditing(false);
  };

  const handleLogout = () => logout();

  return (
    <div
      className="dashboard-container"
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #E6F3FF 0%, #CDE7FF 100%)",
      }}
    >
      {/* Soft blur HAU */}
      <div
        style={{
          position: "absolute",
          left: "10%",
          top: "5%",
          width: 600,
          height: 600,
          background:
            "radial-gradient(circle, rgba(30,116,215,0.25) 0%, transparent 70%)",
          filter: "blur(80px)",
          opacity: 0.3,
          zIndex: 0,
        }}
      ></div>
      <div
        style={{
          position: "absolute",
          right: "5%",
          bottom: "0%",
          width: 500,
          height: 500,
          background:
            "radial-gradient(circle, rgba(0,58,112,0.25) 0%, transparent 70%)",
          filter: "blur(80px)",
          opacity: 0.25,
          zIndex: 0,
        }}
      ></div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header Card */}
        <div
          className="dashboard-card"
          style={{
            background: "linear-gradient(135deg, #1E74D7 0%, #003A70 100%)",
            border: "3px solid #4BA3FF",
            borderRadius: "2rem",
            color: "#fff",
            boxShadow: "0 8px 32px rgba(0,58,112,0.25)",
            overflow: "hidden",
            marginBottom: "3rem",
          }}
        >
          <div className="relative h-48 dashboard-header"></div>

          <div className="relative px-6 py-8">
            {/* Avatar */}
            <div className="absolute -top-16 left-6">
              <div
                className="flex items-center justify-center w-32 h-32 rounded-full shadow-lg"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "4px solid #fff",
                  boxShadow: "0 4px 32px rgba(30,116,215,0.4)",
                }}
              >
                <FaUser className="w-16 h-16" style={{ color: "#4BA3FF" }} />
              </div>
            </div>

            <div className="ml-36">
              <h1
                className="dashboard-title mb-2"
                style={{ color: "#fff", fontSize: "2.3rem" }}
              >
                {user?.name || "User Name"}
              </h1>

              <p
                className="flex items-center gap-2"
                style={{ color: "#D8ECFF", fontWeight: 500 }}
              >
                <FaEnvelope style={{ color: "#4BA3FF" }} />
                {user?.email || "user@example.com"}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* ACCOUNT INFORMATION */}
          <div
            className="dashboard-card"
            style={{
              background: "linear-gradient(135deg, #1E74D7 0%, #003A70 100%)",
              border: "2px solid #4BA3FF",
              borderRadius: "2rem",
              color: "#fff",
              boxShadow: "0 8px 32px rgba(0,58,112,0.2)",
              padding: "2rem",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2
                className="dashboard-title text-xl"
                style={{
                  color: "#fff",
                  fontSize: "1.5rem",
                }}
              >
                Account Information
              </h2>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="dashboard-btn"
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "1rem",
                  background:
                    "linear-gradient(135deg, #4BA3FF 0%, #1E74D7 100%)",
                  color: "#fff",
                }}
              >
                <FaEdit />
              </button>
            </div>

            {/* FORM EDIT MODE */}
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { label: "Full Name", name: "name" },
                  { label: "Email", name: "email", type: "email" },
                  { label: "New Password", name: "password", type: "password" },
                  {
                    label: "Confirm Password",
                    name: "confirmPassword",
                    type: "password",
                  },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block mb-1" style={{ color: "#A9D7FF" }}>
                      {field.label}
                    </label>

                    <input
                      type={field.type || "text"}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-xl border"
                      style={{
                        background: "rgba(255,255,255,0.15)",
                        borderColor: "#4BA3FF",
                        color: "#fff",
                      }}
                    />
                  </div>
                ))}

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="dashboard-btn"
                    style={{
                      background:
                        "linear-gradient(135deg, #4BA3FF 0%, #1E74D7 100%)",
                      color: "#fff",
                      padding: "0.6rem 1.4rem",
                      borderRadius: "1rem",
                    }}
                  >
                    Save
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      border: "2px solid #A9D7FF",
                      color: "#A9D7FF",
                      padding: "0.6rem 1.4rem",
                      borderRadius: "1rem",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {[
                  {
                    label: "Full Name",
                    value: user?.name,
                    icon: <FaUser />,
                  },
                  {
                    label: "Email",
                    value: user?.email,
                    icon: <FaEnvelope />,
                  },
                  {
                    label: "Member Since",
                    value: "January 2024",
                    icon: <FaCalendarAlt />,
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.12)" }}
                  >
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-lg"
                      style={{
                        background:
                          "linear-gradient(135deg, #4BA3FF 0%, #1E74D7 100%)",
                      }}
                    >
                      {React.cloneElement(item.icon, { color: "white" })}
                    </div>

                    <div>
                      <p className="text-sm" style={{ color: "#A9D7FF" }}>
                        {item.label}
                      </p>
                      <p className="font-medium" style={{ color: "#fff" }}>
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECURITY + DANGER ZONE */}
          <div className="space-y-6">
            {/* SECURITY */}
            <div
              className="dashboard-card"
              style={{
                background: "linear-gradient(135deg, #1E74D7 0%, #003A70 100%)",
                border: "2px solid #4BA3FF",
                borderRadius: "2rem",
                padding: "2rem",
                color: "#fff",
              }}
            >
              <h2
                className="dashboard-title text-xl mb-6"
                style={{ color: "#fff" }}
              >
                Security Settings
              </h2>

              <div className="space-y-4">
                <button
                  className="dashboard-btn flex items-center w-full gap-3"
                  style={{
                    background:
                      "linear-gradient(135deg, #4BA3FF 0%, #1E74D7 100%)",
                    color: "#fff",
                    borderRadius: "1rem",
                    padding: "1rem",
                  }}
                >
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.15)" }}
                  >
                    <FaLock style={{ color: "#4BA3FF" }} />
                  </div>

                  <div className="text-left">
                    <p className="font-medium">Change Password</p>
                    <p className="text-sm" style={{ color: "#A9D7FF" }}>
                      Update your account password
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* ⚠️ DANGER ZONE */}
            <div
              className="dashboard-card"
              style={{
                background:
                  "linear-gradient(135deg, #003A70 0%, #1E74D7 100%)",
                border: "2px solid #D32F2F",
                borderRadius: "2rem",
                padding: "2rem",
                color: "#fff",
              }}
            >
              <h2
                className="dashboard-title text-xl mb-6"
                style={{ color: "#FFD1D1" }}
              >
                Danger Zone
              </h2>

              <button
                onClick={handleLogout}
                className="dashboard-btn flex items-center w-full gap-3"
                style={{
                  background:
                    "linear-gradient(135deg, #EF4444 0%, #D32F2F 100%)",
                  color: "#fff",
                  borderRadius: "1rem",
                  padding: "1rem",
                }}
              >
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  <FaSignOutAlt style={{ color: "#FFD1D1" }} />
                </div>

                <div className="text-left">
                  <p className="font-medium">Logout</p>
                  <p className="text-sm" style={{ color: "#FFD1D1" }}>
                    Sign out of your account
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
