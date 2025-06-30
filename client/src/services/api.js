import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message || error.message
    });
    return Promise.reject(error);
  }
);

// Auth service
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: (userId) => api.get(`/auth/profile/${userId}`),
  demoLogin: () => api.post('/auth/login', { email: 'demo@mealmatch.com', password: '123456' }),
  getAllUsers: () => api.get('/auth/admin/users')
};

// Meal service
export const mealService = {
  getAllMeals: (params) => api.get('/meals', { params }),
  getMealById: (id) => api.get(`/meals/${id}`),
  searchMeals: (query) => api.get('/meals/search', { params: { q: query } }),
  createMeal: (mealData) => api.post('/meals', mealData),
  updateMeal: (id, mealData) => api.put(`/meals/${id}`, mealData),
  deleteMeal: (id) => api.delete(`/meals/${id}`)
};

// Restaurant service
export const restaurantService = {
  getAllRestaurants: (params) => api.get('/restaurants', { params }),
  getRestaurantById: (id) => api.get(`/restaurants/${id}`),
  createRestaurant: (restaurantData) => api.post('/restaurants', restaurantData),
  updateRestaurant: (id, restaurantData) => api.put(`/restaurants/${id}`, restaurantData)
};

// Cart service
export const cartService = {
  getCart: (userId) => api.get(`/cart/${userId}`),
  addToCart: (userId, itemData) => api.post(`/cart/${userId}/add`, itemData),
  updateCart: (userId, cartData) => api.put(`/cart/${userId}`, cartData),
  updateCartItem: (userId, itemId, data) => api.put(`/cart/${userId}/items/${itemId}`, data),
  removeFromCart: (userId, itemId) => api.delete(`/cart/${userId}/items/${itemId}`),
  clearCart: (userId) => api.delete(`/cart/${userId}/clear`)
};

// Order service
export const orderService = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getUserOrders: (userId) => api.get(`/orders/user/${userId}`),
  getOrderById: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  getAllOrders: () => api.get('/orders/admin/all')
};

// Bargain service
export const bargainService = {
  createBargain: (bargainData) => api.post('/bargains', bargainData),
  getUserBargains: (userId) => api.get(`/bargains/user/${userId}`),
  getRestaurantBargains: (restaurantId) => api.get(`/bargains/restaurant/${restaurantId}`),
  getAllBargains: () => api.get('/bargains/admin/all'),
  respondToBargain: (bargainId, responseData) => api.put(`/bargains/${bargainId}/respond`, responseData),
  respondToCounter: (bargainId, response) => api.put(`/bargains/${bargainId}/counter-response`, { response })
};

// Review service
export const reviewService = {
  createReview: (reviewData) => api.post('/reviews', reviewData),
  getMealReviews: (mealId) => api.get(`/reviews/meal/${mealId}`),
  getRestaurantReviews: (restaurantId) => api.get(`/reviews/restaurant/${restaurantId}`),
  updateMealReviewCounts: () => api.put('/reviews/update-counts')
};

export default api;
