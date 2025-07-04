// Quick test for bargain counter response
// Run this file from the server directory: node testBargain.js

const mongoose = require('mongoose');
require('dotenv').config();

const Bargain = require('./models/Bargain');
const Order = require('./models/Order');

// Test function
async function testCounterResponse() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI;
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test the operation
    const bargainId = '668160886e2226d3f47e5e51'; // Replace with actual bargain ID
    const response = 'accepted';

    const bargain = await Bargain.findById(bargainId)
      .populate('user', 'name email')
      .populate('meal', 'name image price')
      .populate('restaurant', 'name');
      
    if (!bargain) {
      console.log('❌ Bargain not found');
      return;
    }

    console.log('✅ Found bargain:', bargain.status);

    if (bargain.status !== 'countered') {
      console.log('❌ Bargain is not in countered status, current status:', bargain.status);
      return;
    }

    // Test order creation
    const orderData = {
      user: bargain.user._id,
      items: [{
        meal: bargain.meal._id,
        quantity: 1,
        price: bargain.counterPrice
      }],
      totalAmount: bargain.counterPrice + 50,
      deliveryAddress: {
        street: 'Test Address',
        city: 'Test City',
        pincode: '400001'
      },
      status: 'confirmed',
      paymentMethod: 'bargain_deal',
      bargainId: bargain._id
    };
    
    console.log('Order data:', orderData);
    
    const order = new Order(orderData);
    await order.save();
    console.log('✅ Order created successfully');

    // Update bargain
    bargain.status = 'counter_accepted';
    bargain.finalPrice = bargain.counterPrice;
    await bargain.save();
    console.log('✅ Bargain updated successfully');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

testCounterResponse();
