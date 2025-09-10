const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    set: function(val) {
      console.log('Cart model set function called with:', val, 'Type:', typeof val);
      // Convert string to ObjectId if needed
      if (typeof val === 'string') {
        try {
          const objectId = new mongoose.Types.ObjectId(val);
          console.log('Converted string to ObjectId:', objectId);
          return objectId;
        } catch (error) {
          console.error('Error converting string to ObjectId:', error);
          throw error;
        }
      }
      console.log('Returning original value:', val);
      return val;
    }
  },
  name: {
    type: String,
    required: true,
    default: 'Unknown Product'
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  image: {
    type: String,
    required: false,
    default: '/images/coffee-placeholder.jpg'
  },
  category: {
    type: String,
    required: false,
    default: 'Unknown Category'
  }
}, {
  timestamps: true
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalPrice: {
    type: Number,
    default: 0
  },
  totalItems: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate totals before saving - temporarily simplified
cartSchema.pre('save', function(next) {
  try {
    console.log('Cart pre-save hook triggered');
    
    // Ensure items is an array
    if (!Array.isArray(this.items)) {
      this.items = [];
    }
    
    // Simple calculation without complex validation
    this.totalItems = this.items.length;
    this.totalPrice = this.items.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 1;
      return sum + (price * quantity);
    }, 0);
    
    // Ensure totals are valid numbers
    this.totalItems = isNaN(this.totalItems) ? 0 : this.totalItems;
    this.totalPrice = isNaN(this.totalPrice) ? 0 : this.totalPrice;
    
    console.log('Final totals - Items:', this.totalItems, 'Price:', this.totalPrice);
    next();
  } catch (error) {
    console.error('Error in cart pre-save hook:', error);
    // Set safe defaults if calculation fails
    this.totalItems = 0;
    this.totalPrice = 0;
    this.items = [];
    next();
  }
});

module.exports = mongoose.model('Cart', cartSchema);
