import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const CartSyncTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const { user } = useAuth();
  const { cart, addToCart, refreshCart, getTotalItems } = useCart();

  const addTestResult = (test, success, message) => {
    setTestResults(prev => [...prev, { test, success, message, timestamp: new Date().toLocaleTimeString() }]);
  };

  const runSyncTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      // Test 1: Check initial cart state
      addTestResult('Initial State', true, `Cart has ${getTotalItems()} items`);
      
      // Test 2: Create test meal
      const testMeal = {
        _id: 'sync-test-' + Date.now(),
        name: 'Sync Test Meal',
        price: 299,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100'
      };
      
      addTestResult('Test Meal Created', true, `Created test meal: ${testMeal.name}`);
      
      // Test 3: Add to cart with bargain price
      const bargainPrice = 199;
      const initialCount = getTotalItems();
      
      await addToCart(testMeal, 1, bargainPrice);
      
      // Wait a moment for state to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCount = getTotalItems();
      const countIncreased = newCount > initialCount;
      
      addTestResult('Add to Cart', countIncreased, 
        countIncreased 
          ? `✅ Cart count increased from ${initialCount} to ${newCount}` 
          : `❌ Cart count didn't increase (still ${newCount})`
      );
      
      // Test 4: Check if item exists in cart with correct price
      const addedItem = cart?.items?.find(item => item.meal._id === testMeal._id);
      const hasCorrectPrice = addedItem?.bargainPrice === bargainPrice;
      
      addTestResult('Bargain Price Check', hasCorrectPrice,
        hasCorrectPrice 
          ? `✅ Item added with correct bargain price: ₹${bargainPrice}`
          : `❌ Bargain price not set correctly`
      );
      
      // Test 5: Force refresh and verify persistence
      await refreshCart();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const afterRefreshItem = cart?.items?.find(item => item.meal._id === testMeal._id);
      const persistsAfterRefresh = !!afterRefreshItem;
      
      addTestResult('Persistence Check', persistsAfterRefresh,
        persistsAfterRefresh 
          ? '✅ Item persists after cart refresh'
          : '❌ Item lost after refresh'
      );
      
      addTestResult('Test Complete', true, 'All synchronization tests completed!');
      
    } catch (error) {
      addTestResult('Error', false, `Test failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  if (!user) {
    return (
      <div className="alert alert-warning">
        Please log in to test cart synchronization.
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Cart Synchronization Test</h5>
        <span className="badge bg-info">User: {user.name}</span>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <h6>Current Cart Status:</h6>
            <ul className="list-group mb-3">
              <li className="list-group-item d-flex justify-content-between">
                <span>Total Items:</span>
                <span className="badge bg-primary">{getTotalItems()}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                <span>Cart Items:</span>
                <span className="badge bg-secondary">{cart?.items?.length || 0}</span>
              </li>
            </ul>
            
            <button 
              className="btn btn-primary w-100"
              onClick={runSyncTest}
              disabled={isRunning}
            >
              {isRunning ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Running Tests...
                </>
              ) : (
                'Run Synchronization Test'
              )}
            </button>
          </div>
          
          <div className="col-md-6">
            <h6>Test Results:</h6>
            <div className="bg-dark text-light p-3 rounded" style={{ height: '300px', overflowY: 'auto' }}>
              {testResults.length === 0 ? (
                <small className="text-muted">No tests run yet...</small>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="mb-2">
                    <small className="text-muted">[{result.timestamp}]</small>
                    <br />
                    <span className={result.success ? 'text-success' : 'text-danger'}>
                      {result.test}: {result.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        {cart?.items?.length > 0 && (
          <div className="mt-4">
            <h6>Current Cart Items:</h6>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Original Price</th>
                    <th>Bargain Price</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.meal?.name || 'Unknown'}</td>
                      <td>₹{item.meal?.price || 'N/A'}</td>
                      <td>
                        {item.bargainPrice ? (
                          <span className="text-success">₹{item.bargainPrice}</span>
                        ) : (
                          <span className="text-muted">No discount</span>
                        )}
                      </td>
                      <td>{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSyncTest;
