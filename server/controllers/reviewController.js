const Review = require('../models/Review');
const Meal = require('../models/Meal');
const Restaurant = require('../models/Restaurant');

// Create review
exports.createReview = async (req, res) => {
  try {
    const { userId, mealId, orderId, rating, comment } = req.body;

    // Get meal to find restaurant
    const meal = await Meal.findById(mealId);
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    // Check if user already reviewed this meal for this order
    const existingReview = await Review.findOne({
      user: userId,
      meal: mealId,
      order: orderId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this meal' });
    }

    // Create review
    const review = new Review({
      user: userId,
      meal: mealId,
      restaurant: meal.restaurant,
      order: orderId,
      rating,
      comment
    });

    await review.save();

    // Update meal rating
    await updateMealRating(mealId);
    
    // Update restaurant rating
    await updateRestaurantRating(meal.restaurant);

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name')
      .populate('meal', 'name');

    res.status(201).json({
      message: 'Review created successfully',
      review: populatedReview
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get reviews for a meal
exports.getMealReviews = async (req, res) => {
  try {
    const { mealId } = req.params;

    const reviews = await Review.find({ meal: mealId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get reviews for a restaurant
exports.getRestaurantReviews = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const reviews = await Review.find({ restaurant: restaurantId })
      .populate('user', 'name')
      .populate('meal', 'name')
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to update meal rating
const updateMealRating = async (mealId) => {
  const reviews = await Review.find({ meal: mealId });
  
  if (reviews.length > 0) {
    const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    
    await Meal.findByIdAndUpdate(mealId, {
      rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal place
      totalReviews: reviews.length
    });
  }
};

// Helper function to update restaurant rating
const updateRestaurantRating = async (restaurantId) => {
  const reviews = await Review.find({ restaurant: restaurantId });
  
  if (reviews.length > 0) {
    const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    
    await Restaurant.findByIdAndUpdate(restaurantId, {
      rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal place
      totalReviews: reviews.length
    });
  }
};

// Update all meal review counts
exports.updateAllMealReviewCounts = async (req, res) => {
  try {
    const meals = await Meal.find();
    
    for (const meal of meals) {
      await updateMealRating(meal._id);
    }
    
    res.json({ message: 'All meal review counts updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
