const User = require('../models/User');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');

// Demo user credentials
const DEMO_USER = {
  email: 'demo@mealmatch.com',
  password: '123456',
  name: 'Demo User'
};

// Admin user credentials
const ADMIN_USER = {
  email: 'admin@mealmatch.com',
  password: 'admin123',
  name: 'Admin User'
};

// Register user
exports.register = async (req, res) => {
  try {
    const { email, password, name, role, city } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with city information
    const user = new User({
      email,
      password: hashedPassword,
      name,
      role: role || 'user',
      address: {
        city: city || 'Mumbai' // Default to Mumbai if not provided
      }
    });

    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        city: user.address?.city
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for demo user
    if (email === DEMO_USER.email && password === DEMO_USER.password) {
      return res.json({
        message: 'Demo login successful',
        user: {
          id: 'demo-user-id',
          email: DEMO_USER.email,
          name: DEMO_USER.name,
          role: 'user',
          city: 'Mumbai' // Demo user always uses Mumbai for weather
        }
      });
    }

    // Check for admin user
    if (email === ADMIN_USER.email && password === ADMIN_USER.password) {
      return res.json({
        message: 'Admin login successful',
        user: {
          id: 'admin-user-id',
          email: ADMIN_USER.email,
          name: ADMIN_USER.name,
          role: 'admin'
        }
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        city: user.address?.city || 'Mumbai' // Default to Mumbai for existing users
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Handle demo user
    if (userId === 'demo-user-id') {
      return res.json({
        user: {
          id: 'demo-user-id',
          email: DEMO_USER.email,
          name: DEMO_USER.name,
          role: 'user',
          city: 'Mumbai' // Demo user always uses Mumbai
        }
      });
    }

    // Handle admin user
    if (userId === 'admin-user-id') {
      return res.json({
        user: {
          id: 'admin-user-id',
          email: ADMIN_USER.email,
          name: ADMIN_USER.name,
          role: 'admin'
        }
      });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password')
      .sort({ createdAt: -1 });
    
    // Calculate additional stats for each user
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const orders = await Order.find({ user: user._id });
      const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      
      return {
        ...user.toObject(),
        orders: orders.length,
        totalSpent,
        lastActive: user.lastLogin || user.createdAt
      };
    }));

    res.json({ users: usersWithStats });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user profile by ID
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId, '-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const orders = await Order.find({ user: user._id });
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    res.json({
      user: {
        ...user.toObject(),
        orders: orders.length,
        totalSpent,
        lastActive: user.lastLogin || user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
