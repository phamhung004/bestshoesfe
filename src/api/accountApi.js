import axiosClient from './axiosClient';

// ═══════════════════════════════════════════════════════════
// Account / Profile
// ═══════════════════════════════════════════════════════════

export const getProfile = () =>
    axiosClient.get('/account/me');

export const updateProfile = (data) =>
    axiosClient.put('/account/me', data);

export const changePassword = (data) =>
    axiosClient.put('/account/me/password', data);

// ═══════════════════════════════════════════════════════════
// Addresses
// ═══════════════════════════════════════════════════════════

export const getMyAddresses = () =>
    axiosClient.get('/addresses/my-addresses');

export const createAddress = (data) =>
    axiosClient.post('/addresses', data);

export const updateAddress = (id, data) =>
    axiosClient.put(`/addresses/${id}`, data);

export const deleteAddress = (id) =>
    axiosClient.delete(`/addresses/${id}`);

export const setDefaultAddress = (id) =>
    axiosClient.put(`/addresses/${id}/set-default`);

// ═══════════════════════════════════════════════════════════
// Orders
// ═══════════════════════════════════════════════════════════

export const getMyOrders = () =>
    axiosClient.get('/orders/my-orders');

export const getOrderDetail = (orderNumber) =>
    axiosClient.get(`/orders/${orderNumber}`);

export const cancelOrder = (orderNumber) =>
    axiosClient.put(`/orders/${orderNumber}/cancel`);

export const updateShippingAddress = (orderNumber, data) =>
    axiosClient.patch(`/orders/${orderNumber}/shipping-address`, data);

// ═══════════════════════════════════════════════════════════
// Reviews
// ═══════════════════════════════════════════════════════════

export const getMyReviews = () =>
    axiosClient.get('/reviews/my-reviews');

export const getPendingReviews = () =>
    axiosClient.get('/reviews/pending');

export const createReview = (data) =>
    axiosClient.post('/reviews', data);

export const updateReview = (id, data) =>
    axiosClient.put(`/reviews/${id}`, data);

export const deleteReview = (id) =>
    axiosClient.delete(`/reviews/${id}`);
