import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWeather } from '../context/WeatherContext';
import weatherService from '../services/weatherService';

const WeatherDebugger = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { weather, discountPercent, currentCity } = useWeather();

  const testUserWeatherAPI = async () => {
    if (!user || !user.city) return;
    
    setLoading(true);
    try {
      console.log(`🧪 Testing weather API for user's city: ${user.city}...`);
      const result = await weatherService.getCurrentWeather(user.city);
      
      const discount = weatherService.calculateWeatherDiscount(result.current.condition.text);
      const pricing = weatherService.applyWeatherPricing(200, discount);
      
      setTestResult({
        success: true,
        city: user.city,
        condition: result.current.condition.text,
        temp: result.current.temp_c,
        humidity: result.current.humidity,
        discount: discount,
        pricing: pricing,
        timestamp: new Date().toLocaleTimeString(),
        apiResponse: result
      });
      
      console.log(`✅ ${user.city} weather test successful:`, result);
    } catch (error) {
      console.error(`❌ ${user.city} weather test failed:`, error);
      setTestResult({
        success: false,
        city: user.city,
        error: error.message,
        timestamp: new Date().toLocaleTimeString()
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    // Auto-test user's city on component mount
    if (user && user.city) {
      testUserWeatherAPI();
    }
  }, [user]);

  if (!user || !user.city) {
    return (
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">🌤️ Weather API Status</h5>
        </div>
        <div className="card-body">
          <div className="alert alert-warning">
            <i className="bi bi-exclamation-triangle me-2"></i>
            No city selected for current user. Please set your city in profile.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            🌤️ Weather API Status - {user.city}
            {loading && <span className="spinner-border spinner-border-sm ms-2"></span>}
          </h5>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={testUserWeatherAPI}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Refresh
          </button>
        </div>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <strong>API Key Status:</strong> 
          <span className="badge bg-success ms-2">✅ Active</span>
        </div>
        
        <div className="mb-3">
          <strong>User's City:</strong> 
          <span className="badge bg-primary ms-2">{user.city}</span>
        </div>

        {testResult && (
          <div className={`alert ${testResult.success ? 'alert-success' : 'alert-danger'} mb-3`}>
            <div className="d-flex justify-content-between align-items-start">
              <div className="flex-grow-1">
                <div className="d-flex align-items-center mb-2">
                  <strong>{testResult.city}</strong>
                  <small className="text-muted ms-2">{testResult.timestamp}</small>
                  <span className={`badge ${testResult.success ? 'bg-success' : 'bg-danger'} ms-2`}>
                    {testResult.success ? '✅' : '❌'}
                  </span>
                </div>
                {testResult.success ? (
                  <div className="row">
                    <div className="col-md-6">
                      <div><strong>Condition:</strong> {testResult.condition}</div>
                      <div><strong>Temperature:</strong> {testResult.temp}°C</div>
                      <div><strong>Humidity:</strong> {testResult.humidity}%</div>
                      <div><strong>Discount:</strong> {testResult.discount}%</div>
                    </div>
                    <div className="col-md-6">
                      <div><strong>Sample Price (₹200):</strong></div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-decoration-line-through text-muted">₹{testResult.pricing.basePrice}</span>
                        <span className="fw-bold text-success fs-5">₹{testResult.pricing.finalPrice}</span>
                        {testResult.pricing.hasDiscount && (
                          <span className="badge bg-success">{testResult.discount}% OFF</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-danger">
                    <strong>Error:</strong> {testResult.error}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Current Weather Context Status */}
        <div className="mt-3 p-3 bg-light rounded">
          <h6>📊 Current Weather Context Status:</h6>
          <div className="row">
            <div className="col-md-6">
              <ul className="mb-0 small">
                <li><strong>Weather Loaded:</strong> {weather ? '✅ Yes' : '❌ No'}</li>
                <li><strong>Current City:</strong> {currentCity || 'Not set'}</li>
                <li><strong>Discount Active:</strong> {discountPercent > 0 ? `✅ ${discountPercent}%` : '❌ None'}</li>
              </ul>
            </div>
            <div className="col-md-6">
              <div className="small">
                <strong>🔍 Pricing Logic:</strong>
                <ul className="mb-0 mt-1">
                  <li>Rain/Mist/Fog: 15% discount</li>
                  <li>Sunny/Clear: No discount</li>
                  <li>Other conditions: 5% discount</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherDebugger;
