const Meal = require('../models/Meal');
const Restaurant = require('../models/Restaurant');

// Get all meals with search and filter
exports.getAllMeals = async (req, res) => {
  try {
    const { search, category, restaurant, minPrice, maxPrice } = req.query;
    
    let query = { isAvailable: true };
    
    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Filter by restaurant
    if (restaurant) {
      query.restaurant = restaurant;
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const meals = await Meal.find(query)
      .populate('restaurant', 'name rating deliveryTime')
      .sort({ createdAt: -1 });

    res.json({ meals });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get meal by ID
exports.getMealById = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id)
      .populate('restaurant', 'name rating deliveryTime address');
    
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    res.json({ meal });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new meal (Admin only)
exports.createMeal = async (req, res) => {
  try {
    const meal = new Meal(req.body);
    await meal.save();
    
    res.status(201).json({ 
      message: 'Meal created successfully', 
      meal 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update meal (Admin only)
exports.updateMeal = async (req, res) => {
  try {
    const meal = await Meal.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    res.json({ 
      message: 'Meal updated successfully', 
      meal 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete meal (Admin only)
exports.deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findByIdAndDelete(req.params.id);
    
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    res.json({ message: 'Meal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Search meals by name or restaurant
exports.searchMeals = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query required' });
    }

    // Search in meals
    const meals = await Meal.find({
      $and: [
        { isAvailable: true },
        {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { tags: { $in: [new RegExp(q, 'i')] } }
          ]
        }
      ]
    }).populate('restaurant', 'name rating');

    // Search in restaurants
    const restaurants = await Restaurant.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { cuisine: { $in: [new RegExp(q, 'i')] } }
          ]
        }
      ]
    });

    res.json({ 
      meals, 
      restaurants,
      total: meals.length + restaurants.length 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
