import axiosClient from './axiosClient';

export const couponApi = {
  /**
   * Validate coupon code and get discount info
   * @param {string} code - Coupon code
   * @param {number} orderAmount - Current subtotal to calculate discount
   */
  validate: (code, orderAmount = 0) =>
    axiosClient.get(`/coupons/validate/${encodeURIComponent(code)}`, {
      params: { orderAmount },
    }),

  /**
   * Get available coupons for a given order amount
   * Returns eligible + "almost there" coupons with calculated discounts
   * @param {number} orderAmount - Current cart subtotal
   */
  getAvailable: (orderAmount = 0) =>
    axiosClient.get('/coupons/available', {
      params: { orderAmount },
    }),

  /**
   * Revalidate a voucher right before checkout (stale-check)
   * @param {Object} payload - { code, orderAmount, clientDiscountAmount, clientFinalAmount, guestEmail, guestPhone, flow }
   */
  revalidate: (payload) =>
    axiosClient.post('/coupons/revalidate', payload),
};
