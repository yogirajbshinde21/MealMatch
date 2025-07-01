const Cart = require('../models/Cart');
const Meal = require('../models/Meal');

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // For demo/mock users, return success without cart data - let frontend handle via localStorage
    if (userId.startsWith('user-') || userId.startsWith('demo-') || userId.startsWith('admin-') || userId === 'demo-user-id' || userId === 'admin-user-id') {
      console.log('Mock user detected in getCart, letting frontend handle completely');
      return res.json({ 
        message: 'Cart handled by frontend (mock mode)',
        success: true,
        mockMode: true
      });
    }
    
    let cart = await Cart.findOne({ user: userId })
      .populate({
        path: 'items.meal',
        populate: {
          path: 'restaurant',
          select: 'name deliveryFee'
        }
      });

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
      await cart.save();
    }

    res.json({ cart });
  } catch (error) {
    console.error('Error in getCart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const { mealId, quantity = 1, bargainPrice, weatherDiscount } = req.body;

    console.log('Add to cart request:', { userId, mealId, quantity, bargainPrice, weatherDiscount });

    // For demo/mock users, handle cart locally and return success
    if (userId.startsWith('user-') || userId.startsWith('demo-') || userId.startsWith('admin-') || userId === 'demo-user-id' || userId === 'admin-user-id') {
      console.log('Mock user detected, returning success response for frontend to handle');
      
      // Return a simple success response - let frontend handle cart via localStorage
      return res.json({ 
        message: 'Item added to cart (mock mode)', 
        success: true,
        mockMode: true
      });
    }

    // Validate MongoDB ObjectId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log('Invalid user ID format, treating as mock user');
      return res.json({ 
        message: 'Item added to cart (invalid user ID - mock mode)', 
        success: true,
        mockMode: true
      });
    }

    if (!mongoose.Types.ObjectId.isValid(mealId)) {
      console.log('Invalid meal ID format');
      return res.status(400).json({ message: 'Invalid meal ID format' });
    }

    // Check if meal exists (for real database users)
    const meal = await Meal.findById(mealId);
    if (!meal) {
      console.log('Meal not found:', mealId);
      return res.status(404).json({ message: 'Meal not found' });
    }

    console.log('Meal found:', meal.name);

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      console.log('Creating new cart for user:', userId);
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.meal.toString() === mealId
    );

    if (existingItemIndex > -1) {
      console.log('Updating existing item in cart');
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
      if (bargainPrice) {
        cart.items[existingItemIndex].bargainPrice = bargainPrice;
      }
      if (weatherDiscount !== undefined) {
        cart.items[existingItemIndex].weatherDiscount = weatherDiscount;
      }
    } else {
      console.log('Adding new item to cart');
      // Add new item
      const newItem = {
        meal: mealId,
        quantity,
        bargainPrice,
        weatherDiscount
      };
      cart.items.push(newItem);
    }

    await cart.save();
    console.log('Cart saved successfully');
    
    // Populate cart for response
    cart = await Cart.findById(cart._id)
      .populate({
        path: 'items.meal',
        populate: {
          path: 'restaurant',
          select: 'name deliveryFee'
        }
      });

    console.log('Cart populated and returned');

    res.json({ 
      message: 'Item added to cart', 
      cart 
    });
  } catch (error) {
    console.error('Error in addToCart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update entire cart
exports.updateCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const cartData = req.body;

    console.log('Update cart request:', { userId, cartData: typeof cartData });

    // For demo/mock users, return success and let frontend handle
    if (userId.startsWith('user-') || userId.startsWith('demo-') || userId.startsWith('admin-') || userId === 'demo-user-id' || userId === 'admin-user-id') {
      console.log('Mock user detected in updateCart, letting frontend handle');
      return res.json({ 
        message: 'Cart updated (mock mode)', 
        success: true,
        mockMode: true
      });
    }

    // Validate MongoDB ObjectId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log('Invalid user ID format in updateCart, treating as mock user');
      return res.json({ 
        message: 'Cart updated (invalid user ID - mock mode)', 
        success: true,
        mockMode: true
      });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Handle different data structures
    let items = [];
    if (cartData.items) {
      items = cartData.items;
    } else if (Array.isArray(cartData)) {
      items = cartData;
    } else {
      console.log('No items found in update cart request');
      items = [];
    }

    // Update cart data
    cart.items = items;

    await cart.save();

    // Populate cart for response
    cart = await Cart.findById(cart._id)
      .populate({
        path: 'items.meal',
        populate: {
          path: 'restaurant',
          select: 'name deliveryFee'
        }
      });

    res.json({ 
      message: 'Cart updated', 
      cart 
    });
  } catch (error) {
    console.error('Error in updateCart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update cart item
exports.updateCartItem = async (req, res) => {
  try {
    const { userId, itemId } = req.params;
    const { quantity } = req.body;

    // For demo/mock users, return success and let frontend handle
    if (userId.startsWith('user-') || userId.startsWith('demo-') || userId.startsWith('admin-') || userId === 'demo-user-id' || userId === 'admin-user-id') {
      console.log('Mock user detected in updateCartItem, letting frontend handle');
      return res.json({ 
        message: 'Cart item updated (mock mode)', 
        success: true,
        mockMode: true
      });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      cart.items.pull(itemId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();

    // Populate cart for response
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.meal',
        populate: {
          path: 'restaurant',
          select: 'name deliveryFee'
        }
      });

    res.json({ 
      message: 'Cart updated', 
      cart: updatedCart 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { userId, itemId } = req.params;

    // For demo/mock users, return success and let frontend handle
    if (userId.startsWith('user-') || userId.startsWith('demo-') || userId.startsWith('admin-') || userId === 'demo-user-id' || userId === 'admin-user-id') {
      console.log('Mock user detected in removeFromCart, letting frontend handle');
      return res.json({ 
        message: 'Item removed from cart (mock mode)', 
        success: true,
        mockMode: true
      });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items.pull(itemId);
    await cart.save();

    // Populate cart for response
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.meal',
        populate: {
          path: 'restaurant',
          select: 'name deliveryFee'
        }
      });

    res.json({ 
      message: 'Item removed from cart', 
      cart: updatedCart 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const { userId } = req.params;

    // For demo/mock users, return success and let frontend handle
    if (userId.startsWith('user-') || userId.startsWith('demo-') || userId.startsWith('admin-') || userId === 'demo-user-id' || userId === 'admin-user-id') {
      console.log('Mock user detected in clearCart, letting frontend handle');
      return res.json({ 
        message: 'Cart cleared (mock mode)', 
        success: true,
        mockMode: true
      });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();

    res.json({ 
      message: 'Cart cleared', 
      cart 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
