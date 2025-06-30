const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Create order
router.post('/', orderController.createOrder);

// Get user's orders
router.get('/user/:userId', orderController.getUserOrders);

// Get all orders (Admin)
router.get('/admin/all', orderController.getAllOrders);

// Get order by ID
router.get('/:id', orderController.getOrderById);

// Update order status (Admin)
router.put('/:id/status', orderController.updateOrderStatus);

module.exports = router;
