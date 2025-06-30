// Test script to verify cart API functionality
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

const testCartAPI = async () => {
  try {
    console.log('Testing Cart API...');
    
    // Test data
    const testUserId = '60d5ecb54b24a40015a7b8b0'; // Sample user ID
    const testMealId = '60d5ecb54b24a40015a7b8b1'; // Sample meal ID
    
    console.log('\n1. Testing add to cart with bargain price...');
    const addToCartResponse = await axios.post(`${API_BASE_URL}/cart/${testUserId}/add`, {
      mealId: testMealId,
      quantity: 1,
      bargainPrice: 250
    });
    
    console.log('Add to cart response:', addToCartResponse.data);
    
    console.log('\n2. Testing get cart...');
    const getCartResponse = await axios.get(`${API_BASE_URL}/cart/${testUserId}`);
    
    console.log('Get cart response:', JSON.stringify(getCartResponse.data, null, 2));
    
    console.log('\nCart API test completed successfully!');
    
  } catch (error) {
    console.error('Cart API test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
};

// Run the test
testCartAPI();
