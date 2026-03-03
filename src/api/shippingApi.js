import axiosClient from './axiosClient';

/**
 * Shipping API — proxied through backend to GHN (Giao Hàng Nhanh).
 * All address data (provinces, districts, wards) comes from GHN master data
 * to ensure IDs are compatible with GHN fee calculation.
 */
export const shippingApi = {
    /**
     * Get all provinces
     * @returns {Promise} { data: [{ provinceId, provinceName, code }] }
     */
    getProvinces: () => axiosClient.get('/shipping/provinces'),

    /**
     * Get districts for a province
     * @param {number} provinceId - GHN ProvinceID
     * @returns {Promise} { data: [{ districtId, districtName, provinceId, code }] }
     */
    getDistricts: (provinceId) => axiosClient.get(`/shipping/districts?provinceId=${provinceId}`),

    /**
     * Get wards for a district
     * @param {number} districtId - GHN DistrictID
     * @returns {Promise} { data: [{ wardCode, wardName, districtId }] }
     */
    getWards: (districtId) => axiosClient.get(`/shipping/wards?districtId=${districtId}`),

    /**
     * Calculate shipping fee
     * @param {Object} data - { toDistrictId, toWardCode, weight?, serviceTypeId? }
     * @returns {Promise} { data: { total, serviceFee, insuranceFee, couponValue, expectedDeliveryTime } }
     */
    calculateFee: (data) => axiosClient.post('/shipping/calculate-fee', data),
};
