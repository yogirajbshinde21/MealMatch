const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'restaurant'],
    default: 'user'
  },
  address: {
    street: String,
    city: String,
    pincode: String
  },
  phone: String
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
