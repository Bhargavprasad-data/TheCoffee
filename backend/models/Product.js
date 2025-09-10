const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  imageUrl: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  countInStock: {
    type: Number,
    required: true,
    default: 0
  },
  roastLevel: {
    type: String,
    required: true,
    enum: ['Light', 'Medium', 'Dark']
  },
  origin: {
    type: String,
    required: true
  },
  weight: {
    type: Number,
    required: true,
    default: 250 // in grams
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    review: String
  }],
  averageRating: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);