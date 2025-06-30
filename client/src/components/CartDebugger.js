import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { cartService } from '../services/api';

const CartDebugger = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const { user } = useAuth();

  const testAddToCart = async () => {
    setLoading(true);
    setResult('');
    
    try {
      console.log('Testing cart with user:', user);
      
      const testItem = {
        mealId: 'meal1', // Using sample meal ID
        quantity: 1,
        bargainPrice: 250
      };
      
      console.log('Adding test item to cart:', testItem);
      
      const response = await cartService.addToCart(user.id, testItem);
      
      console.log('Cart API response:', response);
      
      setResult(JSON.stringify(response.data, null, 2));
      
    } catch (error) {
      console.error('Cart test error:', error);
      setResult(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetCart = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const response = await cartService.getCart(user.id);
      console.log('Get cart response:', response);
      setResult(JSON.stringify(response.data, null, 2));
      
    } catch (error) {
      console.error('Get cart error:', error);
      setResult(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="alert alert-warning">Please log in to test cart functionality</div>;
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5>Cart API Debugger</h5>
        <small>User: {user.name} (ID: {user.id})</small>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <button 
            className="btn btn-primary me-2" 
            onClick={testAddToCart} 
            disabled={loading}
          >
            {loading ? 'Testing...' : 'Test Add to Cart'}
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={testGetCart} 
            disabled={loading}
          >
            {loading ? 'Testing...' : 'Test Get Cart'}
          </button>
        </div>
        
        {result && (
          <div className="mt-3">
            <h6>Result:</h6>
            <pre className="bg-light p-3 rounded" style={{ fontSize: '12px', maxHeight: '300px', overflow: 'auto' }}>
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDebugger;
