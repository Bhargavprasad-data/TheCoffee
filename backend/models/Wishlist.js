const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  origin: {
    type: String,
    required: true
  },
  roastLevel: {
    type: String,
    required: true
  },
  averageRating: {
    type: Number,
    default: 0
  },
  countInStock: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [wishlistItemSchema],
  totalItems: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate total items before saving
wishlistSchema.pre('save', function(next) {
  this.totalItems = this.items.length;
  next();
});

module.exports = mongoose.model('Wishlist', wishlistSchema);
