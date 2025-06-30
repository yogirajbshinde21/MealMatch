const Restaurant = require('../models/Restaurant');
const Meal = require('../models/Meal');

// Get all restaurants
exports.getAllRestaurants = async (req, res) => {
  try {
    const { search, cuisine, minRating } = req.query;
    
    let query = { isActive: true };
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (cuisine) {
      query.cuisine = { $in: [cuisine] };
    }
    
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    const restaurants = await Restaurant.find(query)
      .sort({ rating: -1, createdAt: -1 });

    res.json({ restaurants });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get restaurant by ID with meals
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Get restaurant's meals
    const meals = await Meal.find({ 
      restaurant: req.params.id,
      isAvailable: true 
    });

    res.json({ 
      restaurant, 
      meals 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create restaurant (Admin)
exports.createRestaurant = async (req, res) => {
  try {
    const restaurant = new Restaurant(req.body);
    await restaurant.save();
    
    res.status(201).json({
      message: 'Restaurant created successfully',
      restaurant
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update restaurant (Admin)
exports.updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.json({
      message: 'Restaurant updated successfully',
      restaurant
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
