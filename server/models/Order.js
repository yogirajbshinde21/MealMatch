const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  meal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meal',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  bargainPrice: Number, // if item was purchased through bargain
  weatherDiscount: Number // weather-based discount percentage applied
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  deliveryFee: {
    type: Number,
    default: 50
  },
  deliveryAddress: {
    street: String,
    city: String,
    pincode: String
  },
  status: {
    type: String,
    enum: ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'placed'
  },
  orderStatus: {
    type: String,
    enum: ['Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Placed'
  },
  orderPlacedTime: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'bargain_deal'],
    default: 'cash'
  },
  bargainId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bargain'
  },
  estimatedDeliveryTime: {
    type: Date,
    required: true
  },
  estimatedDeliveryMinutes: {
    type: Number,
    required: true
  },
  actualDeliveryTime: Date,
  review: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 500
    },
    reviewed: {
      type: Boolean,
      default: false
    },
    reviewedAt: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
