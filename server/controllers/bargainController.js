const Bargain = require('../models/Bargain');
const Meal = require('../models/Meal');
const Order = require('../models/Order');

// Create bargain offer
exports.createBargain = async (req, res) => {
  try {
    const { userId, mealId, proposedPrice, message } = req.body;

    // Get meal details
    const meal = await Meal.findById(mealId).populate('restaurant');
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    // Check if price is reasonable (at least 50% of original)
    const minPrice = meal.price * 0.5;
    if (proposedPrice < minPrice) {
      return res.status(400).json({ 
        message: `Minimum bargain price is ₹${minPrice}` 
      });
    }

    // Create bargain
    const bargain = new Bargain({
      user: userId,
      meal: mealId,
      restaurant: meal.restaurant._id,
      originalPrice: meal.price,
      proposedPrice,
      message
    });

    await bargain.save();

    // Populate bargain for response
    const populatedBargain = await Bargain.findById(bargain._id)
      .populate('user', 'name email')
      .populate('meal', 'name image')
      .populate('restaurant', 'name');

    res.status(201).json({
      message: 'Bargain offer created',
      bargain: populatedBargain
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's bargains
exports.getUserBargains = async (req, res) => {
  try {
    const { userId } = req.params;

    const bargains = await Bargain.find({ user: userId })
      .populate('meal', 'name image price')
      .populate('restaurant', 'name')
      .sort({ createdAt: -1 });

    res.json({ bargains });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get restaurant's incoming bargains (Admin)
exports.getRestaurantBargains = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const bargains = await Bargain.find({ 
      restaurant: restaurantId,
      status: 'pending'
    })
      .populate('user', 'name email')
      .populate('meal', 'name image price')
      .sort({ createdAt: -1 });

    res.json({ bargains });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Respond to bargain (Admin)
exports.respondToBargain = async (req, res) => {
  try {
    const { bargainId } = req.params;
    const { status, counterPrice, message } = req.body;

    const bargain = await Bargain.findById(bargainId)
      .populate('user', 'name email')
      .populate('meal', 'name image price')
      .populate('restaurant', 'name');
      
    if (!bargain) {
      return res.status(404).json({ message: 'Bargain not found' });
    }

    bargain.status = status;
    if (counterPrice) {
      bargain.counterPrice = counterPrice;
    }
    if (message) {
      bargain.message = message;
    }

    // Create order if bargain is accepted
    if (status === 'accepted') {
      try {
        const orderData = {
          user: bargain.user._id,
          items: [{
            meal: bargain.meal._id,
            quantity: 1,
            price: bargain.proposedPrice // Use the user's proposed price
          }],
          totalAmount: bargain.proposedPrice + 50, // Add delivery fee
          deliveryAddress: {
            street: 'Bargain Deal Address',
            city: 'Default City',
            pincode: '400001'
          },
          status: 'confirmed',
          paymentMethod: 'bargain_deal',
          bargainId: bargain._id
        };
        
        const order = new Order(orderData);
        await order.save();
      } catch (orderError) {
        console.error('Error creating order:', orderError);
        // Continue even if order creation fails
      }
    }

    await bargain.save();

    // Populate for response
    const updatedBargain = await Bargain.findById(bargain._id)
      .populate('user', 'name email')
      .populate('meal', 'name image')
      .populate('restaurant', 'name');

    res.json({
      message: 'Bargain response sent',
      bargain: updatedBargain
    });
  } catch (error) {
    console.error('Error in respondToBargain:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// User response to counter offer
exports.respondToCounter = async (req, res) => {
  try {
    const { bargainId } = req.params;
    const { response } = req.body; // 'accepted' or 'rejected'

    const bargain = await Bargain.findById(bargainId)
      .populate('user', 'name email')
      .populate('meal', 'name image price')
      .populate('restaurant', 'name');
      
    if (!bargain) {
      return res.status(404).json({ message: 'Bargain not found' });
    }

    if (bargain.status !== 'countered') {
      return res.status(400).json({ message: 'This bargain is not waiting for counter response' });
    }

    // Update bargain status based on user response
    if (response === 'accepted') {
      bargain.status = 'counter_accepted';
      bargain.finalPrice = bargain.counterPrice; // Use counter price as final price
      
      // Create an order when counter offer is accepted
      try {
        const orderData = {
          user: bargain.user._id,
          items: [{
            meal: bargain.meal._id,
            quantity: 1,
            price: bargain.counterPrice // Use the negotiated price
          }],
          totalAmount: bargain.counterPrice + 50, // Add delivery fee
          deliveryAddress: {
            street: 'Bargain Deal Address',
            city: 'Default City',
            pincode: '400001'
          },
          status: 'confirmed',
          paymentMethod: 'bargain_deal',
          bargainId: bargain._id
        };
        
        const order = new Order(orderData);
        await order.save();
      } catch (orderError) {
        console.error('Error creating order:', orderError);
        // Continue even if order creation fails
      }
      
    } else {
      bargain.status = 'counter_rejected';
    }

    await bargain.save();

    // Populate for response
    const updatedBargain = await Bargain.findById(bargain._id)
      .populate('user', 'name email')
      .populate('meal', 'name image')
      .populate('restaurant', 'name');

    res.json({
      message: `Counter offer ${response}`,
      bargain: updatedBargain
    });
  } catch (error) {
    console.error('Error in respondToCounter:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all bargains (Admin dashboard)
exports.getAllBargains = async (req, res) => {
  try {
    const bargains = await Bargain.find()
      .populate('user', 'name email')
      .populate('meal', 'name image')
      .populate('restaurant', 'name')
      .sort({ createdAt: -1 });

    res.json({ bargains });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
