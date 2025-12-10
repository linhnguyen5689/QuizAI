/**
 * JWT Utility functions for client-side token handling
 */

/**
 * Get the user data from localStorage
 * @returns {Object|null} The user data with token or null if not found
 */
export const getUser = () => {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Check if a user is logged in with a valid token
 * @returns {boolean} True if user is logged in
 */
export const isAuthenticated = () => {
  const user = getUser();
  return !!user && !!user.token;
};

/**
 * Save user data with token to localStorage
 * @param {Object} userData - User data including token
 */
export const saveUser = (userData) => {
  if (!userData || !userData.token) {
    console.error('Invalid user data or missing token');
    return false;
  }
  
  try {
    localStorage.setItem('user', JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error('Error saving user data:', error);
    return false;
  }
};

/**
 * Remove user data from localStorage (logout)
 */
export const removeUser = () => {
  try {
    localStorage.removeItem('user');
    return true;
  } catch (error) {
    console.error('Error removing user data:', error);
    return false;
  }
};

/**
 * Get JWT token from localStorage
 * @returns {string|null} The JWT token or null if not found
 */
export const getToken = () => {
  const user = getUser();
  return user ? user.token : null;
};

/**
 * Decode JWT payload (without verification)
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded token payload or null on error
 */
export const decodeToken = (token) => {
  if (!token) return null;
  
  try {
    // JWT format: header.payload.signature
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if token is expired or invalid
 */
export const isTokenExpired = (token) => {
  const decodedToken = decodeToken(token);
  if (!decodedToken || !decodedToken.exp) return true;
  
  // Compare expiration time with current time
  // exp is in seconds, Date.now() is in milliseconds
  return decodedToken.exp * 1000 < Date.now();
};

/**
 * Check if current user token is expired
 * @returns {boolean} True if user's token is expired or user is not logged in
 */
export const isCurrentTokenExpired = () => {
  const token = getToken();
  if (!token) return true;
  
  return isTokenExpired(token);
}; 