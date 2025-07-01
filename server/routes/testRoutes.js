const express = require('express');
const router = express.Router();

// Test endpoints for debugging and verification
router.get('/status', (req, res) => {
  res.json({
    status: 'success',
    message: 'MealMatch API is working!',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      meals: '/api/meals',
      cart: '/api/cart',
      orders: '/api/orders',
      bargains: '/api/bargains',
      restaurants: '/api/restaurants',
      reviews: '/api/reviews'
    }
  });
});

// Test database connection
router.get('/db-test', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const connectionState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    res.json({
      database: {
        status: states[connectionState],
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test socket.io connection
router.get('/socket-test', (req, res) => {
  res.json({
    socketIO: {
      enabled: true,
      endpoint: process.env.NODE_ENV === 'production' ? 'wss://mealmatch-backend.onrender.com' : 'ws://localhost:5000',
      features: ['bargain-negotiations', 'real-time-updates']
    }
  });
});

module.exports = router;
