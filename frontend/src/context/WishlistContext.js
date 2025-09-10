import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { wishlistAPI } from '../services/api';

const WishlistContext = createContext(null);

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider');
  return ctx;
};

const normalizeItem = (item) => {
  // Handle ObjectId conversion properly
  let itemId = item?.id ?? item?._id ?? item?.product;
  
  console.log('WishlistContext: Normalizing item ID:', { 
    original: itemId, 
    type: typeof itemId, 
    hasToString: !!(itemId && typeof itemId === 'object' && itemId.toString) 
  });
  
  // Convert ObjectId to string if needed
  if (itemId && typeof itemId === 'object' && itemId.toString) {
    itemId = itemId.toString();
    console.log('WishlistContext: Converted ObjectId to string:', itemId);
  }
  
  const normalized = {
    id: itemId,
    name: item?.name ?? '',
    price: Number(item?.price ?? 0),
    image: item?.image ?? item?.imageUrl ?? '',
    category: item?.category ?? '',
    origin: item?.origin ?? '',
    roastLevel: item?.roastLevel ?? '',
    rating: item?.rating ?? item?.averageRating ?? 0,
    countInStock: item?.countInStock ?? 0,
  };
  
  console.log('WishlistContext: Normalized item:', normalized);
  return normalized;
};

export const WishlistProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load wishlist from backend when user logs in
  useEffect(() => {
    const loadWishlist = async () => {
      if (!token) {
        setItems([]);
        return;
      }
      
      try {
        setLoading(true);
        const response = await wishlistAPI.get();
        const wishlistItems = response.data?.items || [];
        console.log('WishlistContext: Raw items from backend:', wishlistItems);
        console.log('WishlistContext: First item sample:', wishlistItems[0]);
        
        const normalizedItems = wishlistItems.map(normalizeItem);
        console.log('WishlistContext: Normalized items:', normalizedItems);
        
        setItems(normalizedItems);
      } catch (error) {
        console.error('Failed to load wishlist:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, [token]);

  const add = useCallback(async (product) => {
    if (!token) {
      console.warn('User must be logged in to add items to wishlist');
      return;
    }
    
    try {
      await wishlistAPI.add(product);
      // Reload wishlist from backend to ensure sync
      const response = await wishlistAPI.get();
      const wishlistItems = response.data?.items || [];
      setItems(wishlistItems.map(normalizeItem));
    } catch (error) {
      console.error('Failed to add item to wishlist:', error);
      throw error; // Re-throw to let component handle it
    }
  }, [token]);

  const remove = useCallback(async (id) => {
    if (!token) return;
    
    try {
      await wishlistAPI.remove(id);
      // Reload wishlist from backend to ensure sync
      const response = await wishlistAPI.get();
      const wishlistItems = response.data?.items || [];
      setItems(wishlistItems.map(normalizeItem));
    } catch (error) {
      console.error('Failed to remove item from wishlist:', error);
      throw error; // Re-throw to let component handle it
    }
  }, [token]);

  const toggle = useCallback(async (product) => {
    if (!token) {
      console.warn('User must be logged in to toggle wishlist items');
      return;
    }
    
    try {
      await wishlistAPI.toggle(product);
      // Reload wishlist from backend to ensure sync
      const response = await wishlistAPI.get();
      const wishlistItems = response.data?.items || [];
      setItems(wishlistItems.map(normalizeItem));
    } catch (error) {
      console.error('Failed to toggle wishlist item:', error);
      throw error; // Re-throw to let component handle it
    }
  }, [token]);

  const has = useCallback((id) => {
    return items.some((i) => i.id === id);
  }, [items]);

  return (
    <WishlistContext.Provider value={{ items, add, remove, toggle, has, loading }}>
      {children}
    </WishlistContext.Provider>
  );
};




