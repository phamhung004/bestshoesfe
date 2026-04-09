import axiosClient from './axiosClient';

export const orderApi = {
  /**
   * Customer checkout — create order from cart
   * Supports both logged-in users and guest checkout.
   * @param {Object} data - CheckoutRequest fields
   * @param {string|null} sessionId - Session ID for guest (null for logged-in user)
   */
  checkout: (data, sessionId = null) => {
    const config = {};
    if (sessionId) {
      config.headers = { 'X-Session-Id': sessionId };
    }
    return axiosClient.post('/orders/checkout', data, config);
  },

  /**
   * Get current customer's order history
   */
  getMyOrders: () => axiosClient.get('/orders/my-orders'),

  /**
   * Get order detail by order number
   * @param {string} orderNumber
   */
  getOrderByNumber: (orderNumber) => axiosClient.get(`/orders/${orderNumber}`),

  /**
   * Public order tracking — no auth required.
   * Guest provides order number + phone for verification.
   * @param {string} orderNumber
   * @param {string} phone
   */
  trackOrder: (orderNumber, phone) =>
    axiosClient.get('/orders/track', { params: { orderNumber, phone } }),

  /**
   * Cancel an order (only if status = "Chờ xác nhận")
   * @param {string} orderNumber
   */
  cancelOrder: (orderNumber) =>
    axiosClient.put(`/orders/${orderNumber}/cancel`),
};
