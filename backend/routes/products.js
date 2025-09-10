const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create product (Admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      imageUrl,
      category,
      countInStock,
      roastLevel,
      origin,
      weight
    } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      imageUrl,
      category,
      countInStock,
      roastLevel,
      origin,
      weight
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product (Admin only)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (product) {
      product.name = req.body.name || product.name;
      product.description = req.body.description || product.description;
      product.price = req.body.price || product.price;
      product.imageUrl = req.body.imageUrl || product.imageUrl;
      product.category = req.body.category || product.category;
      product.countInStock = req.body.countInStock || product.countInStock;
      product.roastLevel = req.body.roastLevel || product.roastLevel;
      product.origin = req.body.origin || product.origin;
      product.weight = req.body.weight || product.weight;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add product review
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.ratings.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Product already reviewed' });
      }

      const newReview = {
        user: req.user._id,
        rating: Number(rating),
        review
      };

      product.ratings.push(newReview);
      product.averageRating =
        product.ratings.reduce((acc, item) => item.rating + acc, 0) /
        product.ratings.length;

      await product.save();
      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;