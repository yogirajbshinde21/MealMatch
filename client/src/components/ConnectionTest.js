import React from 'react';

const ConnectionTest = () => {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const weatherApiKey = process.env.REACT_APP_WEATHER_API_KEY;
  
  const testConnection = async () => {
    try {
      console.log('Testing connection to:', apiBaseUrl);
      const response = await fetch(`${apiBaseUrl}/health`);
      const data = await response.json();
      console.log('✅ Connection successful:', data);
      alert('✅ Backend connection successful!');
    } catch (error) {
      console.error('❌ Connection failed:', error);
      alert('❌ Backend connection failed: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '20px', border: '2px solid #ddd', margin: '20px', borderRadius: '8px' }}>
      <h3>🔧 Connection Debug Panel</h3>
      <div style={{ marginBottom: '10px' }}>
        <strong>API Base URL:</strong> 
        <code style={{ background: '#f0f0f0', padding: '4px' }}>
          {apiBaseUrl || 'Not configured'}
        </code>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <strong>Weather API Key:</strong> 
        <code style={{ background: '#f0f0f0', padding: '4px' }}>
          {weatherApiKey ? `${weatherApiKey.substring(0, 8)}...` : 'Not configured'}
        </code>
      </div>
      <button 
        onClick={testConnection}
        style={{ 
          padding: '10px 20px', 
          background: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        🧪 Test Backend Connection
      </button>
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
        Open browser console (F12) to see detailed logs
      </div>
    </div>
  );
};

export default ConnectionTest;
