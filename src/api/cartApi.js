import axiosClient from './axiosClient';

const getSessionHeaders = (sessionId) => {
  const headers = {};
  if (sessionId) {
    headers['X-Session-Id'] = sessionId;
  }
  return headers;
};

export const cartApi = {
  getCart: (sessionId) =>
    axiosClient.get('/cart', { headers: getSessionHeaders(sessionId) }),

  addToCart: (data, sessionId) =>
    axiosClient.post('/cart/items', data, { headers: getSessionHeaders(sessionId) }),

  updateCartItem: (cartItemId, data, sessionId) =>
    axiosClient.put(`/cart/items/${cartItemId}`, data, { headers: getSessionHeaders(sessionId) }),

  removeCartItem: (cartItemId, sessionId) =>
    axiosClient.delete(`/cart/items/${cartItemId}`, { headers: getSessionHeaders(sessionId) }),

  mergeCart: (sessionId) =>
    axiosClient.post('/cart/merge', { sessionId }),

  clearCart: (sessionId) =>
    axiosClient.delete('/cart', { headers: getSessionHeaders(sessionId) }),
};
