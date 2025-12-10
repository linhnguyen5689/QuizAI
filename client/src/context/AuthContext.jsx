import { createContext, useContext, useEffect, useState } from "react";
import { isAuthenticated, removeUser } from "../utils/jwtUtils";

const AuthContext = createContext();

// Provider
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  const logout = () => {
    removeUser(); // Remove user data from localStorage
    localStorage.removeItem("token"); // Remove token
    setIsLoggedIn(false); // Update login state
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => useContext(AuthContext);
