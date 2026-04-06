import { createContext, useContext, useState, useCallback } from 'react';
import apiClient from '../api/apiClient';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], subtotal: 0, totalItems: 0 });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [], subtotal: 0, totalItems: 0 });
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.get('/cart');
      setCart(res.data.data || { items: [], subtotal: 0, totalItems: 0 });
    } catch (error) {
      if (error.response?.status === 403 || error.response?.status === 401) {
        console.warn('Cart fetch skipped, not authenticated yet:', error.response.status);
      } else {
        console.error('Failed to fetch cart:', error);
      }
      setCart({ items: [], subtotal: 0, totalItems: 0 });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const addItem = async (productId, quantity) => {
    try {
      const res = await apiClient.post('/cart', { productId, quantity });
      setCart(res.data.data);
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const updateItem = async (cartItemId, quantity) => {
    try {
      const res = await apiClient.put(`/cart/${cartItemId}`, null, {
        params: { quantity },
      });
      setCart(res.data.data);
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      const res = await apiClient.delete(`/cart/${cartItemId}`);
      setCart(res.data.data);
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const clearCart = () => {
    setCart({ items: [], subtotal: 0, totalItems: 0 });
  };

  const value = {
    cart,
    items: cart.items,
    subtotal: cart.subtotal,
    totalItems: cart.totalItems,
    loading,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
