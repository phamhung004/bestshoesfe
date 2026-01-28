// Base API configuration
const API_BASE_URL = 'http://localhost:8080/api';

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (e) {
        // If response body is not JSON, just use status
      }
      
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.response = {
        status: response.status,
        data: errorData
      };
      throw error;
    }

    // For DELETE requests, don't try to parse JSON if no content
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Brand API functions
export const brandAPI = {
  // Get all brands
  getAll: (pageNum = 0, pageSize = 10) => apiCall('/brands/list', { 
    method: 'POST',
    body: JSON.stringify({ pageNum, pageSize })
  }),

  // Get active brands only
  getActive: (pageNum = 0, pageSize = 10) => apiCall('/brands/active', { 
    method: 'POST',
    body: JSON.stringify({ pageNum, pageSize })
  }),

  // Get brand by ID
  getById: (id) => apiCall(`/brands/${id}`),

  // Get brand by slug
  getBySlug: (slug) => apiCall(`/brands/slug/${slug}`),

  // Search brands by name
  search: (name) => apiCall(`/brands/search?name=${encodeURIComponent(name)}`),

  // Create new brand
  create: (brand) => apiCall('/brands/create', {
    method: 'POST',
    body: JSON.stringify(brand),
  }),

  // Update brand
  update: (id, brand) => apiCall(`/brands/${id}`, {
    method: 'PUT',
    body: JSON.stringify(brand),
  }),

  // Delete brand
  delete: (id) => apiCall(`/brands/${id}`, {
    method: 'DELETE',
  }),

  // Toggle brand status
  toggleStatus: (id) => apiCall(`/brands/${id}/toggle-status`, {
    method: 'PATCH',
  }),
};

// Category API functions
export const categoryAPI = {
  getAll: (pageNum = 0, pageSize = 10) => apiCall('/categories/list', { 
    method: 'POST',
    body: JSON.stringify({ pageNum, pageSize })
  }),
  getById: (id) => apiCall(`/categories/${id}`),
  create: (category) => apiCall('/categories/create', {
    method: 'POST',
    body: JSON.stringify(category),
  }),
  update: (id, category) => apiCall(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(category),
  }),
  delete: (id) => apiCall(`/categories/${id}`, { method: 'DELETE' }),
  toggleStatus: (id) => apiCall(`/categories/${id}/toggle-status`, { method: 'PATCH' }),
  search: (name) => apiCall(`/categories/search?name=${encodeURIComponent(name)}`),
};

// Material API functions
export const materialAPI = {
  getAll: (pageNum = 0, pageSize = 10) => apiCall('/materials/list', { 
    method: 'POST',
    body: JSON.stringify({ pageNum, pageSize })
  }),
  getById: (id) => apiCall(`/materials/${id}`),
  create: (material) => apiCall('/materials/create', {
    method: 'POST',
    body: JSON.stringify(material),
  }),
  update: (id, material) => apiCall(`/materials/${id}`, {
    method: 'PUT',
    body: JSON.stringify(material),
  }),
  delete: (id) => apiCall(`/materials/${id}`, { method: 'DELETE' }),
  toggleStatus: (id) => apiCall(`/materials/${id}/toggle-status`, { method: 'PATCH' }),
};

// Size API functions
export const sizeAPI = {
  getAll: (pageNum = 0, pageSize = 10) => apiCall('/sizes/list', { 
    method: 'POST',
    body: JSON.stringify({ pageNum, pageSize })
  }),
  getById: (id) => apiCall(`/sizes/${id}`),
  create: (size) => apiCall('/sizes', {
    method: 'POST',
    body: JSON.stringify(size),
  }),
  update: (id, size) => apiCall(`/sizes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(size),
  }),
  delete: (id) => apiCall(`/sizes/${id}`, { method: 'DELETE' }),
  toggleStatus: (id) => apiCall(`/sizes/${id}/toggle-status`, { method: 'PATCH' }),
};

// Color API functions
export const colorAPI = {
  getAll: (pageNum = 0, pageSize = 10) => apiCall('/colors/list', { 
    method: 'POST',
    body: JSON.stringify({ pageNum, pageSize })
  }),
  getById: (id) => apiCall(`/colors/${id}`),
  create: (color) => apiCall('/colors', {
    method: 'POST',
    body: JSON.stringify(color),
  }),
  update: (id, color) => apiCall(`/colors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(color),
  }),
  delete: (id) => apiCall(`/colors/${id}`, { method: 'DELETE' }),
  toggleStatus: (id) => apiCall(`/colors/${id}/toggle-status`, { method: 'PATCH' }),
};

