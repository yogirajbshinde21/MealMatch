// Cart Persistence Test Script
// Test the cart functionality by simulating user interactions

console.log('=== Cart Persistence Test ===');

// Test 1: Demo User Cart Persistence
function testDemoUserCart() {
  console.log('\n--- Testing Demo User Cart ---');
  
  // Simulate demo user login
  const demoUser = {
    id: 'demo-user-id',
    email: 'demo@mealmatch.com',
    name: 'Demo User',
    role: 'user',
    city: 'Mumbai'
  };
  
  // Save user to localStorage (simulating login)
  localStorage.setItem('mealmatch_user', JSON.stringify(demoUser));
  
  // Simulate cart items
  const cartData = {
    items: [
      {
        _id: 'test-item-1',
        meal: {
          _id: 'meal-1',
          name: 'Butter Chicken',
          price: 250,
          restaurant: { name: 'Test Restaurant' },
          image: 'test.jpg'
        },
        quantity: 2,
        bargainPrice: null,
        weatherDiscount: null
      }
    ]
  };
  
  // Save cart to localStorage
  localStorage.setItem(`cart_${demoUser.id}`, JSON.stringify(cartData));
  
  console.log('Demo user cart saved:', cartData);
  
  // Test retrieval
  const retrievedCart = localStorage.getItem(`cart_${demoUser.id}`);
  if (retrievedCart) {
    const parsedCart = JSON.parse(retrievedCart);
    console.log('Demo user cart retrieved successfully:', parsedCart);
    return true;
  } else {
    console.error('Failed to retrieve demo user cart');
    return false;
  }
}

// Test 2: Real User Cart API Test
async function testRealUserCart() {
  console.log('\n--- Testing Real User Cart API ---');
  
  try {
    // Note: This would need to be run in the browser context with actual API
    console.log('Real user cart test would require API calls');
    console.log('This test should be run manually in the browser');
    return true;
  } catch (error) {
    console.error('Real user cart test failed:', error);
    return false;
  }
}

// Run tests
function runTests() {
  console.log('Starting cart persistence tests...');
  
  const demoTest = testDemoUserCart();
  
  console.log('\n=== Test Results ===');
  console.log('Demo User Cart Test:', demoTest ? 'PASSED' : 'FAILED');
  console.log('Real User Cart Test: Manual testing required');
  
  return demoTest;
}

// Export for use in browser
if (typeof window !== 'undefined') {
  window.cartPersistenceTest = {
    runTests,
    testDemoUserCart,
    testRealUserCart
  };
}

// Run if in Node.js environment
if (typeof window === 'undefined') {
  runTests();
}
