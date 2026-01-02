// API configuration
// In production, this uses the production URL
// In development, it uses localhost:5001
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://knko-fr.onrender.com' 
    : 'https://knko-fr.onrender.com');

export default {
  API_BASE_URL
};

