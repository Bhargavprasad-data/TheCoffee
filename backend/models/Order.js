const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  orderItems: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      image: { type: String, required: true },
      price: { type: Number, required: true },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
      }
    }
  ],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    phone: { type: String },
    country: { type: String, required: true, default: 'India' }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['COD', 'PhonePe', 'GooglePay']
  },
  paymentResult: {
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
    payment_id: { type: String },
    order_id: { type: String },
    signature: { type: String }
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  currency: {
    type: String,
    required: true,
    default: 'INR'
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  deliveryConfirmation: {
    otp: { type: String },
    signedBy: { type: String },
    signatureImage: { type: String }, // base64 or URL
    confirmedAt: { type: Date }
  },
  deliveryAgent: {
    agentId: { type: String }, // external id like DEL123
    name: { type: String },
    phone: { type: String }
  },
  trackingId: { type: String },
  // driverId removed with live tracking feature
  status: {
    type: String,
    enum: ['Pending', 'OrderPlaced', 'OrderConfirmed', 'Packed', 'Processing', 'Shipped', 'OutForDelivery', 'Delivered', 'Delayed', 'Cancelled', 'Returned'],
    default: 'Pending'
  },
  tracking: {
    carrier: { type: String, default: '' },
    trackingNumber: { type: String, default: '' },
    currentHub: { type: String, default: '' },
    expectedDelivery: { type: Date },
    updatedAt: { type: Date },
    gps: {
      lat: { type: Number },
      lng: { type: Number }
    },
    delayed: { type: Boolean, default: false },
    delayedReason: { type: String, default: '' },
    checkpoints: [
      {
        status: {
          type: String,
          enum: ['Pending', 'OrderPlaced', 'OrderConfirmed', 'Packed', 'Processing', 'Shipped', 'OutForDelivery', 'Delivered', 'Delayed', 'Cancelled', 'Returned', 'Info'],
          default: 'Info'
        },
        location: { type: String, default: '' },
        note: { type: String, default: '' },
        time: { type: Date, default: Date.now }
      }
    ]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);