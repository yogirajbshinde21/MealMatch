const mongoose = require('mongoose');

const bargainSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  meal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meal',
    required: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  originalPrice: {
    type: Number,
    required: true
  },
  proposedPrice: {
    type: Number,
    required: true
  },
  counterPrice: Number,
  finalPrice: Number,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'countered', 'counter_accepted', 'counter_rejected'],
    default: 'pending'
  },
  message: String,
  expiresAt: {
    type: Date,
    default: Date.now,
    expires: 1800 // 30 minutes
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Bargain', bargainSchema);
