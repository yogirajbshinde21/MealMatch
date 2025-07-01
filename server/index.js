const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = createServer(app);

// Environment-based CORS origins
const getAllowedOrigins = () => {
  const origins = ["https://mealmatch-frontend.onrender.com"];
  
  // Add development origins in development/local environment
  if (process.env.NODE_ENV !== 'production') {
    origins.push("http://localhost:3000", "http://127.0.0.1:3000");
  }
  
  return origins;
};

const io = new Server(server, {
  cors: {
    origin: getAllowedOrigins(),
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: getAllowedOrigins(),
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mealmatch';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Import routes
const authRoutes = require('./routes/authRoutes');
const mealRoutes = require('./routes/mealRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const bargainRoutes = require('./routes/bargainRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const testRoutes = require('./routes/testRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/bargains', bargainRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/test', testRoutes);

// Socket.IO for real-time bargaining
const handleBargainSocket = require('./socket/bargainSocket');
handleBargainSocket(io);

// Make io available to routes
app.set('io', io);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'MealMatch API is running!' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    features: {
      auth: true,
      meals: true,
      cart: true,
      orders: true,
      bargains: true,
      restaurants: true,
      reviews: true,
      socket: true
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
