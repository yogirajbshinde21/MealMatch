import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { cartService } from '../services/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();

  // Helper function to save cart based on user type
  const saveCartData = useCallback((cartData, userId) => {
    if (!userId) return;
    
    // Always save to localStorage as backup
    localStorage.setItem(`cart_${userId}`, JSON.stringify(cartData));
    console.log('Cart saved to localStorage for user:', userId);
    
    // Don't automatically sync to MongoDB to avoid 500 errors during every state change
    // Let individual cart operations handle MongoDB sync explicitly
  }, []);

  // Local cart manipulation function
  const addToLocalCart = useCallback((meal, quantity, bargainPrice, weatherDiscount) => {
    console.log('Adding to cart:', meal.name, 'Quantity:', quantity);
    
    setCart(prevCart => {
      const currentCart = prevCart || { items: [] };
      const existingItemIndex = currentCart.items.findIndex(item => 
        item.meal._id === meal._id
      );

      let updatedItems;
      if (existingItemIndex > -1) {
        console.log('Updating existing item quantity');
        updatedItems = [...currentCart.items];
        updatedItems[existingItemIndex].quantity += quantity;
        if (bargainPrice) {
          updatedItems[existingItemIndex].bargainPrice = bargainPrice;
        }
        if (weatherDiscount !== null && weatherDiscount !== undefined) {
          updatedItems[existingItemIndex].weatherDiscount = weatherDiscount;
        }
      } else {
        console.log('Adding new item to cart');
        updatedItems = [...currentCart.items, {
          _id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
          meal,
          quantity,
          bargainPrice,
          weatherDiscount
        }];
      }

      const updatedCart = { ...currentCart, items: updatedItems };
      console.log('Cart now has', updatedCart.items.length, 'items');
      
      // Save cart data
      if (user) {
        saveCartData(updatedCart, user.id);
      }
      
      return updatedCart;
    });
  }, [user, saveCartData]);

  // Local cart item update function
  const updateLocalCartItem = useCallback((itemId, quantity) => {
    setCart(prevCart => {
      const currentCart = prevCart || { items: [] };
      let updatedItems;
      if (quantity <= 0) {
        updatedItems = currentCart.items.filter(item => item._id !== itemId);
      } else {
        updatedItems = currentCart.items.map(item =>
          item._id === itemId ? { ...item, quantity } : item
        );
      }

      const updatedCart = { ...currentCart, items: updatedItems };
      
      // Save cart data
      if (user) {
        saveCartData(updatedCart, user.id);
      }
      
      return updatedCart;
    });
  }, [user, saveCartData]);

  // Define loadCart with useCallback to prevent infinite loops
  const loadCart = useCallback(async () => {
    if (!user || user.role === 'admin') {
      console.log('CartContext: No user or admin user, setting empty cart');
      setCart({ items: [] });
      return;
    }
    
    console.log('CartContext: Loading cart for user:', user.id, user.email);
    setLoading(true);
    try {
      // First, always try to load from localStorage as it's faster and more reliable
      console.log('CartContext: Loading cart from localStorage');
      const localCart = localStorage.getItem(`cart_${user.id}`);
      if (localCart) {
        try {
          const parsedCart = JSON.parse(localCart);
          console.log('CartContext: Found cart in localStorage:', parsedCart);
          setCart(parsedCart);
        } catch (parseError) {
          console.error('Error parsing localStorage cart:', parseError);
          setCart({ items: [] });
        }
      } else {
        console.log('CartContext: No cart found in localStorage, initializing empty cart');
        setCart({ items: [] });
      }

      // For real users (not demo), also try to load from MongoDB and sync
      if (user.id !== 'demo-user-id' && !user.id.startsWith('user-') && !user.id.startsWith('demo-') && !user.id.startsWith('admin-')) {
        console.log('CartContext: Loading cart from MongoDB for real user:', user.id);
        try {
          const response = await cartService.getCart(user.id);
          console.log('CartContext: Cart service response:', response.data);
          
          // Check if we got actual cart data from MongoDB
          if (response.data?.cart && !response.data?.mockMode) {
            console.log('CartContext: Loading cart from MongoDB');
            const mongoCart = response.data.cart;
            setCart(mongoCart);
            // Also update localStorage with MongoDB data
            localStorage.setItem(`cart_${user.id}`, JSON.stringify(mongoCart));
          }
        } catch (error) {
          console.warn('Could not load cart from MongoDB, using localStorage:', error);
          // LocalStorage cart is already loaded above, so we're good
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load cart when user changes (but only after auth is complete)
  useEffect(() => {
    console.log('CartContext: Auth loading state:', authLoading, 'User:', user?.email || 'none');
    
    if (authLoading) {
      // Wait for authentication to complete
      return;
    }
    
    if (user && user.role !== 'admin') {
      console.log('CartContext: Triggering cart load for user:', user.email);
      loadCart();
    } else {
      console.log('CartContext: Setting empty cart (no user or admin)');
      setCart({ items: [] });
    }
  }, [user, authLoading, loadCart]);

  const addToCart = useCallback(async (meal, quantity = 1, bargainPrice = null, weatherDiscount = null) => {
    if (!user || user.role === 'admin') return;

    setLoading(true);
    try {
      console.log('CartContext: Adding to cart', { meal, quantity, bargainPrice, weatherDiscount });
      
      // Always handle cart locally first for immediate UI response
      addToLocalCart(meal, quantity, bargainPrice, weatherDiscount);
      
      // For real users (not demo/mock), also try to sync to MongoDB in background
      if (user.id !== 'demo-user-id' && !user.id.startsWith('user-') && !user.id.startsWith('demo-') && !user.id.startsWith('admin-')) {
        try {
          console.log('CartContext: Syncing to MongoDB for real user');
          const response = await cartService.addToCart(user.id, {
            mealId: meal._id,
            quantity,
            bargainPrice,
            weatherDiscount
          });
          console.log('CartContext: MongoDB sync successful', response);
        } catch (error) {
          console.warn('CartContext: MongoDB sync failed, continuing with local cart:', error);
          // Continue with local cart - it's already been added above
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Fallback to local cart handling (likely already done above)
      try {
        addToLocalCart(meal, quantity, bargainPrice, weatherDiscount);
      } catch (localError) {
        console.error('Failed to add to local cart as well:', localError);
      }
    } finally {
      setLoading(false);
    }
  }, [user, addToLocalCart]);

  const updateCartItem = useCallback(async (itemId, quantity) => {
    if (!user || user.role === 'admin') return;

    setLoading(true);
    try {
      // For demo users, handle cart locally with localStorage
      if (user.id === 'demo-user-id') {
        console.log('CartContext: Demo user, updating cart locally');
        updateLocalCartItem(itemId, quantity);
        setLoading(false);
        return;
      }

      // For real users, try MongoDB first
      const response = await cartService.updateCartItem(user.id, itemId, { quantity });
      
      // Check if backend returned actual cart data
      if (response.data?.cart && !response.data?.mockMode) {
        console.log('CartContext: Cart item updated in MongoDB');
        const updatedCart = response.data.cart;
        setCart(updatedCart);
      } else {
        console.log('CartContext: Backend in mock mode for update, handling locally');
        updateLocalCartItem(itemId, quantity);
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      // Fallback to local update
      updateLocalCartItem(itemId, quantity);
    } finally {
      setLoading(false);
    }
  }, [user, updateLocalCartItem]);

  const removeFromCart = useCallback(async (itemId) => {
    if (!user || user.role === 'admin') return;

    setLoading(true);
    try {
      // For demo users, handle cart locally with localStorage
      if (user.id === 'demo-user-id') {
        console.log('CartContext: Demo user, removing from cart locally');
        updateLocalCartItem(itemId, 0);
        setLoading(false);
        return;
      }

      // For real users, try MongoDB first
      const response = await cartService.removeFromCart(user.id, itemId);
      
      // Check if backend returned actual cart data
      if (response.data?.cart && !response.data?.mockMode) {
        console.log('CartContext: Item removed from MongoDB cart');
        const updatedCart = response.data.cart;
        setCart(updatedCart);
      } else {
        console.log('CartContext: Backend in mock mode for remove, handling locally');
        updateLocalCartItem(itemId, 0);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      updateLocalCartItem(itemId, 0);
    } finally {
      setLoading(false);
    }
  }, [user, updateLocalCartItem]);

  const clearCart = useCallback(async () => {
    if (!user || user.role === 'admin') return;

    setLoading(true);
    try {
      // For demo users, handle cart locally with localStorage
      if (user.id === 'demo-user-id') {
        console.log('CartContext: Demo user, clearing cart locally');
        const clearedCart = { items: [] };
        setCart(clearedCart);
        localStorage.setItem(`cart_${user.id}`, JSON.stringify(clearedCart));
        console.log('Cart cleared in localStorage for demo user');
        setLoading(false);
        return;
      }

      // For real users, try MongoDB first
      const response = await cartService.clearCart(user.id);
      
      // Check if backend returned actual cart data
      if (response.data?.cart !== undefined && !response.data?.mockMode) {
        console.log('CartContext: Cart cleared in MongoDB');
        const clearedCart = response.data.cart;
        setCart(clearedCart);
      } else {
        console.log('CartContext: Backend in mock mode for clear, handling locally');
        const clearedCart = { items: [] };
        setCart(clearedCart);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      const clearedCart = { items: [] };
      setCart(clearedCart);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getTotalPrice = (applyWeatherPricing) => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => {
      let price = item.meal.price; // Start with base price
      
      // Apply bargain price if available (takes priority over weather discount)
      if (item.bargainPrice) {
        price = item.bargainPrice;
      } else if (item.weatherDiscount && item.weatherDiscount > 0) {
        // Apply stored weather discount from cart item
        const discountAmount = (item.meal.price * item.weatherDiscount) / 100;
        price = item.meal.price - discountAmount;
      } else if (applyWeatherPricing) {
        // Fallback to current weather pricing if no stored discount
        const weatherPricing = applyWeatherPricing(item.meal.price);
        price = weatherPricing.finalPrice;
      }
      
      // Round the unit price first, then multiply by quantity for consistency
      // This ensures the total matches what users see as unit price × quantity
      const roundedUnitPrice = Math.round(price);
      const itemTotal = roundedUnitPrice * item.quantity;
      return total + itemTotal;
    }, 0);
  };

  const getTotalSavings = (applyWeatherPricing) => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((savings, item) => {
      let savedAmount = 0;
      const basePrice = item.meal.price;
      
      if (item.bargainPrice && item.bargainPrice < basePrice) {
        // Savings from bargaining - use actual prices for savings calculation
        savedAmount = (basePrice - item.bargainPrice) * item.quantity;
      } else if (item.weatherDiscount && item.weatherDiscount > 0) {
        // Savings from stored weather discount
        const discountAmount = (basePrice * item.weatherDiscount) / 100;
        const discountedPrice = basePrice - discountAmount;
        const roundedDiscountedPrice = Math.round(discountedPrice);
        // Calculate savings based on rounded prices for consistency
        savedAmount = (basePrice - roundedDiscountedPrice) * item.quantity;
      } else if (!item.bargainPrice && applyWeatherPricing) {
        // Fallback to current weather discount if no stored discount
        const weatherPricing = applyWeatherPricing(basePrice);
        if (weatherPricing.hasDiscount) {
          const roundedDiscountedPrice = Math.round(weatherPricing.finalPrice);
          savedAmount = (basePrice - roundedDiscountedPrice) * item.quantity;
        }
      }
      return savings + savedAmount;
    }, 0);
  };

  const getTotalItems = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cart,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getTotalItems,
    getTotalSavings,
    loadCart,
    refreshCart: loadCart // Alias for external refresh calls
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
