import { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { cartAPI } from '../services/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Removed persistent localStorage to prevent unintended sync side-effects

// Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ITEMS':
      return Array.isArray(action.payload) ? action.payload : [];
    case 'ADD_ITEM': {
      const { item, quantity } = action.payload;
      const existing = state.find((it) => it.id === item.id);
      if (existing) {
        return state.map((it) =>
          it.id === item.id ? { ...it, quantity: it.quantity + (quantity ?? 1) } : it
        );
      }
      return [...state, { ...item, quantity: quantity ?? item.quantity ?? 1 }];
    }
    case 'REMOVE_ITEM': {
      const id = action.payload;
      return state.filter((it) => it.id !== id);
    }
    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        return state.filter((it) => it.id !== id);
      }
      return state.map((it) => (it.id === id ? { ...it, quantity } : it));
    }
    case 'CLEAR':
      return [];
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const { user, token } = useAuth();
  
  // Helper: normalize a product/item to our cart schema
  const normalizeItem = (item, quantityOverride) => {
    console.log('Normalizing item:', item);
    
    const normalizedId = item?.id ?? item?._id ?? item?.product;
    console.log('Normalized ID:', normalizedId, 'Type:', typeof normalizedId);
    
    // Ensure we have a valid ID
    if (!normalizedId) {
      console.warn('Item has no valid ID, skipping:', item);
      return null;
    }
    
    const normalized = {
      id: normalizedId,
      name: item?.name ?? 'Unknown Product',
      price: Number(item?.price ?? 0),
      quantity: quantityOverride ?? Number(item?.quantity ?? 1),
      image: item?.image ?? item?.imageUrl ?? '/images/coffee-placeholder.jpg',
      category: item?.category ?? 'Unknown Category',
    };
    
    console.log('Normalized item:', normalized);
    return normalized;
  };

  const [cartItems, dispatch] = useReducer(cartReducer, []);

  // No localStorage persistence

  const addToCart = useCallback(async (product, quantity = 1) => {
    if (!token) {
      console.warn('User must be logged in to add items to cart');
      return;
    }
    try {
      console.log('CartContext: Adding product to cart:', product);
      
      // Add to backend first
      const response = await cartAPI.add(product, quantity);
      console.log('CartContext: Backend response:', response.data);
      
      // Reload cart from backend to ensure sync
      const cartResponse = await cartAPI.get();
      const backendItems = cartResponse.data?.items || [];
      console.log('CartContext: Backend cart items:', backendItems);
      
      // Normalize items to ensure consistent structure
      const normalizedItems = backendItems.map(item => normalizeItem(item));
      console.log('CartContext: Normalized items:', normalizedItems);
      
      dispatch({ type: 'SET_ITEMS', payload: normalizedItems });
      
      // local persistence removed
      
      console.log('CartContext: Cart updated successfully');
    } catch (error) {
      console.error('CartContext: Failed to add item to cart:', error);
      console.error('CartContext: Error details:', error.response?.data || error.message);
      // Re-throw the error so the component can handle it
      throw error;
    }
  }, [token]);

  const removeFromCart = useCallback(async (productId) => {
    if (!token) return;
    try {
      await cartAPI.remove(productId);
      
      // Reload cart from backend to ensure sync
      const cartResponse = await cartAPI.get();
      const backendItems = cartResponse.data?.items || [];
      
      // Normalize items to ensure consistent structure
      const normalizedItems = backendItems.map(item => normalizeItem(item));
      dispatch({ type: 'SET_ITEMS', payload: normalizedItems });
      
      // local persistence removed
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      // Don't throw error, just log it and continue with local state
    }
  }, [token]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    if (!token) return;
    try {
      await cartAPI.update(productId, quantity);
      
      // Reload cart from backend to ensure sync
      const cartResponse = await cartAPI.get();
      const backendItems = cartResponse.data?.items || [];
      
      // Normalize items to ensure consistent structure
      const normalizedItems = backendItems.map(item => normalizeItem(item));
      dispatch({ type: 'SET_ITEMS', payload: normalizedItems });
      
      // local persistence removed
    } catch (error) {
      console.error('Failed to update cart item quantity:', error);
      // Don't throw error, just log it and continue with local state
    }
  }, [token]);

  const clearCart = useCallback(async () => {
    if (!token) return;
    try {
      await cartAPI.clear();
      
      // Reload cart from backend to ensure sync
      const cartResponse = await cartAPI.get();
      const backendItems = cartResponse.data?.items || [];
      
      dispatch({ type: 'SET_ITEMS', payload: backendItems });
      
      // local persistence removed
    } catch (error) {
      console.error('Failed to clear cart:', error);
      // Don't throw error, just log it and continue with local state
    }
  }, [token]);

  const getCartTotal = () => {
    if (!token) return 0;
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    if (!token) return 0;
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  // Merge strategy for carts: sum quantities for identical ids, prefer latest product info
  const mergeCarts = (a, b) => {
    console.log('Merging carts:', { a: a.length, b: b.length });
    
    const map = new Map();
    const addAll = (list) => {
      list.forEach((raw) => {
        const it = normalizeItem(raw);
        if (it) { // Only add if normalization was successful
          const existing = map.get(it.id);
          if (existing) {
            map.set(it.id, { ...it, quantity: Number(existing.quantity) + Number(it.quantity) });
          } else {
            map.set(it.id, { ...it });
          }
        } else {
          console.warn('Skipping invalid item during merge:', raw);
        }
      });
    };
    addAll(a);
    addAll(b);
    
    const result = Array.from(map.values());
    console.log('Merged cart result:', result);
    return result;
  };

  // Sync up to backend when authenticated and on initial auth change
  useEffect(() => {
    const sync = async () => {
      if (!token) {
        // Clear cart when user logs out
        dispatch({ type: 'CLEAR' });
        return;
      }
      try {
        console.log('Starting cart sync...');
        console.log('Current local cart items:', cartItems);
        
        // Load cart from backend
        const serverResp = await cartAPI.get();
        const serverItems = Array.isArray(serverResp?.data?.items)
          ? serverResp.data.items.map((it) => normalizeItem(it))
          : [];
        
        console.log('Server cart items:', serverItems);
        dispatch({ type: 'SET_ITEMS', payload: serverItems });
        
        console.log('Cart sync completed successfully');
      } catch (e) {
        console.error('Failed to sync cart with backend:', e);
        console.error('Error details:', {
          message: e.message,
          status: e.response?.status,
          data: e.response?.data
        });
        // If server unavailable, continue using local cart
        // Don't retry immediately to prevent infinite loops
      }
    };
    
    // Only sync if we have a token and haven't synced recently
    if (token) {
      console.log('Token detected, starting cart sync...');
      sync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Remove cartItems dependency to prevent infinite loops

  // Remove the conflicting useEffect that was pushing cart changes
  // This was causing conflicts with the sync logic above

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
