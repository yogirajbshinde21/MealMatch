const express = require('express');
const router = express.Router();
const bargainController = require('../controllers/bargainController');

// Create bargain offer
router.post('/', bargainController.createBargain);

// Get user's bargains
router.get('/user/:userId', bargainController.getUserBargains);

// Get restaurant's bargains (Admin)
router.get('/restaurant/:restaurantId', bargainController.getRestaurantBargains);

// Get all bargains (Admin)
router.get('/admin/all', bargainController.getAllBargains);

// Respond to bargain (Admin)
router.put('/:bargainId/respond', bargainController.respondToBargain);

// User response to counter offer
router.put('/:bargainId/counter-response', bargainController.respondToCounter);

module.exports = router;
