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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="dashboard-container" style={{minHeight: '100vh', position: 'relative', overflow: 'hidden'}}>
      {/* Hiệu ứng blur động giống dashboard */}
      <div style={{position: 'absolute', left: '10%', top: '5%', width: 600, height: 600, background: 'radial-gradient(circle, #fff 0%, #8b5cf6 60%, transparent 100%)', opacity: 0.08, filter: 'blur(60px)', zIndex: 0}}></div>
      <div style={{position: 'absolute', right: '10%', bottom: '5%', width: 400, height: 400, background: 'radial-gradient(circle, #f59e0b 0%, #fbbf24 60%, transparent 100%)', opacity: 0.10, filter: 'blur(80px)', zIndex: 0}}></div>
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-8 dashboard-card" style={{
          background: 'linear-gradient(120deg, #3a2176 0%, #5a3fd4 50%, #8b5cf6 100%)',
          border: '3px solid #b983ff',
          borderRadius: '2rem',
          boxShadow: '0 8px 32px 0 rgba(99,102,241,0.25)',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div className="relative h-48 dashboard-header" style={{background: 'transparent'}}>
            {/* Có thể thêm icon hoặc hiệu ứng động ở đây nếu muốn */}
          </div>
          <div className="relative px-6 py-8">
            <div className="absolute -top-16 left-6">
              <div className="flex items-center justify-center w-32 h-32 border-4 border-white rounded-full shadow-lg" style={{background: 'rgba(255,255,255,0.10)', boxShadow: '0 4px 32px 0 #8b5cf6', border: '4px solid #fff'}}>
                <FaUser className="w-16 h-16" style={{color: '#fbbf24'}} />
              </div>
            </div>
            <div className="ml-36">
              <h1 className="dashboard-title mb-2" style={{fontSize: '2.5rem'}}>
                {user?.name || "User Name"}
              </h1>
              <p className="flex items-center gap-2" style={{color: '#fff', fontWeight: 500}}>
                <FaEnvelope style={{color: '#fbbf24'}} />
                {user?.email || "user@example.com"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="dashboard-card" style={{
            background: 'linear-gradient(120deg, #3a2176 0%, #5a3fd4 50%, #8b5cf6 100%)',
            border: '2px solid #b983ff',
            borderRadius: '2rem',
            boxShadow: '0 8px 32px 0 rgba(99,102,241,0.15)',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="dashboard-title text-xl" style={{color: '#fff', fontSize: '1.5rem', background: 'none', WebkitTextFillColor: 'unset'}}>
                Account Information
              </h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="dashboard-btn"
                style={{padding: '0.5rem 1.2rem', fontSize: '1.2rem', borderRadius: '1rem'}}
              >
                <FaEdit />
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium" style={{color: '#fbbf24'}}>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border-2 border-[#b983ff] rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    style={{background: 'rgba(255,255,255,0.10)', color: '#fff'}}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium" style={{color: '#fbbf24'}}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border-2 border-[#b983ff] rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    style={{background: 'rgba(255,255,255,0.10)', color: '#fff'}}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium" style={{color: '#fbbf24'}}>New Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border-2 border-[#b983ff] rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    style={{background: 'rgba(255,255,255,0.10)', color: '#fff'}}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium" style={{color: '#fbbf24'}}>Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border-2 border-[#b983ff] rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    style={{background: 'rgba(255,255,255,0.10)', color: '#fff'}}
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="dashboard-btn"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="dashboard-btn"
                    style={{background: 'rgba(255,255,255,0.10)', color: '#fbbf24', border: '2px solid #fbbf24'}}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg" style={{background: 'rgba(255,255,255,0.10)'}}>
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{background: 'linear-gradient(90deg, #fbbf24 0%, #8b5cf6 100%)'}}>
                    <FaUser style={{color: 'white'}} />
                  </div>
                  <div>
                    <p className="text-sm" style={{color: '#fbbf24'}}>Full Name</p>
                    <p className="font-medium" style={{color: '#fff'}}>
                      {user?.name || "User Name"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg" style={{background: 'rgba(255,255,255,0.10)'}}>
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{background: 'linear-gradient(90deg, #fbbf24 0%, #8b5cf6 100%)'}}>
                    <FaEnvelope style={{color: 'white'}} />
                  </div>
                  <div>
                    <p className="text-sm" style={{color: '#fbbf24'}}>Email</p>
                    <p className="font-medium" style={{color: '#fff'}}>
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg" style={{background: 'rgba(255,255,255,0.10)'}}>
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{background: 'linear-gradient(90deg, #fbbf24 0%, #8b5cf6 100%)'}}>
                    <FaCalendarAlt style={{color: 'white'}} />
                  </div>
                  <div>
                    <p className="text-sm" style={{color: '#fbbf24'}}>Member Since</p>
                    <p className="font-medium" style={{color: '#fff'}}>January 2024</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="dashboard-card" style={{
              background: 'linear-gradient(120deg, #3a2176 0%, #5a3fd4 50%, #8b5cf6 100%)',
              border: '2px solid #b983ff',
              borderRadius: '2rem',
              boxShadow: '0 8px 32px 0 rgba(99,102,241,0.15)',
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <h2 className="dashboard-title text-xl mb-6" style={{color: '#fff', fontSize: '1.5rem', background: 'none', WebkitTextFillColor: 'unset'}}>Security Settings</h2>
              <div className="space-y-4">
                <button className="dashboard-btn flex items-center w-full gap-3" style={{background: 'linear-gradient(90deg, #fbbf24 0%, #8b5cf6 100%)', color: '#fff', borderRadius: '1rem'}}>
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{background: 'rgba(255,255,255,0.10)'}}>
                    <FaLock style={{color: '#fbbf24'}} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium" style={{color: '#fff'}}>Change Password</p>
                    <p className="text-sm" style={{color: '#fbbf24'}}>Update your account password</p>
                  </div>
                </button>
                <button className="dashboard-btn flex items-center w-full gap-3" style={{background: 'linear-gradient(90deg, #8b5cf6 0%, #fbbf24 100%)', color: '#fff', borderRadius: '1rem'}}>
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{background: 'rgba(255,255,255,0.10)'}}>
                    <FaEnvelope style={{color: '#8b5cf6'}} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium" style={{color: '#fff'}}>Email Preferences</p>
                    <p className="text-sm" style={{color: '#8b5cf6'}}>Manage your email notifications</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="dashboard-card" style={{
              background: 'linear-gradient(120deg, #3a2176 0%, #5a3fd4 50%, #8b5cf6 100%)',
              border: '2px solid #f59e0b',
              borderRadius: '2rem',
              boxShadow: '0 8px 32px 0 rgba(251,191,36,0.15)',
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <h2 className="dashboard-title text-xl mb-6" style={{color: '#fbbf24', fontSize: '1.5rem', background: 'none', WebkitTextFillColor: 'unset'}}>Danger Zone</h2>
              <button
                onClick={handleLogout}
                className="dashboard-btn flex items-center w-full gap-3"
                style={{background: 'linear-gradient(90deg, #fbbf24 0%, #ef4444 100%)', color: '#fff', borderRadius: '1rem'}}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{background: 'rgba(255,255,255,0.10)'}}>
                  <FaSignOutAlt style={{color: '#ef4444'}} />
                </div>
                <div className="text-left">
                  <p className="font-medium" style={{color: '#fff'}}>Logout</p>
                  <p className="text-sm" style={{color: '#ef4444'}}>Sign out of your account</p>
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
