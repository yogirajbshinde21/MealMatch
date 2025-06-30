const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Create review
router.post('/', reviewController.createReview);

// Get reviews for a meal
router.get('/meal/:mealId', reviewController.getMealReviews);

// Get reviews for a restaurant
router.get('/restaurant/:restaurantId', reviewController.getRestaurantReviews);

// Update meal review counts
router.put('/update-counts', reviewController.updateAllMealReviewCounts);

module.exports = router;
