const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/auth');

// Sales summary for admin
router.get('/stats/summary', protect, admin, async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const pipeline = [
      { $match: { createdAt: { $gte: startOfMonth, $lte: endOfMonth }, status: { $ne: 'Cancelled' } } },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: { day: { $dayOfMonth: '$createdAt' } },
          orders: { $sum: 1 },
          quantity: { $sum: '$orderItems.quantity' },
          sales: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
        },
      },
      { $sort: { '_id.day': 1 } },
    ];

    const daily = await Order.aggregate(pipeline);

    const totals = daily.reduce(
      (acc, d) => {
        acc.orders += d.orders;
        acc.quantity += d.quantity;
        acc.sales += d.sales;
        return acc;
      },
      { orders: 0, quantity: 0, sales: 0 }
    );

    res.json({ month: month + 1, year, daily, totals });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new order
router.post('/', protect, async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      trackingId: Math.random().toString(36).slice(2, 10).toUpperCase()
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get logged in user orders
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('orderItems.product', 'name description origin roastLevel weight category imageUrl');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all orders (Admin only)
router.get('/', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id name email phone')
      .populate('orderItems.product', 'name description origin roastLevel weight category');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
// Hard delete order (Admin only) - only allowed if Cancelled
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'Cancelled') {
      return res.status(400).json({ message: 'Only cancelled orders can be deleted' });
    }
    await Order.deleteOne({ _id: order._id });
    try {
      const io = req.app.get('io');
      if (io) io.emit('orders:changed');
    } catch {}
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Hard delete order (Customer) - only allowed if Cancelled and owned by user
router.delete('/:id/self', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!order.user.equals(req.user._id)) return res.status(403).json({ message: 'Forbidden' });
    if (order.status !== 'Cancelled') {
      return res.status(400).json({ message: 'Only cancelled orders can be deleted' });
    }
    await Order.deleteOne({ _id: order._id });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// helper to find order by Mongo _id or by trackingId code
async function findOrderByAny(idOrCode) {
  let order = null;
  try {
    if (idOrCode && idOrCode.length >= 12 && require('mongoose').Types.ObjectId.isValid(idOrCode)) {
      order = await Order.findById(idOrCode);
    }
  } catch {}
  if (!order) {
    order = await Order.findOne({ trackingId: idOrCode });
  }
  return order;
}

// Public: minimal order info for tracking page (by _id or trackingId)
router.get('/public/:id', async (req, res) => {
  try {
    const order = await findOrderByAny(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const dc = order.deliveryConfirmation || {};
    const otpValid = dc.otp && dc.otp;
    res.json({
      _id: order._id,
      status: order.status,
      createdAt: order.createdAt,
      tracking: {
        expectedDelivery: order.tracking?.expectedDelivery || null
      },
      deliveryConfirmation: otpValid ? { otp: dc.otp } : {}
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Public: tracking only (by _id or trackingId)
router.get('/public/:id/tracking', async (req, res) => {
  try {
    const order = await findOrderByAny(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order.tracking || {});
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get order by ID (auth)
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order to paid
router.put('/:id/pay', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address
      };

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order to delivered
router.put('/:id/deliver', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update status (admin): accepts Amazon-like lifecycle statuses
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status } = req.body || {};
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Map status -> flags we actually persist
    // Pending/Cancelled/Returned/Delayed => unpaid & not delivered (unless previously paid)
    // OrderPlaced/OrderConfirmed/Packed/Processing/Shipped/OutForDelivery => paid & not delivered
    // Delivered => paid & delivered
    order.status = status || order.status;
    if (status === 'Delivered') {
      order.isPaid = true;
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    } else if (['OrderPlaced', 'OrderConfirmed', 'Packed', 'Processing', 'Shipped', 'OutForDelivery'].includes(status)) {
      order.isPaid = true;
      order.isDelivered = false;
      order.deliveredAt = undefined;
    } else { // Pending / Cancelled / Returned / Delayed
      order.isPaid = false;
      order.isDelivered = false;
      order.deliveredAt = undefined;
    }

    const updated = await order.save();
    try {
      const io = req.app.get('io');
      if (io) {
        const oid = updated._id.toString();
        io.emit('order:status', { orderId: oid, status: updated.status });
        io.to(`order:${oid}`).emit('order:status', { orderId: oid, status: updated.status });
      }
    } catch {}
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign/Update delivery agent and ETA
router.put('/:id/assign', protect, admin, async (req, res) => {
  try {
    const { agentId, name, phone, expectedDelivery } = req.body || {};
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.deliveryAgent = { agentId, name, phone };
    order.tracking = order.tracking || { checkpoints: [] };
    if (expectedDelivery) order.tracking.expectedDelivery = expectedDelivery;
    const updated = await order.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Agent: list assigned orders (simple filter by deliveryAgent.agentId)
router.get('/agent/:agentId/orders', async (req, res) => {
  try {
    const { agentId } = req.params;
    const orders = await Order.find({ 'deliveryAgent.agentId': agentId });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Agent: update status checkpoint (PickedUp/Attempted/Delivered etc.)
router.post('/:id/agent/status', async (req, res) => {
  try {
    const { status, location, note } = req.body || {};
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.tracking = order.tracking || { checkpoints: [] };
    order.tracking.checkpoints.unshift({ status: status || 'Info', location, note });
    if (['OutForDelivery', 'Shipped', 'Delivered'].includes(status)) order.status = status;
    if (status === 'Delivered') { order.isDelivered = true; order.deliveredAt = Date.now(); }
    const updated = await order.save();
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('order:tracking', { orderId: updated._id.toString(), tracking: updated.tracking });
        io.emit('order:status', { orderId: updated._id.toString(), status: updated.status });
      }
    } catch {}
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate delivery OTP (admin or system)
router.post('/:id/delivery/otp', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    order.deliveryConfirmation = order.deliveryConfirmation || {};
    order.deliveryConfirmation.otp = code;

    await order.save();
    try {
      const io = req.app.get('io');
      if (io) io.to(`order:${order._id.toString()}`).emit('order:otp', { orderId: order._id.toString(), otp: code });
    } catch {}
    res.json({ otp: code });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Confirm delivery with OTP and optional e-sign
router.post('/:id/delivery/confirm', protect, async (req, res) => {
  try {
    const { otp, signedBy, signatureImage } = req.body || {};
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!order.user.equals(req.user._id) && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const dc = order.deliveryConfirmation || {};
    if (!dc.otp) return res.status(400).json({ message: 'OTP not generated' });
    if (dc.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    order.status = 'Delivered';
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.deliveryConfirmation = {
      otp: undefined,
      signedBy: signedBy || req.user.name || 'Customer',
      signatureImage: signatureImage || '',
      confirmedAt: new Date()
    };
    const updated = await order.save();
    try {
      const io = req.app.get('io');
      if (io) io.emit('order:status', { orderId: updated._id.toString(), status: updated.status });
    } catch {}
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update live GPS location (delivery agent)
router.post('/:id/gps', async (req, res) => {
  try {
    const { lat, lng } = req.body || {};
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ message: 'lat and lng required' });
    }
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.tracking = order.tracking || { checkpoints: [] };
    order.tracking.gps = { lat, lng };
    await order.save();
    try {
      const io = req.app.get('io');
      if (io) io.emit('order:tracking', { orderId: order._id.toString(), tracking: order.tracking });
    } catch {}
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel order (customer)
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!order.user.equals(req.user._id) && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    // Disallow cancel if delivered or already shipped/out for delivery
    if (order.isDelivered || ['Shipped', 'OutForDelivery', 'Delivered'].includes(order.status)) {
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
    }
    order.status = 'Cancelled';
    order.isPaid = false; // if prepaid, you would trigger refund here
    const updated = await order.save();
    try {
      const io = req.app.get('io');
      if (io) {
        const oid = updated._id.toString();
        io.emit('orders:changed');
        io.to(`order:${oid}`).emit('order:status', { orderId: oid, status: updated.status });
      }
    } catch {}
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Tracking APIs
router.get('/:id/tracking', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!order.user.equals(req.user._id) && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(order.tracking || {});
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/tracking', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.tracking = {
      ...(order.tracking || {}),
      carrier: req.body.carrier ?? order.tracking?.carrier ?? '',
      trackingNumber: req.body.trackingNumber ?? order.tracking?.trackingNumber ?? '',
      currentHub: req.body.currentHub ?? order.tracking?.currentHub ?? '',
      expectedDelivery: req.body.expectedDelivery ?? order.tracking?.expectedDelivery,
      updatedAt: new Date(),
      checkpoints: order.tracking?.checkpoints || []
    };
    const updated = await order.save();
    try {
      const io = req.app.get('io');
      if (io) {
        const oid = updated._id.toString();
        io.emit('orders:changed');
        io.to(`order:${oid}`).emit('order:tracking', { orderId: oid, tracking: updated.tracking });
      }
    } catch {}
    res.json(updated.tracking);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/tracking/checkpoints', protect, admin, async (req, res) => {
  try {
    const { status, location, note, time, currentHub, gps, delayed, delayedReason, expectedDelivery } = req.body || {};
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!order.tracking) order.tracking = { checkpoints: [] };
    if (!order.tracking.checkpoints) order.tracking.checkpoints = [];
    order.tracking.checkpoints.unshift({ status: status || 'Info', location, note, time });
    if (currentHub) order.tracking.currentHub = currentHub;
    if (gps && typeof gps.lat === 'number' && typeof gps.lng === 'number') order.tracking.gps = gps;
    if (typeof delayed === 'boolean') order.tracking.delayed = delayed;
    if (delayedReason) order.tracking.delayedReason = delayedReason;
    if (expectedDelivery) order.tracking.expectedDelivery = expectedDelivery;
    order.tracking.updatedAt = new Date();

    if (['OrderPlaced','OrderConfirmed','Packed','Processing','Shipped','OutForDelivery','Delivered','Delayed'].includes(status)) {
      order.status = status;
      if (status === 'Delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
      }
    }

    const updated = await order.save();
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('order:tracking', { orderId: updated._id.toString(), tracking: updated.tracking });
        // Also emit orders list change since status may have changed
        io.emit('orders:changed');
      }
    } catch {}
    res.status(201).json(updated.tracking);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;