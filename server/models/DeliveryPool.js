const mongoose = require('mongoose');

const deliveryPoolSchema = new mongoose.Schema({
  area: {
    type: String,
    required: true // simplified area matching
  },
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  status: {
    type: String,
    enum: ['forming', 'active', 'completed'],
    default: 'forming'
  },
  totalDeliveryFee: {
    type: Number,
    required: true
  },
  feePerOrder: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: Date.now,
    expires: 600 // 10 minutes to form a pool
  }
});

module.exports = mongoose.model('DeliveryPool', deliveryPoolSchema);
