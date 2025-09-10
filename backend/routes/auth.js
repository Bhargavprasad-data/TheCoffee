const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Simple token store in memory (replace with DB for production)
const resetTokens = new Map(); // email -> { token, expiresAt }

// Request password reset (send email)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: 'If the email exists, a reset was sent' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 1000 * 60 * 30; // 30 minutes
    resetTokens.set(email, { token, expiresAt });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'dummy@example.com',
        pass: process.env.SMTP_PASS || 'dummy-password'
      }
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    const mailOptions = {
      from: process.env.MAIL_FROM || 'no-reply@guruscoffee.com',
      to: email,
      subject: 'Reset your Guru\'s Coffee password',
      html: `<p>You requested a password reset.</p><p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 30 minutes.</p>`
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (e) {
      // For dev environments without SMTP, still respond ok and log
      console.log('Email send skipped/failure (dev):', e.message);
    }

    res.json({ message: 'Reset link sent if email exists' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password, email } = req.body;
    const lookupEmail = email || req.query.email || req.headers['x-reset-email'];
    if (!lookupEmail) return res.status(400).json({ message: 'Email required' });
    const entry = resetTokens.get(lookupEmail);
    if (!entry || entry.token !== token || Date.now() > entry.expiresAt) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const user = await User.findOne({ email: lookupEmail });
    if (!user) return res.status(400).json({ message: 'Invalid request' });
    user.password = password;
    await user.save();
    resetTokens.delete(lookupEmail);
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, adminCode } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const isFirstUser = (await User.countDocuments()) === 0;
    const invite = process.env.ADMIN_INVITE_CODE || '089488';
    const shouldBeAdmin = isFirstUser || (adminCode && adminCode === invite);
    const user = await User.create({
      name,
      email,
      password,
      isAdmin: shouldBeAdmin
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin login (ensures account is admin)
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized as admin' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin register (requires valid invite code)
router.post('/admin/register', async (req, res) => {
  try {
    const { name, email, password, adminCode } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const invite = process.env.ADMIN_INVITE_CODE || '089488';
    if (!adminCode || adminCode !== invite) {
      return res.status(400).json({ message: 'Invalid admin invite code' });
    }

    const user = await User.create({ name, email, password, isAdmin: true });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (Admin only)
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      isAdmin: user.isAdmin,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    const token = jwt.sign({ id: updatedUser._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone || '',
      isAdmin: updatedUser.isAdmin,
      createdAt: updatedUser.createdAt,
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;