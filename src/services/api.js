// Base API configuration
const API_BASE_URL = 'http://localhost:8080/api';

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  // Allow caller to skip Content-Type (e.g. for multipart/form-data)
  const headers = options._skipContentType
    ? { ...options.headers }
    : { 'Content-Type': 'application/json', ...options.headers };

  // Attach JWT token if available
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const { _skipContentType, ...restOptions } = options;
  const config = {
    headers,
    ...restOptions,
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

  // Get active brands only (falls back to list with large page)
  getActive: (pageNum = 0, pageSize = 200) => apiCall('/brands/list', {
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
  // Get all / search products (server-side filtering & pagination)
  // filters: { name, brandId, categoryId, materialId, status, pageNum, pageSize }
  getAll: (filters = {}) => {
    const { pageNum = 0, pageSize = 10, ...rest } = filters;
    return apiCall('/products/list', {
      method: 'POST',
      body: JSON.stringify({ pageNum, pageSize, ...rest }),
    });
  },

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

  // Get images for a single variant
  getByVariant: (variantId) => apiCall(`/product-images/variant/${variantId}`),

  // Upload image file for a variant (multipart/form-data)
  upload: (variantId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiCall(`/product-images/variant/${variantId}/upload`, {
      method: 'POST',
      body: formData,
      _skipContentType: true, // let browser set boundary
    });
  },

  // Delete an image by ID
  delete: (imageId) => apiCall(`/product-images/${imageId}`, { method: 'DELETE' }),

  // Set an image as primary
  setPrimary: (imageId) => apiCall(`/product-images/${imageId}/primary`, { method: 'PATCH' }),

  // Reorder images for a variant
  reorder: (variantId, imageIds) => apiCall(`/product-images/variant/${variantId}/reorder`, {
    method: 'PUT',
    body: JSON.stringify({ imageIds }),
  }),
};

// Coupon API functions
export const couponAPI = {
  // Get all coupons
  getAll: () => apiCall('/coupons'),

  // Get active coupons only
  getActive: () => apiCall('/coupons/active'),

  // Get available coupons for a specific order amount (with eligibility + calculated discount)
  getAvailable: (orderAmount = 0) => apiCall(`/coupons/available?orderAmount=${orderAmount}`),

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

  // ── Promotion Variants (products assigned to a promotion) ──

  // Get all variants assigned to a promotion
  getVariants: (promotionId) => apiCall(`/promotions/${promotionId}/variants`),

  // Add variants to a promotion (batch)
  addVariants: (promotionId, variants) => apiCall(`/promotions/${promotionId}/variants`, {
    method: 'POST',
    body: JSON.stringify(variants),
  }),

  // Replace all variants for a promotion
  replaceVariants: (promotionId, variants) => apiCall(`/promotions/${promotionId}/variants`, {
    method: 'PUT',
    body: JSON.stringify(variants),
  }),

  // Update a single promotion-variant entry (e.g. change fixedPrice)
  updateVariant: (promotionDetailId, data) => apiCall(`/promotions/variants/${promotionDetailId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  // Remove a variant from a promotion
  removeVariant: (promotionId, variantId) => apiCall(`/promotions/${promotionId}/variants/${variantId}`, {
    method: 'DELETE',
  }),

  // Remove all variants from a promotion
  removeAllVariants: (promotionId) => apiCall(`/promotions/${promotionId}/variants`, {
    method: 'DELETE',
  }),
};

// Customer API functions
export const customerAPI = {
  getAll: () => apiCall('/customers', { method: 'GET' }),
  getById: (id) => apiCall(`/customers/${id}`, { method: 'GET' }),
  create: (customer) => apiCall('/customers', { method: 'POST', body: JSON.stringify(customer) }),
  update: (id, customer) => apiCall(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(customer) }),
  delete: (id) => apiCall(`/customers/${id}`, { method: 'DELETE' }),
};

// Employee API functions
export const employeeAPI = {
  getAll: () => apiCall('/employees', { method: 'GET' }),
  getById: (id) => apiCall(`/employees/${id}`, { method: 'GET' }),
  create: (employee) => apiCall('/employees', { method: 'POST', body: JSON.stringify(employee) }),
  update: (id, employee) => apiCall(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(employee) }),
  delete: (id) => apiCall(`/employees/${id}`, { method: 'DELETE' }),
};

// Roles API functions
export const roleAPI = {
  getAll: () => apiCall('/roles', { method: 'GET' }),
  getById: (id) => apiCall(`/roles/${id}`, { method: 'GET' }),
};


// Analytics API functions
export const analyticsAPI = {
  // Sales analytics
  getSalesOverview: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.brandId) queryParams.append('brandId', params.brandId);
    if (params.categoryId) queryParams.append('categoryId', params.categoryId);
    return apiCall(`/analytics/sales/overview?${queryParams.toString()}`);
  },

  getRevenueByPeriod: (period = 'day', params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    return apiCall(`/analytics/sales/revenue/${period}?${queryParams.toString()}`);
  },

  getRevenueByBrand: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    return apiCall(`/analytics/sales/by-brand?${queryParams.toString()}`);
  },

  getRevenueByCategory: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    return apiCall(`/analytics/sales/by-category?${queryParams.toString()}`);
  },

  getRevenueBySize: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    return apiCall(`/analytics/sales/by-size?${queryParams.toString()}`);
  },

  getRevenueByColor: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    return apiCall(`/analytics/sales/by-color?${queryParams.toString()}`);
  },

  // Product analytics
  getProductPerformance: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.limit) queryParams.append('limit', params.limit);
    return apiCall(`/analytics/products/performance?${queryParams.toString()}`);
  },

  getBestSellingProducts: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    return apiCall(`/analytics/products/best-selling?${queryParams.toString()}`);
  },

  getWorstSellingProducts: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit);
    return apiCall(`/analytics/products/worst-selling?${queryParams.toString()}`);
  },

  getInventoryTurnover: () => apiCall('/analytics/products/inventory-turnover'),

  getLowStockProducts: (threshold = 10) => apiCall(`/analytics/products/low-stock?threshold=${threshold}`),

  getDeadStockProducts: (days = 60) => apiCall(`/analytics/products/dead-stock?days=${days}`),

  // Customer analytics
  getCustomerOverview: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    return apiCall(`/analytics/customers/overview?${queryParams.toString()}`);
  },

  getNewVsReturningCustomers: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    return apiCall(`/analytics/customers/new-vs-returning?${queryParams.toString()}`);
  },

  getCustomerPurchaseFrequency: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    return apiCall(`/analytics/customers/purchase-frequency?${queryParams.toString()}`);
  },

  getCustomerLifetimeValue: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit);
    return apiCall(`/analytics/customers/lifetime-value?${queryParams.toString()}`);
  },

  getGeographicDistribution: () => apiCall('/analytics/customers/geographic'),

  // Conversion funnel
  getConversionFunnel: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    return apiCall(`/analytics/conversion/funnel?${queryParams.toString()}`);
  },

  // Traffic analytics
  getHourlyTraffic: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.date) queryParams.append('date', params.date);
    return apiCall(`/analytics/traffic/hourly?${queryParams.toString()}`);
  },

  getWeeklyPattern: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    return apiCall(`/analytics/traffic/weekly?${queryParams.toString()}`);
  },

  // Forecast
  getSalesForecast: (days = 30) => apiCall(`/analytics/forecast/sales?days=${days}`),

  // KPI
  getKPIs: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    return apiCall(`/analytics/kpis?${queryParams.toString()}`);
  },

  // Comparison
  getComparison: (period = 'week') => apiCall(`/analytics/comparison/${period}`),

  // AI Insights
  getAIInsights: () => apiCall('/analytics/insights'),

  // Inventory health
  getInventoryHealth: () => apiCall('/analytics/inventory/health'),
};

// ============================================================
// Order API functions (Admin Order Management)
// ============================================================
export const orderAPI = {
  // Search/filter/sort orders with pagination
  search: (params) => apiCall('/admin/orders/list', {
    method: 'POST',
    body: JSON.stringify(params),
  }),

  // Get order detail by ID
  getById: (id) => apiCall(`/admin/orders/${id}`),

  // Create manual order
  create: (order) => apiCall('/admin/orders/create', {
    method: 'POST',
    body: JSON.stringify(order),
  }),

  // Update order status
  updateStatus: (id, data) => apiCall(`/admin/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  // Cancel a single order
  cancel: (id) => apiCall(`/admin/orders/${id}/cancel`, {
    method: 'PUT',
  }),

  // Bulk confirm orders
  bulkConfirm: (data) => apiCall('/admin/orders/bulk-confirm', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Bulk cancel orders
  bulkCancel: (data) => apiCall('/admin/orders/bulk-cancel', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Get KPI dashboard data
  getKpi: () => apiCall('/admin/orders/kpi'),

  // Export orders as CSV
  exportCsv: (params = {}) => apiCall('/admin/orders/export-csv', {
    method: 'POST',
    body: JSON.stringify(params),
  }),

  // Update shipping address (only when status = 'Chờ xác nhận')
  updateAddress: (id, data) => apiCall(`/admin/orders/${id}/address`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  // Update order item quantities / remove items (only when status = 'Chờ xác nhận')
  updateItems: (id, data) => apiCall(`/admin/orders/${id}/items`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  // Confirm payment for a non-COD order flagged as "Cần xác nhận thanh toán" (REM-04A)
  confirmPayment: (id) => apiCall(`/admin/orders/${id}/confirm-payment`, {
    method: 'PATCH',
  }),

  // Confirm refund has been processed for a cancelled/returned prepaid order
  confirmRefund: (id) => apiCall(`/admin/orders/${id}/confirm-refund`, {
    method: 'PATCH',
  }),
};


// ============================================================
// POS API functions (Bán hàng tại quầy)
// ============================================================
export const posAPI = {
  // Get products for POS browser (grouped by product with active variants)
  getProducts: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params.brandId) queryParams.append('brandId', params.brandId);
    const qs = queryParams.toString();
    return apiCall(`/admin/pos/products${qs ? `?${qs}` : ''}`);
  },

  // Quick search customers by name, phone, or email
  searchCustomers: (q = '') =>
    apiCall(`/admin/pos/customers/search?q=${encodeURIComponent(q)}`),

  // POS Checkout — create an in-store order with cash payment
  checkout: (request) => apiCall('/admin/pos/checkout', {
    method: 'POST',
    body: JSON.stringify(request),
  }),

  // Get recent POS (In-store) orders
  getRecentOrders: (limit = 10) =>
    apiCall(`/admin/pos/recent-orders?limit=${limit}`),

  // Validate a coupon code for POS
  validateCoupon: (code, orderAmount) => apiCall('/admin/pos/validate-coupon', {
    method: 'POST',
    body: JSON.stringify({ code, orderAmount }),
  }),

  // Quick-create a new customer from POS counter
  quickCreateCustomer: (data) => apiCall('/admin/pos/customers/quick-create', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};


// ============================================================
// Return API functions (Admin Return Management)
// ============================================================
export const returnAPI = {
  // Search/filter/sort returns with pagination
  search: (params) => apiCall('/admin/returns/list', {
    method: 'POST',
    body: JSON.stringify(params),
  }),

  // Get return detail by ID
  getById: (id) => apiCall(`/admin/returns/${id}`),

  // Create a new return request
  create: (data) => apiCall('/admin/returns/create', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Update return status
  updateStatus: (id, data) => apiCall(`/admin/returns/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  // Reject a return request
  reject: (id, data) => apiCall(`/admin/returns/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Bulk approve returns
  bulkApprove: (data) => apiCall('/admin/returns/bulk-approve', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Bulk reject returns
  bulkReject: (data) => apiCall('/admin/returns/bulk-reject', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Get KPI dashboard data
  getKpi: () => apiCall('/admin/returns/kpi'),

  // Export returns as CSV
  exportCsv: (params = {}) => apiCall('/admin/returns/export-csv', {
    method: 'POST',
    body: JSON.stringify(params),
  }),

  // Get deliverable orders (eligible for return)
  getDeliverableOrders: (search = '') => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiCall(`/admin/returns/deliverable-orders${qs}`);
  },
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
  customerAPI,
  employeeAPI,
  roleAPI,
  analyticsAPI,
  orderAPI,
  posAPI,
  returnAPI,
};
