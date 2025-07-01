import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://mealmatch-backend.onrender.com/api';

// Create axios instance with enhanced configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 second timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Retry mechanism
const retryRequest = async (requestFn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      console.log(`Request attempt ${i + 1} failed:`, error.message);
      
      if (i === maxRetries - 1) {
        // Last attempt failed
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Enhanced cart service with retry logic
export const enhancedCartService = {
  addToCart: async (userId, itemData) => {
    console.log('Enhanced Cart Service - Add to Cart');
    console.log('User ID:', userId);
    console.log('Item Data:', itemData);
    
    return retryRequest(async () => {
      const response = await api.post(`/cart/${userId}/add`, itemData);
      return response;
    });
  },

  getCart: async (userId) => {
    console.log('Enhanced Cart Service - Get Cart');
    console.log('User ID:', userId);
    
    return retryRequest(async () => {
      const response = await api.get(`/cart/${userId}`);
      return response;
    });
  }
};

export default enhancedCartService;
