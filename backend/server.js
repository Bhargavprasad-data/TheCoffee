const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
// Increase body size to allow base64 images
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coffee-shop', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Clean up any invalid cart items on server startup
    try {
      const Cart = require('./models/Cart');
      const carts = await Cart.find({});
      let cleanedCount = 0;
      
      for (const cart of carts) {
        const originalLength = cart.items.length;
        cart.items = cart.items.filter(item => {
          if (!item.product || item.product.toString() === '[object Object]') {
            return false;
          }
          return true;
        });
        
        if (cart.items.length !== originalLength) {
          await cart.save();
          cleanedCount += (originalLength - cart.items.length);
        }
      }
      
      if (cleanedCount > 0) {
        console.log(`Cleaned up ${cleanedCount} invalid cart items on startup`);
      }
    } catch (error) {
      console.error('Error cleaning up cart items:', error);
    }
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    console.log('Continuing without MongoDB connection...');
  });

// Routes
console.log('Loading routes...');
try {
  app.use('/api/auth', require('./routes/auth'));
  console.log('Auth route loaded');
} catch (error) {
  console.error('Error loading auth route:', error);
}

try {
  app.use('/api/products', require('./routes/products'));
  console.log('Products route loaded');
} catch (error) {
  console.error('Error loading products route:', error);
}

try {
  app.use('/api/orders', require('./routes/orders'));
  console.log('Orders route loaded');
} catch (error) {
  console.error('Error loading orders route:', error);
}

try {
  const cartRoute = require('./routes/cart');
  app.use('/api/cart', cartRoute);
  console.log('Cart route loaded successfully');
} catch (error) {
  console.error('Error loading cart route:', error);
  console.error('Error details:', error.message, error.stack);
}

try {
  app.use('/api/wishlist', require('./routes/wishlist'));
  console.log('Wishlist route loaded');
} catch (error) {
  console.error('Error loading wishlist route:', error);
}

try {
  app.use('/api/webhooks', require('./routes/webhooks'));
  console.log('Webhooks route loaded');
} catch (error) {
  console.error('Error loading webhooks route:', error);
}

// Live tracking route disabled per requirements

console.log('All routes loaded successfully');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Socket.io setup for real-time order updates
try {
  const { Server } = require('socket.io');
  const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST', 'PUT'] }
  });
  app.set('io', io);
  io.on('connection', (socket) => {
    socket.on('join', (rooms) => {
      if (Array.isArray(rooms)) rooms.forEach(r => socket.join(r));
    });
    socket.on('subscribe:order', (orderId) => {
      if (orderId) socket.join(`order:${orderId}`);
    });
    // driver/admin rooms removed in manual tracking mode
    socket.on('disconnect', () => {});
  });
  console.log('Socket.io initialized');
} catch (e) {
  console.warn('Socket.io not available. Install it to enable realtime features.');
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Add error handling
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  } else {
    console.error('Server error:', error);
  }
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});