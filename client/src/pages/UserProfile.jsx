import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile, updateUserProfile } from "../services/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCamera,
  FiEdit2,
  FiLock,
  FiUser,
  FiMail,
  FiCalendar,
  FiArrowLeft,
} from "react-icons/fi";

const DEFAULT_PROFILE_IMAGE =
  "https://cdn-icons-png.flaticon.com/512/147/147144.png";

const UserProfile = ({ user, updateUser }) => {
  const [formData, setFormData] = useState({
    displayName: "",
    profilePicture: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState(DEFAULT_PROFILE_IMAGE);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate("/login");
      return;
    }

    // Load user profile data
    const loadProfile = async () => {
      try {
        const userData = await getUserProfile();
        console.log("Loaded profile data:", userData); // Debug log

        setFormData({
          displayName: userData.displayName || "",
          profilePicture: userData.profilePicture || "",
        });

        // Set preview image based on user's profile picture or default
        if (
          userData.profilePicture &&
          userData.profilePicture !== DEFAULT_PROFILE_IMAGE
        ) {
          // Ensure the URL is absolute
          const imageUrl = userData.profilePicture.startsWith("http")
            ? userData.profilePicture
            : `http://localhost:5000/${userData.profilePicture}`;

          console.log("Setting profile image URL:", imageUrl); // Debug log
          setPreviewImage(imageUrl);
        } else {
          setPreviewImage(DEFAULT_PROFILE_IMAGE);
        }
      } catch (error) {
        setPreviewImage(DEFAULT_PROFILE_IMAGE);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Image size must not exceed 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      try {
        // Create FormData object
        const formData = new FormData();
        formData.append("profilePicture", file);
        formData.append("displayName", formData.displayName || "");

        // Update preview immediately
        const previewUrl = URL.createObjectURL(file);
        setPreviewImage(previewUrl);

        // Upload image to server
        const result = await updateUserProfile(formData);
        console.log("Upload result:", result); // Debug log

        if (result && result.user) {
          // Update user context if available
          if (updateUser && typeof updateUser === "function") {
            updateUser({
              ...user,
              profilePicture: result.user.profilePicture,
            });
          }

          // Update form data with the new image path
          setFormData((prev) => ({
            ...prev,
            profilePicture: result.user.profilePicture,
          }));

          // Update preview with the server URL
          const imageUrl = result.user.profilePicture.startsWith("http")
            ? result.user.profilePicture
            : `http://localhost:5000/${result.user.profilePicture}`;

          console.log("Setting new profile image URL:", imageUrl); // Debug log
          setPreviewImage(imageUrl);

          toast.success("Profile picture updated successfully");
        }

        // Clean up preview URL
        URL.revokeObjectURL(previewUrl);
      } catch (error) {
        console.error("Error updating profile picture:", error);
        toast.error(
          error.response?.data?.message || "Failed to update profile picture"
        );
        // Revert preview if update fails
        setPreviewImage(formData.profilePicture || DEFAULT_PROFILE_IMAGE);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validate display name
      if (!formData.displayName.trim()) {
        toast.error("Please enter a display name");
        setSaving(false);
        return;
      }

      // Create FormData object
      const updateFormData = new FormData();
      updateFormData.append("displayName", formData.displayName.trim());

      // Only append profilePicture if it's a File object
      if (formData.profilePicture instanceof File) {
        updateFormData.append("profilePicture", formData.profilePicture);
      }

      const result = await updateUserProfile(updateFormData);

      if (result && result.user) {
        // Update user context if available
        if (updateUser && typeof updateUser === "function") {
          updateUser({
            ...user,
            displayName: result.user.displayName,
            profilePicture: result.user.profilePicture,
          });
        }

        // Update local state
        setFormData({
          displayName: result.user.displayName,
          profilePicture: result.user.profilePicture,
        });

        // Update preview with the server URL
        const imageUrl = result.user.profilePicture.startsWith("http")
          ? result.user.profilePicture
          : `http://localhost:5000/${result.user.profilePicture}`;

        setPreviewImage(imageUrl);

        toast.success("Profile updated successfully");
      } else {
        throw new Error("No response data from server");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      let errorMessage = "Cannot update profile";

      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = "Cannot connect to server";
      }

      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-screen min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="p-8 text-center border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40">
          <div className="w-16 h-16 mx-auto border-b-2 border-pink-400 rounded-full animate-spin"></div>
          <p className="mt-4 text-xl text-pink-200 font-orbitron">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen min-h-screen overflow-x-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Animated SVG background */}
      <svg
        className="absolute top-0 left-0 z-0 w-full h-full pointer-events-none"
        style={{ filter: "blur(2px)" }}
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

      <div className="relative z-10 px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-between mb-8"
        >
          <h1 className="flex items-center gap-3 text-4xl font-extrabold text-transparent md:text-5xl font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 drop-shadow-lg">
            <FiUser className="inline-block text-yellow-300 animate-bounce" />
            Profile
            <FiEdit2 className="inline-block text-pink-300 animate-spin-slow" />
          </h1>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-6 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-2xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30"
          >
            <FiArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="p-8 border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40"
        >
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Left column - Profile picture and basic info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="md:col-span-1"
            >
              <div className="p-6 border-2 bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 backdrop-blur-xl rounded-2xl border-pink-400/40">
                <div className="relative group">
                  <div className="w-48 h-48 mx-auto overflow-hidden border-4 rounded-full shadow-lg border-pink-400/40">
                    <img
                      src={previewImage}
                      alt="Profile"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-3 text-white transition-all duration-300 transform rounded-full shadow-lg bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 hover:from-pink-400 hover:to-yellow-400"
                  >
                    <FiCamera className="w-6 h-6" />
                  </motion.button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center space-x-3 text-pink-200">
                    <FiUser className="w-5 h-5 text-yellow-400" />
                    <span className="font-orbitron">{user.username}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-pink-200">
                    <FiMail className="w-5 h-5 text-yellow-400" />
                    <span className="font-orbitron">{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-pink-200">
                    <FiCalendar className="w-5 h-5 text-yellow-400" />
                    <span className="font-orbitron">
                      Joined since{" "}
                      {new Date(
                        user.registrationDate || Date.now()
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right column - Edit form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="md:col-span-2"
            >
              <div className="p-6 border-2 bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 backdrop-blur-xl rounded-2xl border-pink-400/40">
                <h2 className="flex items-center mb-6 text-2xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">
                  <FiEdit2 className="mr-2" />
                  Edit Information
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="displayName"
                      className="block mb-2 text-sm font-medium text-pink-200 font-orbitron"
                    >
                      Display Name
                    </label>
                    <input
                      type="text"
                      id="displayName"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 text-pink-200 transition-all duration-200 border-2 bg-indigo-900/50 border-pink-400/40 rounded-xl focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 font-orbitron"
                      placeholder="Enter your display name"
                    />
                    <p className="mt-1 text-xs text-pink-300/80 font-orbitron">
                      This name will be shown to other users
                    </p>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => navigate("/reset-password")}
                      className="flex items-center px-6 py-3 text-pink-200 transition-all duration-300 transform border-2 shadow-lg border-pink-400/40 font-orbitron bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 rounded-xl hover:from-pink-900/50 hover:to-indigo-900/50"
                    >
                      <FiLock className="mr-2" />
                      Change Password
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfile;
