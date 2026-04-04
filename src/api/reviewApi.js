import axiosClient from './axiosClient';
import axiosAdmin from './axiosAdmin';

// ═══════════════════════════════════════════════════════════
// Public — Product reviews (no auth required)
// ═══════════════════════════════════════════════════════════

export const getProductReviews = (productId, page = 0, size = 10) =>
    axiosClient.get(`/reviews/product/${productId}`, { params: { page, size } });

// ═══════════════════════════════════════════════════════════
// Admin — Review management
// ═══════════════════════════════════════════════════════════

export const getAdminReviews = (params) =>
    axiosAdmin.get('/admin/reviews', { params });

export const replyToReview = (id, reply) =>
    axiosAdmin.put(`/admin/reviews/${id}/reply`, { reply });

export const adminDeleteReview = (id) =>
    axiosAdmin.delete(`/admin/reviews/${id}`);
