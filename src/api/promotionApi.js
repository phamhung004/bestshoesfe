import axiosAdmin from './axiosAdmin';

/**
 * Promotion API — communicates with /api/promotions
 * Note: PromotionController returns raw entities in ResponseEntity (not wrapped in ApiResponse).
 */
export const promotionApi = {
  /**
   * GET /promotions — get all promotions
   */
  getAll: () =>
    axiosAdmin.get('/promotions'),

  /**
   * GET /promotions/active — active promotions
   */
  getActive: () =>
    axiosAdmin.get('/promotions/active'),

  /**
   * GET /promotions/currently-running — currently running promotions
   */
  getCurrentlyRunning: () =>
    axiosAdmin.get('/promotions/currently-running'),

  /**
   * GET /promotions/:id — get promotion by ID
   */
  getById: (id) =>
    axiosAdmin.get(`/promotions/${id}`),
};
