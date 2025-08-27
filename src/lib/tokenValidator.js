// File: src/utils/tokenValidator.js
import axios from 'axios';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

/**
 * Validates a user's authentication token by making a request to the API
 * @param {string} token - The authentication token to validate
 * @returns {Promise<boolean>} - True if token is valid, false otherwise
 */
export const validateToken = async (token) => {
  if (!token) return false;
  
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/verify-token`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Check if the response has the expected format from the backend
    return response.data && response.data.code === 200 && response.data.msg === "Token is valid";
  } catch (error) {
    console.error('Token validation error:', error);
    
    // Axios specific error handling
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx (like 401 or 403)
      console.log('Server responded with error:', error.response.status);
      if (error.response.status === 401) {
        console.log('Token is invalid or expired');
      }
      return false;
    } else if (error.request) {
      // The request was made but no response was received
      console.log('No response received:', error.request);
      return false;
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error setting up request:', error.message);
      return false;
    }
  }
};