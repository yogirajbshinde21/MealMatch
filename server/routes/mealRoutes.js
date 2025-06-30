const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');

// Get all meals
router.get('/', mealController.getAllMeals);

// Search meals
router.get('/search', mealController.searchMeals);

// Get meal by ID
router.get('/:id', mealController.getMealById);

// Create meal (Admin only)
router.post('/', mealController.createMeal);

// Update meal (Admin only)
router.put('/:id', mealController.updateMeal);

// Delete meal (Admin only)
router.delete('/:id', mealController.deleteMeal);

module.exports = router;
