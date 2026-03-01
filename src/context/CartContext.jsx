import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { cartApi } from '../api/cartApi';
import { useAuth } from './AuthContext';
import { useToast } from './useToast';

const CartContext = createContext(null);

const SESSION_KEY = 'cart_session_id';

const generateId = () =>
  crypto.randomUUID?.() ??
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });

const getSessionId = () => {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = generateId();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

const clearSessionId = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const prevAuthRef = useRef(isAuthenticated);

  const getSessionForRequest = useCallback(() => {
    return getSessionId();
  }, []);

  const updateCartState = useCallback((cartData) => {
    if (cartData) {
      setCartItems(cartData.items || []);
      setTotalItems(cartData.total_items || 0);
      setTotalAmount(cartData.total_amount || 0);
    } else {
      setCartItems([]);
      setTotalItems(0);
      setTotalAmount(0);
    }
  }, []);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const sessionId = getSessionForRequest();
      const response = await cartApi.getCart(sessionId);
      updateCartState(response.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  }, [getSessionForRequest, updateCartState]);

  const addToCart = useCallback(async (variantId, quantity = 1) => {
    if (!variantId) {
      showToast('Thiếu biến thể sản phẩm để thêm vào giỏ hàng', 'error');
      return false;
    }

    try {
      setLoading(true);
      const sessionId = getSessionForRequest();
      const response = await cartApi.addToCart({ variantId, quantity }, sessionId);
      updateCartState(response.data);
      showToast('Đã thêm sản phẩm vào giỏ hàng', 'success');
      return true;
    } catch (error) {
      const message = error.message || 'Không thể thêm sản phẩm vào giỏ hàng';
      showToast(message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [getSessionForRequest, updateCartState, showToast]);

  const updateQuantity = useCallback(async (cartItemId, quantity) => {
    try {
      const sessionId = getSessionForRequest();
      const response = await cartApi.updateCartItem(cartItemId, { quantity }, sessionId);
      updateCartState(response.data);
      return true;
    } catch (error) {
      const message = error.message || 'Không thể cập nhật số lượng';
      showToast(message, 'error');
      return false;
    }
  }, [getSessionForRequest, updateCartState, showToast]);

  const removeItem = useCallback(async (cartItemId) => {
    try {
      const sessionId = getSessionForRequest();
      const response = await cartApi.removeCartItem(cartItemId, sessionId);
      updateCartState(response.data);
      return true;
    } catch (error) {
      const message = error.message || 'Không thể xóa sản phẩm';
      showToast(message, 'error');
      return false;
    }
  }, [getSessionForRequest, updateCartState, showToast]);

  const clearCart = useCallback(async () => {
    try {
      const sessionId = getSessionForRequest();
      await cartApi.clearCart(sessionId);
      setCartItems([]);
      setTotalItems(0);
      setTotalAmount(0);
      return true;
    } catch {
      showToast('Không thể xóa giỏ hàng', 'error');
      return false;
    }
  }, [getSessionForRequest, showToast]);

  const mergeCart = useCallback(async () => {
    try {
      const sessionId = localStorage.getItem(SESSION_KEY);
      if (!sessionId) return;
      
      const response = await cartApi.mergeCart(sessionId);
      updateCartState(response.data);
      clearSessionId();
    } catch {
      console.error('Failed to merge cart');
    }
  }, [updateCartState]);

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Merge cart when user logs in
  useEffect(() => {
    if (isAuthenticated && !prevAuthRef.current) {
      // User just logged in — merge guest cart then fetch
      mergeCart().then(() => fetchCart());
    }
    if (!isAuthenticated && prevAuthRef.current) {
      // User just logged out — fetch guest cart
      fetchCart();
    }
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <CartContext.Provider value={{
      cartItems,
      totalItems,
      totalAmount,
      loading,
      fetchCart,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      mergeCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export default CartContext;
