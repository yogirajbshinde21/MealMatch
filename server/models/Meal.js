const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0 // percentage
  },
  category: String,
  image: String,
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  rating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  tags: [String],
  preparationTime: {
    type: Number,
    default: 20 // in minutes
  },
  isVeg: {
    type: Boolean,
    default: true
  },
  isSurplus: {
    type: Boolean,
    default: false
  },
  surplusDiscount: {
    type: Number,
    default: 0 // Additional discount for surplus items
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Meal', mealSchema);
