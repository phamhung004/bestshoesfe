import axiosAdmin from './axiosAdmin';

/**
 * Brand API — communicates with /api/brands
 */
export const brandApi = {
  /**
   * POST /brands/list — get all brands (paginated)
   * Response shape: ApiResponse { status, message, data: Brand[] }
   */
  getAll: (params = {}) =>
    axiosAdmin.post('/brands/list', {
      page: 0,
      size: 200,
      ...params,
    }),

  /**
   * GET /brands/:id — get brand by ID
   */
  getById: (brandId) =>
    axiosAdmin.get(`/brands/${brandId}`),
};
