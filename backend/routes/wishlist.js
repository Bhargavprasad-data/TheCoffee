const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Wishlist = require('../models/Wishlist');

// Get user's wishlist
router.get('/', protect, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }); // Removed populate
    
    if (!wishlist) {
      // Create empty wishlist if it doesn't exist
      wishlist = new Wishlist({ user: req.user._id, items: [] });
      await wishlist.save();
    }
    
    // Map items to include id field for frontend compatibility
    const mappedItems = wishlist.items.map(item => {
      const itemObj = item.toObject ? item.toObject() : item;
      console.log('Wishlist item mapping:', {
        product: itemObj.product,
        productType: typeof itemObj.product,
        productToString: itemObj.product?.toString()
      });
      
      return {
        ...itemObj,
        id: itemObj.product.toString(), // Ensure ID is a string
        _id: itemObj.product.toString() // Ensure _id is a string
      };
    });
    
    console.log('Wishlist mapped items:', mappedItems);
    res.json({ items: mappedItems });
  } catch (error) {
    console.error('Wishlist GET error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item to wishlist
router.post('/add', protect, async (req, res) => {
  try {
    const { product } = req.body;
    
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, items: [] });
    }
    
    // Check if product already exists in wishlist
    const productId = product._id || product.id;
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    
    const existingItem = wishlist.items.find(item => 
      item.product.toString() === productId.toString()
    );
    
    if (existingItem) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }
    
    // Add new item
    wishlist.items.push({
      product: productId,
      name: product.name || '',
      price: product.price || 0,
      image: product.imageUrl || product.image || '',
      category: product.category || '',
      origin: product.origin || '',
      roastLevel: product.roastLevel || '',
      averageRating: product.averageRating || 0,
      countInStock: product.countInStock || 0
    });
    
    await wishlist.save();
    
    // Map items to include id field for frontend compatibility
    const mappedItems = wishlist.items.map(item => {
      const itemObj = item.toObject ? item.toObject() : item;
      return {
        ...itemObj,
        id: itemObj.product.toString(), // Ensure ID is a string
        _id: itemObj.product.toString() // Ensure _id is a string
      };
    });
    
    res.json({ message: 'Item added to wishlist', items: mappedItems });
  } catch (error) {
    console.error('Wishlist ADD error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from wishlist
router.delete('/remove/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    console.log('Wishlist remove request received:', {
      productId,
      productIdType: typeof productId,
      userId: req.user._id
    });
    
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    console.log('Found wishlist:', wishlist ? 'yes' : 'no');
    
    if (!wishlist) {
      console.log('Wishlist not found for user');
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    console.log('Current wishlist items:', wishlist.items);
    console.log('Items before removal:', wishlist.items.length);
    console.log('Looking for product ID:', productId);
    
    wishlist.items = wishlist.items.filter(item => {
      const itemProductId = item.product.toString();
      const targetProductId = productId.toString();
      console.log('Comparing item.product:', itemProductId, 'with target:', targetProductId);
      const shouldKeep = itemProductId !== targetProductId;
      console.log('Should keep item:', shouldKeep);
      return shouldKeep;
    });
    
    console.log('Items after removal:', wishlist.items.length);
    console.log('Wishlist object before save:', JSON.stringify(wishlist, null, 2));
    
    await wishlist.save();
    console.log('Wishlist saved successfully');
    
    // Map items to include id field for frontend compatibility
    const mappedItems = wishlist.items.map(item => {
      const itemObj = item.toObject ? item.toObject() : item;
      return {
        ...itemObj,
        id: itemObj.product.toString(), // Ensure ID is a string
        _id: itemObj.product.toString() // Ensure _id is a string
      };
    });
    
    console.log('Sending response with', mappedItems.length, 'items');
    res.json({ message: 'Item removed from wishlist', items: mappedItems });
  } catch (error) {
    console.error('Wishlist REMOVE error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle item in wishlist (add if not exists, remove if exists)
router.post('/toggle', protect, async (req, res) => {
  try {
    const { product } = req.body;
    
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, items: [] });
    }
    
    // Check if product already exists in wishlist
    const productId = product._id || product.id;
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    
    const existingItemIndex = wishlist.items.findIndex(item => 
      item.product.toString() === productId.toString()
    );
    
    if (existingItemIndex > -1) {
      // Remove item if it exists
      wishlist.items.splice(existingItemIndex, 1);
      await wishlist.save();
      
      // Map items to include id field for frontend compatibility
      const mappedItems = wishlist.items.map(item => {
        const itemObj = item.toObject ? item.toObject() : item;
        return {
          ...itemObj,
          id: itemObj.product.toString(), // Ensure ID is a string
          _id: itemObj.product.toString() // Ensure _id is a string
        };
      });
      
      res.json({ message: 'Item removed from wishlist', items: mappedItems, action: 'removed' });
    } else {
      // Add item if it doesn't exist
      wishlist.items.push({
        product: productId,
        name: product.name || '',
        price: product.price || 0,
        image: product.imageUrl || product.image || '',
        category: product.category || '',
        origin: product.origin || '',
        roastLevel: product.roastLevel || '',
        averageRating: product.averageRating || 0,
        countInStock: product.countInStock || 0
      });
      
      await wishlist.save();
      
      // Map items to include id field for frontend compatibility
      const mappedItems = wishlist.items.map(item => {
        const itemObj = item.toObject ? item.toObject() : item;
        return {
          ...itemObj,
          id: itemObj.product.toString(), // Ensure ID is a string
          _id: itemObj.product.toString() // Ensure _id is a string
        };
      });
      
      res.json({ message: 'Item added to wishlist', items: mappedItems, action: 'added' });
    }
  } catch (error) {
    console.error('Wishlist TOGGLE error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if product is in wishlist
router.get('/has/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      return res.json({ has: false });
    }
    
    const hasItem = wishlist.items.some(item => 
      item.product.toString() === productId || 
      item.product.toString() === productId.toString()
    );
    
    res.json({ has: hasItem });
  } catch (error) {
    console.error('Wishlist HAS error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear wishlist
router.delete('/clear', protect, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    wishlist.items = [];
    await wishlist.save();
    
    // Map items to include id field for frontend compatibility
    const mappedItems = wishlist.items.map(item => {
      const itemObj = item.toObject ? item.toObject() : item;
      return {
        ...itemObj,
        id: itemObj.product.toString(), // Ensure ID is a string
        _id: itemObj.product.toString() // Ensure _id is a string
      };
    });
    
    res.json({ message: 'Wishlist cleared', items: mappedItems });
  } catch (error) {
    console.error('Wishlist CLEAR error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Test route to debug wishlist item structure
router.get('/test-debug', protect, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }); // Removed populate
    
    if (!wishlist) {
      return res.json({ message: 'No wishlist found', items: [] });
    }
    
    console.log('=== WISHLIST DEBUG ===');
    console.log('Raw wishlist items:', wishlist.items);
    
    const debugItems = wishlist.items.map((item, index) => {
      const itemObj = item.toObject ? item.toObject() : item;
      console.log(`Item ${index}:`, {
        raw: itemObj,
        product: itemObj.product,
        productType: typeof itemObj.product,
        productToString: itemObj.product?.toString(),
        hasToString: !!(itemObj.product && typeof itemObj.product === 'object' && itemObj.product.toString)
      });
      
      return {
        index,
        raw: itemObj,
        product: itemObj.product,
        productType: typeof itemObj.product,
        productToString: itemObj.product?.toString(),
        hasToString: !!(itemObj.product && typeof itemObj.product === 'object' && itemObj.product.toString)
      };
    });
    
    console.log('=== WISHLIST DEBUG END ===');
    
    res.json({ 
      message: 'Wishlist debug data logged', 
      debugItems,
      rawWishlist: wishlist
    });
  } catch (error) {
    console.error('Wishlist debug error:', error);
    res.status(500).json({ message: 'Debug error', error: error.message });
  }
});

module.exports = router;
