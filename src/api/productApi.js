import axiosClient from './axiosClient';

/**
 * Product API functions — all communicate with /api/v1/products
 */
export const productApi = {

  /**
   * GET /products — paginated catalog list with optional filters
   * @param {Object} params - ProductFilterParams
   */
  getProducts: (params) =>
    axiosClient.get('/products', { params }),

  /**
   * GET /products/:id — full product detail
   * @param {number} productId
   */
  getProductDetail: (productId) =>
    axiosClient.get(`/products/${productId}`),

  /**
   * GET /products/:id/related?limit=8 — related products
   * @param {number} productId
   * @param {number} limit
   */
  getRelatedProducts: (productId, limit = 8) =>
    axiosClient.get(`/products/${productId}/related`, { params: { limit } }),

  /**
   * GET /products/filter-options — sidebar filter data
   */
  getFilterOptions: () =>
    axiosClient.get('/products/filter-options'),

  /**
   * POST /products/stock-check — check stock for variant IDs
   * @param {number[]} variantIds
   */
  checkStock: (variantIds) =>
    axiosClient.post('/products/stock-check', { variantIds }),
};
