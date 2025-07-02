const Order = require('../models/Order');
const Cart = require('../models/Cart');

// Create order directly (for checkout)
exports.createOrder = async (req, res) => {
  try {
    const orderData = req.body;

    console.log('Creating order with data:', orderData);

    // For demo/mock users, create a mock order response
    if (orderData.userId && (orderData.userId.startsWith('user-') || orderData.userId.startsWith('demo-') || orderData.userId.startsWith('admin-'))) {
      console.log('Mock user detected, creating mock order');
      
      const mockOrder = {
        _id: 'mock-order-' + Date.now(),
        user: {
          _id: orderData.userId,
          name: 'Demo User',
          email: orderData.userId.includes('demo') ? 'demo@mealmatch.com' : 'user@mealmatch.com'
        },
        items: orderData.items.map((item, index) => ({
          _id: 'mock-item-' + Date.now() + '-' + index,
          meal: item.meal, // Use the actual meal ID - frontend will handle display
          quantity: item.quantity,
          price: item.price,
          bargainPrice: item.bargainPrice
        })),
        totalAmount: orderData.totalAmount,
        deliveryFee: orderData.deliveryFee || 50,
        deliveryAddress: orderData.deliveryAddress,
        estimatedDeliveryTime: orderData.estimatedDeliveryTime,
        estimatedDeliveryMinutes: orderData.estimatedDeliveryMinutes,
        orderStatus: orderData.orderStatus || 'Placed',
        orderPlacedTime: orderData.orderPlacedTime || new Date(),
        status: orderData.status || 'placed',
        createdAt: new Date(),
        paymentMethod: 'cash',
        review: {
          rating: null,
          comment: '',
          reviewed: false,
          reviewedAt: null
        }
      };

      console.log('Mock order created:', mockOrder);

      return res.status(201).json({
        message: 'Order created successfully (mock mode)',
        order: mockOrder
      });
    }

    // Create order with provided data (for real users)
    const order = new Order({
      user: orderData.userId,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      deliveryFee: orderData.deliveryFee || 50,
      deliveryAddress: orderData.deliveryAddress,
      estimatedDeliveryTime: orderData.estimatedDeliveryTime,
      estimatedDeliveryMinutes: orderData.estimatedDeliveryMinutes,
      orderStatus: orderData.orderStatus || 'Placed',
      orderPlacedTime: orderData.orderPlacedTime || new Date(),
      status: orderData.status || 'placed',
      createdAt: new Date(),
      review: {
        rating: null,
        comment: '',
        reviewed: false,
        reviewedAt: null
      }
    });

    await order.save();

    // Populate the order for response
    const populatedOrder = await Order.findById(order._id)
      .populate('items.meal')
      .populate('user', 'name email');

    // Start automatic status progression
    scheduleStatusUpdates(order._id);

    // Emit real-time notification to admin if socket is available
    if (req.app.get('io')) {
      req.app.get('io').to('admin-room').emit('new-order', {
        order: populatedOrder,
        message: 'New order placed!'
      });
    }

    res.status(201).json({
      message: 'Order created successfully',
      order: populatedOrder
    });
  } catch (error) {
    console.error('Error in createOrder:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Schedule automatic status updates for realistic order progression
const scheduleStatusUpdates = (orderId) => {
  // After 5 minutes: confirmed -> preparing
  setTimeout(async () => {
    try {
      await Order.findByIdAndUpdate(orderId, { status: 'preparing' });
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  }, 5 * 60 * 1000); // 5 minutes

  // After 20 minutes: preparing -> out_for_delivery
  setTimeout(async () => {
    try {
      await Order.findByIdAndUpdate(orderId, { status: 'out_for_delivery' });
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  }, 20 * 60 * 1000); // 20 minutes

  // After 40 minutes: out_for_delivery -> delivered
  setTimeout(async () => {
    try {
      await Order.findByIdAndUpdate(orderId, { status: 'delivered' });
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  }, 40 * 60 * 1000); // 40 minutes
};

// Create order from cart (legacy function)
exports.createOrderFromCart = async (req, res) => {
  try {
    const { userId, deliveryAddress } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: userId })
      .populate('items.meal');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = cart.items.map(item => {
      let price = item.meal.price; // Start with base price
      
      // Apply bargain price if available (takes priority)
      if (item.bargainPrice) {
        price = item.bargainPrice;
      } else if (item.weatherDiscount && item.weatherDiscount > 0) {
        // Apply weather discount if no bargain price
        const discountAmount = (item.meal.price * item.weatherDiscount) / 100;
        price = item.meal.price - discountAmount;
      }
      
      totalAmount += price * item.quantity;
      return {
        meal: item.meal._id,
        quantity: item.quantity,
        price: price,
        bargainPrice: item.bargainPrice || null,
        weatherDiscount: item.weatherDiscount || null
      };
    });

    // Calculate delivery fee
    let deliveryFee = 50; // Default delivery fee

    // Create order
    const order = new Order({
      user: userId,
      items: orderItems,
      totalAmount: totalAmount + deliveryFee,
      deliveryFee,
      deliveryAddress,
      estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
    });

    await order.save();

    // Clear cart
    cart.items = [];
    await cart.save();

    // Populate order for response
    const populatedOrder = await Order.findById(order._id)
      .populate('items.meal', 'name image');

    // Start automatic status progression
    scheduleStatusUpdates(order._id);

    // Emit real-time notification to admin if socket is available
    if (req.app.get('io')) {
      req.app.get('io').to('admin-room').emit('new-order', {
        order: populatedOrder,
        message: 'New order placed!'
      });
    }

    res.status(201).json({
      message: 'Order created successfully',
      order: populatedOrder
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    // For demo/mock users, return empty orders or mock orders from localStorage
    if (userId.startsWith('user-') || userId.startsWith('demo-') || userId.startsWith('admin-')) {
      console.log('Mock user detected in getUserOrders, returning empty orders');
      return res.json({ 
        orders: [], 
        message: 'Orders handled by frontend (mock mode)',
        mockMode: true 
      });
    }

    const orders = await Order.find({ user: userId })
      .populate('items.meal', 'name image')
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    console.error('Error in getUserOrders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.meal');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update order status (Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { 
        status,
        ...(status === 'delivered' && { actualDeliveryTime: new Date() })
      },
      { new: true }
    ).populate('items.meal', 'name');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      message: 'Order status updated',
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all orders (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.meal', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
