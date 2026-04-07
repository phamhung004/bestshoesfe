import axiosClient from './axiosClient';

export const wishlistApi = {
  getWishlist: () =>
    axiosClient.get('/wishlist'),

  getWishlistIds: () =>
    axiosClient.get('/wishlist/ids'),

  addToWishlist: (productId) =>
    axiosClient.post(`/wishlist/${productId}`),

  removeFromWishlist: (productId) =>
    axiosClient.delete(`/wishlist/${productId}`),
};
