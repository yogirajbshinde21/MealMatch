const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Get user profile
router.get('/profile/:userId', authController.getUserProfile);

// Get all users (Admin only)
router.get('/admin/users', authController.getAllUsers);

module.exports = router;
