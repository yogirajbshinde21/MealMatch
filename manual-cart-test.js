// Manual Cart Persistence Test
// Run this in browser console to test cart functionality

const testCartPersistence = () => {
  console.log('=== Manual Cart Persistence Test ===');
  
  // Test 1: Check current cart state
  console.log('\n1. Current Cart State:');
  const currentUser = JSON.parse(localStorage.getItem('mealmatch_user') || 'null');
  console.log('Current user:', currentUser);
  
  if (currentUser) {
    if (currentUser.id === 'demo-user-id') {
      const cartData = localStorage.getItem(`cart_${currentUser.id}`);
      console.log('Demo user cart in localStorage:', cartData);
      if (cartData) {
        const parsedCart = JSON.parse(cartData);
        console.log('Parsed cart:', parsedCart);
      }
    } else {
      console.log('Real user - cart should be in MongoDB');
    }
  }
  
  // Test 2: Create test cart data for demo user
  console.log('\n2. Creating Test Cart (Demo User Only):');
  if (currentUser && currentUser.id === 'demo-user-id') {
    const testCart = {
      items: [
        {
          _id: 'test-' + Date.now(),
          meal: {
            _id: 'test-meal-123',
            name: 'Test Persistence Meal',
            price: 199,
            restaurant: { name: 'Test Restaurant' },
            image: 'test.jpg'
          },
          quantity: 1,
          bargainPrice: null,
          weatherDiscount: null
        }
      ]
    };
    
    localStorage.setItem(`cart_${currentUser.id}`, JSON.stringify(testCart));
    console.log('Test cart saved to localStorage');
    
    // Verify it was saved
    const savedCart = localStorage.getItem(`cart_${currentUser.id}`);
    console.log('Verified saved cart:', JSON.parse(savedCart));
  } else {
    console.log('Test cart creation only available for demo users');
  }
  
  // Test 3: Simulate page reload test
  console.log('\n3. Page Reload Test:');
  console.log('To test page reload:');
  console.log('1. Refresh the page (F5 or Ctrl+R)');
  console.log('2. Check if cart items are still present');
  console.log('3. Run this test again to verify');
  
  // Test 4: Logout/Login test instructions
  console.log('\n4. Logout/Login Test:');
  console.log('To test logout/login:');
  console.log('1. Note current cart items');
  console.log('2. Logout from the application');
  console.log('3. Login again with same credentials');
  console.log('4. Check if cart items are restored');
  
  console.log('\n=== Test Complete ===');
  console.log('Check the console output above for results');
};

// Run the test
testCartPersistence();

// Export for manual use
window.testCartPersistence = testCartPersistence;
