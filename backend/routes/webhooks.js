const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Generic carrier webhook to append tracking checkpoints
// Expects: { orderId, status, location, note, time, carrier, trackingNumber, currentHub, expectedDelivery, gps, delayed, delayedReason }
router.post('/carrier', async (req, res) => {
  try {
    const {
      orderId,
      status,
      location,
      note,
      time,
      carrier,
      trackingNumber,
      currentHub,
      expectedDelivery,
      gps,
      delayed,
      delayedReason
    } = req.body || {};

    if (!orderId) return res.status(400).json({ message: 'orderId required' });
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.tracking = order.tracking || { checkpoints: [] };
    if (carrier) order.tracking.carrier = carrier;
    if (trackingNumber) order.tracking.trackingNumber = trackingNumber;
    if (currentHub) order.tracking.currentHub = currentHub;
    if (expectedDelivery) order.tracking.expectedDelivery = expectedDelivery;
    order.tracking.checkpoints = order.tracking.checkpoints || [];
    order.tracking.checkpoints.unshift({ status: status || 'Info', location, note, time });

    if (gps && typeof gps.lat === 'number' && typeof gps.lng === 'number') order.tracking.gps = gps;
    if (typeof delayed === 'boolean') order.tracking.delayed = delayed;
    if (delayedReason) order.tracking.delayedReason = delayedReason;

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
        io.emit('orders:changed');
      }
    } catch {}
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

// --- Simple in-memory simulator for courier updates ---
let simulators = new Map(); // orderId -> intervalId

router.post('/simulator/start/:orderId', async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (simulators.has(orderId)) return res.json({ ok: true, message: 'Simulator already running' });

    const hubs = ['Warehouse', 'City Hub', 'Regional Hub', 'Local DC'];
    let step = 0;
    const io = req.app.get('io');
    const intervalId = setInterval(async () => {
      try {
        const fresh = await Order.findById(orderId);
        if (!fresh) return;
        const gps = {
          lat: 12.90 + Math.random() * 0.2,
          lng: 77.50 + Math.random() * 0.2
        };
        const statuses = ['OrderPlaced', 'OrderConfirmed', 'Packed', 'Shipped', 'OutForDelivery', 'Delivered'];
        const nextStatus = statuses[Math.min(step, statuses.length - 1)];
        const currentHub = hubs[Math.min(step, hubs.length - 1)];

        fresh.tracking = fresh.tracking || { checkpoints: [] };
        fresh.tracking.gps = gps;
        fresh.tracking.currentHub = currentHub;
        fresh.tracking.checkpoints.unshift({ status: nextStatus, location: currentHub, note: 'Auto update' });
        fresh.status = nextStatus;
        if (nextStatus === 'Delivered') {
          fresh.isDelivered = true;
          fresh.deliveredAt = Date.now();
        }
        await fresh.save();
        if (io) {
          io.emit('order:tracking', { orderId, tracking: fresh.tracking });
          io.emit('order:status', { orderId, status: fresh.status });
          io.emit('orders:changed');
        }
        step += 1;
        if (nextStatus === 'Delivered') {
          clearInterval(intervalId);
          simulators.delete(orderId);
        }
      } catch {}
    }, 5000);

    simulators.set(orderId, intervalId);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/simulator/stop/:orderId', (req, res) => {
  const { orderId } = req.params;
  const id = simulators.get(orderId);
  if (id) {
    clearInterval(id);
    simulators.delete(orderId);
  }
  res.json({ ok: true });
});

router.get('/simulator/status/:orderId', (req, res) => {
  const { orderId } = req.params;
  res.json({ running: simulators.has(orderId) });
});








