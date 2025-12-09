/**
 * HIPAA-compliant secure storage utilities
 * Provides secure token storage with automatic expiration
 */

const TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRY_KEY = 'auth_token_expiry';
const TOKEN_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Store authentication token securely
 * @param {string} token - JWT token to store
 */
export const setToken = (token) => {
  try {
    const expiryTime = Date.now() + TOKEN_DURATION;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
  } catch (error) {
    console.error('Error storing token:', error);
    // Fallback: try sessionStorage if localStorage fails
    try {
      const expiryTime = Date.now() + TOKEN_DURATION;
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
    } catch (sessionError) {
      console.error('Error storing token in sessionStorage:', sessionError);
    }
  }
};

/**
 * Get authentication token if valid
 * @returns {string|null} - Token if valid, null otherwise
 */
export const getToken = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY) || sessionStorage.getItem(TOKEN_EXPIRY_KEY);

    if (!token || !expiryTime) {
      return null;
    }

    // Check if token has expired
    if (Date.now() > parseInt(expiryTime, 10)) {
      // Token expired, remove it
      removeToken();
      return null;
    }

    return token;
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

/**
 * Remove authentication token
 */
export const removeToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} - True if valid token exists
 */
export const isAuthenticated = () => {
  return getToken() !== null;
};

