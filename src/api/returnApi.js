import axiosClient from './axiosClient';

// ═══════════════════════════════════════════════════════════
// Customer Return API
// ═══════════════════════════════════════════════════════════

/**
 * Upload evidence images for a return request.
 * @param {FormData} formData - FormData with key "files"
 * @returns {Promise} - { data: string[] } list of Cloudinary URLs
 */
export const uploadReturnImages = (formData) =>
    axiosClient.post('/returns/upload-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

/**
 * Create a new customer return request.
 * @param {Object} data - { orderNumber, items, returnReason, description, imageUrls }
 */
export const createReturnRequest = (data) =>
    axiosClient.post('/returns', data);

/**
 * Get all return requests for the authenticated customer.
 */
export const getMyReturns = () =>
    axiosClient.get('/returns/my-returns');

/**
 * Get detail of a single return request by its return code.
 * @param {string} returnCode
 */
export const getReturnDetail = (returnCode) =>
    axiosClient.get(`/returns/${returnCode}`);
