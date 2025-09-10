const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Cart = require('../models/Cart');

// Test route to verify server is working
router.get('/test', (req, res) => {
  res.json({ message: 'Cart route is working', timestamp: new Date().toISOString() });
});

// Test route without authentication
router.get('/test-no-auth', (req, res) => {
  res.json({ message: 'Cart route is working without auth', timestamp: new Date().toISOString() });
});

// Get user's cart
router.get('/', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      // Create empty cart if it doesn't exist
      cart = new Cart({ user: req.user._id, items: [] });
      await cart.save();
    }
    
    // Map items to include id field for frontend compatibility
    // Also filter out any invalid items
    const mappedItems = cart.items
      .filter(item => {
        // Filter out items with invalid product IDs
        if (!item.product || item.product.toString() === '[object Object]') {
          console.warn('Filtering out invalid cart item:', item);
          return false;
        }
        return true;
      })
      .map(item => {
        const itemObj = item.toObject ? item.toObject() : item;
        return {
          ...itemObj,
          id: itemObj.product.toString(), // Ensure ID is a string
          _id: itemObj.product.toString() // Ensure _id is a string
        };
      });
    
    // If we filtered out invalid items, save the cleaned cart
    if (mappedItems.length !== cart.items.length) {
      console.log('Cleaning cart - removing invalid items');
      cart.items = cart.items.filter(item => {
        if (!item.product || item.product.toString() === '[object Object]') {
          return false;
        }
        return true;
      });
      await cart.save();
      console.log('Cart cleaned and saved');
    }
    
    res.json({ items: mappedItems });
  } catch (error) {
    console.error('Cart GET error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Replace user's cart
router.put('/', protect, async (req, res) => {
  try {
    const { items } = req.body;
    console.log('Cart replace request received:', { 
      items, 
      userId: req.user._id,
      itemsType: typeof items,
      isArray: Array.isArray(items),
      itemsLength: items ? items.length : 'undefined'
    });
    
    let cart = await Cart.findOne({ user: req.user._id });
    console.log('Found cart:', cart ? 'yes' : 'no');
    
    if (!cart) {
      console.log('Creating new cart for user');
      cart = new Cart({ user: req.user._id, items: [] });
    } else {
      console.log('Using existing cart with', cart.items.length, 'items');
    }
    
    // Transform items to match Cart model structure
    if (Array.isArray(items) && items.length > 0) {
      console.log('Processing', items.length, 'items');
      cart.items = items.map((item, index) => {
        console.log(`Processing item ${index}:`, item);
        
        // Ensure all required fields are present with fallbacks
        const productId = item.id || item._id || item.product;
        if (!productId) {
          console.warn('Skipping item without product ID:', item);
          return null;
        }
        
        // Validate and sanitize the data
        const sanitizedItem = {
          product: productId,
          name: String(item.name || 'Unknown Product').trim(),
          price: Math.max(0, Number(item.price) || 0),
          quantity: Math.max(1, Number(item.quantity) || 1),
          image: String(item.image || item.imageUrl || '/images/coffee-placeholder.jpg').trim(),
          category: String(item.category || 'Unknown Category').trim()
        };
        
        console.log(`Sanitized item ${index}:`, sanitizedItem);
        
        // Additional validation
        if (!sanitizedItem.name || sanitizedItem.name === '') {
          sanitizedItem.name = 'Unknown Product';
        }
        
        if (sanitizedItem.price < 0) {
          sanitizedItem.price = 0;
        }
        
        if (sanitizedItem.quantity < 1) {
          sanitizedItem.quantity = 1;
        }
        
        return sanitizedItem;
      }).filter(Boolean); // Remove any null items
      
      console.log('Final cart items after processing:', cart.items);
    } else {
      console.log('No items or empty array, setting empty cart');
      cart.items = [];
    }
    
    console.log('About to save cart with', cart.items.length, 'items');
    console.log('Cart object before save:', JSON.stringify(cart, null, 2));
    
    await cart.save();
    console.log('Cart saved successfully');
    
    // Map items to include id field for frontend compatibility
    const mappedItems = cart.items.map(item => {
      const itemObj = item.toObject ? item.toObject() : item;
      return {
        ...itemObj,
        id: itemObj.product.toString(), // Ensure ID is a string
        _id: itemObj.product.toString() // Ensure _id is a string
      };
    });
    
    console.log('Sending response with', mappedItems.length, 'items');
    res.json({ message: 'Cart updated successfully', items: mappedItems });
  } catch (error) {
    console.error('Cart PUT error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add item to cart
router.post('/add', protect, async (req, res) => {
  try {
    console.log('=== CART ADD REQUEST START ===');
    const { product, quantity = 1 } = req.body;
    console.log('Request body:', req.body);
    console.log('Product:', product);
    console.log('Quantity:', quantity);
    console.log('User ID:', req.user._id);
    
    // Validate request body
    if (!product) {
      console.error('No product provided in request body');
      return res.status(400).json({ message: 'Product is required' });
    }
    
    console.log('Product type:', typeof product);
    console.log('Product keys:', Object.keys(product || {}));
    
    let cart = await Cart.findOne({ user: req.user._id });
    console.log('Found cart:', cart ? 'yes' : 'no');
    
    if (!cart) {
      console.log('Creating new cart for user');
      cart = new Cart({ user: req.user._id, items: [] });
    } else {
      console.log('Using existing cart with', cart.items.length, 'items');
    }
    
    // Extract product ID with multiple fallbacks - handle ObjectId properly
    let productId = product._id || product.id || product.product;
    
    console.log('Raw product ID:', productId, 'Type:', typeof productId);
    
    // If productId is an ObjectId, convert it to string
    if (productId && typeof productId === 'object' && productId.toString) {
      productId = productId.toString();
      console.log('Converted ObjectId to string:', productId);
    }
    
    console.log('Extracted product ID:', productId, 'Type:', typeof productId);
    
    if (!productId) {
      console.error('No valid product ID found in product object:', product);
      return res.status(400).json({ message: 'Product ID is required' });
    }
    
    // Ensure productId is a string for the database
    const productIdString = String(productId);
    console.log('Final product ID string:', productIdString);
    
    // Additional validation - check if the product ID is valid
    if (productIdString === '[object Object]' || productIdString === 'undefined' || productIdString === 'null') {
      console.error('Invalid product ID:', productIdString);
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    // Check if it looks like a valid MongoDB ObjectId (24 hex characters)
    if (!/^[0-9a-fA-F]{24}$/.test(productIdString)) {
      console.error('Product ID does not match ObjectId format:', productIdString);
      return res.status(400).json({ message: 'Invalid product ID format' });
    }
    
    // Validate and sanitize product data
    const sanitizedProduct = {
      product: productIdString,  // Use the string version
      name: String(product.name || product.title || 'Unknown Product').trim(),
      price: Math.max(0, Number(product.price) || 0),
      quantity: Math.max(1, Number(quantity) || 1),
      image: String(product.imageUrl || product.image || product.img || '/images/coffee-placeholder.jpg').trim(),
      category: String(product.category || 'Unknown Category').trim()
    };
    
    // Additional validation for required fields
    if (!sanitizedProduct.name || sanitizedProduct.name === 'Unknown Product') {
      console.error('Invalid product name:', product.name);
      return res.status(400).json({ message: 'Product name is required' });
    }
    
    if (sanitizedProduct.price <= 0) {
      console.error('Invalid product price:', product.price, 'Sanitized:', sanitizedProduct.price);
      return res.status(400).json({ message: 'Product price must be greater than 0' });
    }
    
    console.log('Sanitized product data:', sanitizedProduct);
    console.log('Product ID type:', typeof productId, 'Value:', productId);
    console.log('Product name type:', typeof sanitizedProduct.name, 'Value:', sanitizedProduct.name);
    console.log('Product price type:', typeof sanitizedProduct.price, 'Value:', sanitizedProduct.price);
    console.log('Product quantity type:', typeof sanitizedProduct.quantity, 'Value:', sanitizedProduct.quantity);
    
    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId.toString()
    );
    
    if (existingItemIndex > -1) {
      console.log('Product already exists in cart, updating quantity');
      // Update quantity if product exists
      cart.items[existingItemIndex].quantity += sanitizedProduct.quantity;
      console.log('Updated quantity for existing item:', cart.items[existingItemIndex]);
    } else {
      console.log('Adding new product to cart');
      // Add new item with all required fields
      cart.items.push(sanitizedProduct);
      console.log('Added new item to cart:', sanitizedProduct);
    }
    
    console.log('Cart items before save:', cart.items);
    console.log('About to save cart with', cart.items.length, 'items');
    
    await cart.save();
    console.log('Cart saved successfully');
    
    // Map items to include id field for frontend compatibility
    const mappedItems = cart.items.map(item => {
      const itemObj = item.toObject ? item.toObject() : item;
      return {
        ...itemObj,
        id: itemObj.product.toString(), // Ensure ID is a string
        _id: itemObj.product.toString() // Ensure _id is a string
      };
    });
    
    console.log('Sending response with', mappedItems.length, 'items');
    console.log('=== CART ADD REQUEST END ===');
    res.json({ message: 'Item added to cart', items: mappedItems });
  } catch (error) {
    console.error('=== CART ADD ERROR ===');
    console.error('Error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    console.error('=== CART ADD ERROR END ===');
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove item from cart
router.delete('/remove/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    // Remove items where product ID matches (either as ObjectId or string)
    cart.items = cart.items.filter(item => 
      item.product.toString() !== productId && 
      item.product.toString() !== productId.toString()
    );
    
    await cart.save();
    
    // Map items to include id field for frontend compatibility
    const mappedItems = cart.items.map(item => {
      const itemObj = item.toObject ? item.toObject() : item;
      return {
        ...itemObj,
        id: itemObj.product.toString(), // Ensure ID is a string
        _id: itemObj.product.toString() // Ensure _id is a string
      };
    });
    
    res.json({ message: 'Item removed from cart', items: mappedItems });
  } catch (error) {
    console.error('Cart REMOVE error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update item quantity
router.put('/update/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    
    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }
    
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const itemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId || 
      item.product.toString() === productId.toString()
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    
    // Map items to include id field for frontend compatibility
    const mappedItems = cart.items.map(item => {
      const itemObj = item.toObject ? item.toObject() : item;
      return {
        ...itemObj,
        id: itemObj.product.toString(), // Ensure ID is a string
        _id: itemObj.product.toString() // Ensure _id is a string
      };
    });
    
    res.json({ message: 'Quantity updated', items: mappedItems });
  } catch (error) {
    console.error('Cart UPDATE error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear cart
router.delete('/clear', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = [];
    await cart.save();
    
    // Map items to include id field for frontend compatibility
    const mappedItems = cart.items.map(item => {
      const itemObj = item.toObject ? item.toObject() : item;
      return {
        ...itemObj,
        id: itemObj.product.toString(), // Ensure ID is a string
        _id: itemObj.product.toString() // Ensure _id is a string
      };
    });
    
    res.json({ message: 'Cart cleared', items: mappedItems });
  } catch (error) {
    console.error('Cart CLEAR error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Test route to log incoming cart data
router.post('/test-add', protect, (req, res) => {
  console.log('=== TEST CART ADD DATA ===');
  console.log('Request body:', req.body);
  console.log('Product:', req.body.product);
  console.log('Product keys:', Object.keys(req.body.product || {}));
  console.log('Product values:', {
    id: req.body.product?.id,
    _id: req.body.product?._id,
    product: req.body.product?.product,
    name: req.body.product?.product?.name,
    price: req.body.product?.price,
    priceType: typeof req.body.product?.price
  });
  console.log('=== TEST END ===');
  res.json({ 
    message: 'Test data logged', 
    receivedData: req.body,
    productInfo: {
      id: req.body.product?.id,
      _id: req.body.product?._id,
      product: req.body.product?.product,
      name: req.body.product?.name,
      price: req.body.product?.price,
      priceType: typeof req.body.product?.price
    }
  });
});

module.exports = router;