// Product API functions
export const productAPI = {
  // Get all products
  getAll: (pageNum = 0, pageSize = 10) => apiCall('/products/list', { 
    method: 'POST',
    body: JSON.stringify({ pageNum, pageSize })
  }),

  // Get active products only
  getActive: (pageNum = 0, pageSize = 10) => apiCall('/products/active', { 
    method: 'POST',
    body: JSON.stringify({ pageNum, pageSize })
  }),

  // Get active products with all details loaded
  getActiveWithDetails: (pageNum = 0, pageSize = 10) => apiCall('/products/active/details', { 
    method: 'POST',
    body: JSON.stringify({ pageNum, pageSize })
  }),

  // Get product by ID
  getById: (id) => apiCall(`/products/${id}`, { method: 'GET' }),

  // Get products by category
  getByCategory: (categoryId) => apiCall(`/products/category/${categoryId}`),

  // Get products by brand
  getByBrand: (brandId) => apiCall(`/products/brand/${brandId}`),

  // Search products by name
  search: (name) => apiCall(`/products/search?name=${encodeURIComponent(name)}`),

  // Get products by filters
  getByFilters: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.brandId) params.append('brandId', filters.brandId);
    if (filters.materialId) params.append('materialId', filters.materialId);
    return apiCall(`/products/filter?${params.toString()}`);
  },

  // Create new product
  create: (product) => apiCall('/products/create', {
    method: 'POST',
    body: JSON.stringify(product),
  }),

  // Update product
  update: (id, product) => apiCall(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  }),

  // Delete product
  delete: (id) => apiCall(`/products/${id}`, { method: 'DELETE' }),

  // Toggle product status
  toggleStatus: (id) => apiCall(`/products/${id}/toggle-status`, { method: 'PATCH' }),
};

// Product Variant API functions
export const productVariantAPI = {
  // Get all product variants
  getAll: () => apiCall('/product-variants'),

  // Get active product variants only
  getActive: () => apiCall('/product-variants/active'),

  // Get active product variants with all product details for catalog display
  getActiveWithDetails: () => apiCall('/product-variants/active/details'),

  // Get product variant by ID
  getById: (id) => apiCall(`/product-variants/${id}`),

  // Get variants by product
  getByProduct: (productId) => apiCall(`/product-variants/product/${productId}`),

  // Get variants by product with details
  getByProductWithDetails: (productId) => apiCall(`/product-variants/product/${productId}/details`),

  // Get variants by size
  getBySize: (sizeId) => apiCall(`/product-variants/size/${sizeId}`),

  // Get variants by color
  getByColor: (colorId) => apiCall(`/product-variants/color/${colorId}`),

  // Get variants by filters (for catalog filtering)
  getByFilters: (filters = {}) => {
    const params = new URLSearchParams();
    const appendArrayParam = (key, value) => {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, v));
      } else if (value !== undefined && value !== null) {
        params.append(key, value);
      }
    };

    appendArrayParam('categoryId', filters.categoryId);
    appendArrayParam('brandId', filters.brandId);
    appendArrayParam('materialId', filters.materialId);
    appendArrayParam('sizeId', filters.sizeId);
    appendArrayParam('colorId', filters.colorId);

    const query = params.toString();
    return apiCall(`/product-variants/filter${query ? `?${query}` : ''}`);
  },

  // Create new product variant
  create: (variant) => apiCall('/product-variants', {
    method: 'POST',
    body: JSON.stringify(variant),
  }),

  // Update product variant
  update: (id, variant) => apiCall(`/product-variants/${id}`, {
    method: 'PUT',
    body: JSON.stringify(variant),
  }),

  // Delete product variant
  delete: (id) => apiCall(`/product-variants/${id}`, { method: 'DELETE' }),

  // Toggle product variant status
  toggleStatus: (id) => apiCall(`/product-variants/${id}/toggle-status`, { method: 'PATCH' }),
};

