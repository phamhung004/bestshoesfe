import axiosClient from './axiosClient';

export const orderApi = {
  /**
   * Customer checkout — create order from cart
   * @param {Object} data - CheckoutRequest fields
   */
  checkout: (data) => axiosClient.post('/orders/checkout', data),

  /**
   * Get current customer's order history
   */
  getMyOrders: () => axiosClient.get('/orders/my-orders'),

  /**
   * Get order detail by order number
   * @param {string} orderNumber
   */
  getOrderByNumber: (orderNumber) => axiosClient.get(`/orders/${orderNumber}`),
};
