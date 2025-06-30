const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  cuisine: [String],
  address: {
    street: String,
    city: String,
    pincode: String
  },
  phone: String,
  email: String,
  rating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  image: String,
  isActive: {
    type: Boolean,
    default: true
  },
  deliveryTime: {
    type: Number,
    default: 30 // in minutes
  },
  deliveryFee: {
    type: Number,
    default: 50 // in rupees
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