// Product Image API functions
export const productImageAPI = {
  // Get images for multiple variant IDs (comma separated list)
  getByVariantIds: (variantIds = []) => {
    if (!Array.isArray(variantIds) || variantIds.length === 0) return Promise.resolve([]);
    const idsParam = variantIds.join(',');
    return apiCall(`/product-images/variants?variantIds=${encodeURIComponent(idsParam)}`);
  },
};

// Coupon API functions
export const couponAPI = {
  // Get all coupons
  getAll: () => apiCall('/coupons'),

  // Get active coupons only
  getActive: () => apiCall('/coupons/active'),

  // Get coupon by ID
  getById: (id) => apiCall(`/coupons/${id}`),

  // Get coupon by code
  getByCode: (code) => apiCall(`/coupons/code/${encodeURIComponent(code)}`),

  // Search coupons
  search: (query) => apiCall(`/coupons/search?q=${encodeURIComponent(query)}`),

  // Create new coupon
  create: (coupon) => apiCall('/coupons', {
    method: 'POST',
    body: JSON.stringify(coupon),
  }),

  // Update coupon
  update: (id, coupon) => apiCall(`/coupons/${id}`, {
    method: 'PUT',
    body: JSON.stringify(coupon),
  }),

  // Delete coupon
  delete: (id) => apiCall(`/coupons/${id}`, {
    method: 'DELETE',
  }),

  // Toggle coupon status
  toggleStatus: (id) => apiCall(`/coupons/${id}/toggle-status`, {
    method: 'PATCH',
  }),

  // Validate coupon
  validate: (code, customerId = null) => {
    const params = new URLSearchParams();
    if (customerId) params.append('customerId', customerId);
    return apiCall(`/coupons/validate/${encodeURIComponent(code)}?${params.toString()}`);
  },
};

// Promotion API functions
export const promotionAPI = {
  // Get all promotions
  getAll: () => apiCall('/promotions'),

  // Get active promotions only
  getActive: () => apiCall('/promotions/active'),

  // Get promotion by ID
  getById: (id) => apiCall(`/promotions/${id}`),

  // Search promotions
  search: (query) => apiCall(`/promotions/search?q=${encodeURIComponent(query)}`),

  // Get promotions by type
  getByType: (type) => apiCall(`/promotions/type/${encodeURIComponent(type)}`),

  // Get expired promotions
  getExpired: () => apiCall('/promotions/expired'),

  // Get upcoming promotions
  getUpcoming: () => apiCall('/promotions/upcoming'),

  // Get currently running promotions
  getCurrentlyRunning: () => apiCall('/promotions/currently-running'),

  // Get promotions expiring soon
  getExpiringSoon: (days = 7) => apiCall(`/promotions/expiring-soon?days=${days}`),

  // Get promotion status
  getStatus: (id) => apiCall(`/promotions/${id}/status`),

  // Validate promotion
  validate: (id) => apiCall(`/promotions/${id}/validate`),

  // Calculate discount
  calculateDiscount: (id, originalPrice) =>
    apiCall(`/promotions/${id}/calculate-discount?originalPrice=${encodeURIComponent(originalPrice)}`),

  // Create new promotion
  create: (promotion) => apiCall('/promotions', {
    method: 'POST',
    body: JSON.stringify(promotion),
  }),

  // Update promotion
  update: (id, promotion) => apiCall(`/promotions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(promotion),
  }),

  // Delete promotion
  delete: (id) => apiCall(`/promotions/${id}`, {
    method: 'DELETE',
  }),

  // Toggle promotion status
  toggleStatus: (id) => apiCall(`/promotions/${id}/toggle-status`, {
    method: 'PATCH',
  }),

  // Activate promotion
  activate: (id) => apiCall(`/promotions/${id}/activate`, {
    method: 'PATCH',
  }),

  // Deactivate promotion
  deactivate: (id) => apiCall(`/promotions/${id}/deactivate`, {
    method: 'PATCH',
  }),
};

export default {
  brandAPI,
  categoryAPI,
  materialAPI,
  sizeAPI,
  colorAPI,
  productAPI,
  productVariantAPI,
  productImageAPI,
  couponAPI,
  promotionAPI,
};
