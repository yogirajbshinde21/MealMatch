import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { cartService } from '../services/api';
import { enhancedCartService } from '../services/enhancedCartService';

const CartTestPage = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const runCartTest = async () => {
    setLoading(true);
    setResult('Starting cart test...\n');
    
    try {
      if (!user) {
        throw new Error('User not logged in');
      }

      // Test 1: Health check
      setResult(prev => prev + 'Test 1: Checking server health...\n');
      const healthResponse = await fetch('http://localhost:5000/api/health');
      const healthData = await healthResponse.json();
      setResult(prev => prev + `✅ Server is ${healthData.status}\n\n`);

      // Test 2: Get current cart
      setResult(prev => prev + 'Test 2: Getting current cart...\n');
      const cartResponse = await cartService.getCart(user.id);
      setResult(prev => prev + `✅ Cart retrieved: ${cartResponse.data.cart.items.length} items\n\n`);

      // Test 3: Add test item to cart
      setResult(prev => prev + 'Test 3: Adding test item to cart...\n');
      const testItem = {
        mealId: 'test-meal-' + Date.now(),
        quantity: 1,
        bargainPrice: 299
      };
      
      const addResponse = await cartService.addToCart(user.id, testItem);
      setResult(prev => prev + `✅ Item added successfully\n`);
      setResult(prev => prev + `Response: ${JSON.stringify(addResponse.data, null, 2)}\n\n`);

      setResult(prev => prev + '🎉 All cart tests passed!\n');

    } catch (error) {
      setResult(prev => prev + `❌ Test failed: ${error.message}\n`);
      if (error.response) {
        setResult(prev => prev + `Status: ${error.response.status}\n`);
        setResult(prev => prev + `Data: ${JSON.stringify(error.response.data, null, 2)}\n`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          Please log in to test cart functionality.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h4>Cart API Test Page</h4>
              <small>User: {user.name} (ID: {user.id})</small>
            </div>
            <div className="card-body">
              <button 
                className="btn btn-primary mb-3" 
                onClick={runCartTest}
                disabled={loading}
              >
                {loading ? 'Running Tests...' : 'Run Cart Tests'}
              </button>
              
              <div className="bg-dark text-light p-3 rounded" style={{ minHeight: '300px', fontFamily: 'monospace' }}>
                <pre>{result || 'Click "Run Cart Tests" to start testing...'}</pre>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h6>Manual Test Instructions</h6>
            </div>
            <div className="card-body">
              <ol>
                <li>Make sure the backend server is running on port 5000</li>
                <li>Click "Run Cart Tests" to test the API</li>
                <li>Check the console for detailed logs</li>
                <li>Try adding items to cart from the bargain offers page</li>
              </ol>
              
              <div className="mt-3">
                <h6>Expected Behavior:</h6>
                <ul>
                  <li>✅ Server health check passes</li>
                  <li>✅ Cart can be retrieved</li>
                  <li>✅ Items can be added to cart</li>
                  <li>✅ Bargain prices are preserved</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartTestPage;
