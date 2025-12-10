import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ user, logout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout(); // Call the logout function passed as a prop
    navigate("/login"); // Redirect to login page after logout
  };

  return (
    <nav className="bg-white shadow">
      <div className="container px-4 mx-auto">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-indigo-600">
              PDF Quiz Game
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-indigo-600"
                >
                  Dashboard
                </Link>
                <Link
                  to="/upload"
                  className="text-gray-700 hover:text-indigo-600"
                >
                  Upload Quiz
                </Link>
                <Link
                  to="/create-room"
                  className="text-gray-700 hover:text-indigo-600"
                >
                  Create Room
                </Link>
                <Link
                  to="/join-room"
                  className="text-gray-700 hover:text-indigo-600"
                >
                  Join Room
                </Link>

                {/* User dropdown menu */}
                <div className="relative">
                  <button
                    onClick={toggleMenu}
                    className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600 focus:outline-none"
                  >
                    <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full">
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user.username}
                          className="object-cover w-8 h-8 rounded-full"
                        />
                      ) : (
                        <span className="font-semibold text-indigo-700">
                          {user.displayName?.charAt(0) ||
                            user.username?.charAt(0) ||
                            "U"}
                        </span>
                      )}
                    </div>
                    <span>{user.displayName || user.username}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 transition-transform ${menuOpen ? "rotate-180" : ""
                        }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 z-10 w-48 py-1 mt-2 bg-white rounded-md shadow-lg">
                      <Link
                        to="/profile"
                        onClick={closeMenu}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                      >
                        Your Profile
                      </Link>
                      <button
                        onClick={() => {
                          closeMenu();
                          handleLogout();
                          navigate('/login');
                        }}
                        className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-indigo-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/Login.jsx"
                  className="text-gray-700 hover:text-indigo-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
