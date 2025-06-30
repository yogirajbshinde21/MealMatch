const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');

// Get all restaurants
router.get('/', restaurantController.getAllRestaurants);

// Get restaurant by ID
router.get('/:id', restaurantController.getRestaurantById);

// Create restaurant (Admin)
router.post('/', restaurantController.createRestaurant);

// Update restaurant (Admin)
router.put('/:id', restaurantController.updateRestaurant);

module.exports = router;
