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
      throw new Error(`HTTP error! status: ${response.status}`);
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
  getAll: () => apiCall('/brands'),

  // Get active brands only
  getActive: () => apiCall('/brands/active'),

  // Get brand by ID
  getById: (id) => apiCall(`/brands/${id}`),

  // Get brand by slug
  getBySlug: (slug) => apiCall(`/brands/slug/${slug}`),

  // Search brands by name
  search: (name) => apiCall(`/brands/search?name=${encodeURIComponent(name)}`),

  // Create new brand
  create: (brand) => apiCall('/brands', {
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
  getAll: () => apiCall('/categories'),
  getById: (id) => apiCall(`/categories/${id}`),
  create: (category) => apiCall('/categories', {
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
  getAll: () => apiCall('/materials'),
  getById: (id) => apiCall(`/materials/${id}`),
  create: (material) => apiCall('/materials', {
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
  getAll: () => apiCall('/sizes'),
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
  getAll: () => apiCall('/colors'),
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

export default {
  brandAPI,
  categoryAPI,
  materialAPI,
  sizeAPI,
  colorAPI,
};
