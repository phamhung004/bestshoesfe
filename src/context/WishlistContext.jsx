import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { wishlistApi } from '../api/wishlistApi';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const prevAuthRef = useRef(isAuthenticated);
  const navigate = useNavigate();

  const fetchWishlistIds = useCallback(async () => {
    try {
      setLoading(true);
      const response = await wishlistApi.getWishlistIds();
      const ids = response.data ?? [];
      setWishlistIds(new Set(ids.map(Number)));
    } catch {
      setWishlistIds(new Set());
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount if authenticated; clear on logout
  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlistIds();
    } else {
      setWishlistIds(new Set());
    }
  }, [isAuthenticated, fetchWishlistIds]);

  // Also re-fetch when transitioning from unauthenticated → authenticated
  useEffect(() => {
    if (!prevAuthRef.current && isAuthenticated) {
      fetchWishlistIds();
    }
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated, fetchWishlistIds]);

  const toggleWishlist = useCallback(async (productId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const numId = Number(productId);
    const isWished = wishlistIds.has(numId);

    // Optimistic update
    setWishlistIds(prev => {
      const next = new Set(prev);
      if (isWished) next.delete(numId);
      else next.add(numId);
      return next;
    });

    try {
      if (isWished) {
        await wishlistApi.removeFromWishlist(productId);
      } else {
        await wishlistApi.addToWishlist(productId);
      }
    } catch {
      // Revert on error
      setWishlistIds(prev => {
        const next = new Set(prev);
        if (isWished) next.add(numId);
        else next.delete(numId);
        return next;
      });
    }
  }, [isAuthenticated, wishlistIds, navigate]);

  const isWished = useCallback((productId) => wishlistIds.has(Number(productId)), [wishlistIds]);

  const wishlistArray = Array.from(wishlistIds);

  return (
    <WishlistContext.Provider value={{ wishlistIds, wishlistArray, loading, toggleWishlist, isWished, fetchWishlistIds }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
