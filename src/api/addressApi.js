import axiosClient from './axiosClient';

export const addressApi = {
  /**
   * Get current customer's saved addresses (via JWT)
   */
  getMyAddresses: () => axiosClient.get('/addresses/my-addresses'),
};
