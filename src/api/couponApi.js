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
};
