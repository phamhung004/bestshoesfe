// ═══════════════════════════════════════════════════════════
// Account Management API (Admin)
// Base: /api/admin/accounts
// ═══════════════════════════════════════════════════════════

const API_BASE_URL = 'http://localhost:8080/api';

const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = { headers, ...options };

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorData = {};
    try {
      errorData = await response.json();
    } catch (_) { /* ignore */ }

    const error = new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    error.status = response.status;
    error.response = { status: response.status, data: errorData };
    throw error;
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null;
  }

  return await response.json();
};

// ── Customer API ────────────────────────────────────────────
export const adminCustomerAPI = {
  /**
   * Danh sách khách hàng (server-side search/filter/sort/paging).
   * @param {Object} params - { search, status, tier, time, sort, pageNum, pageSize }
   */
  list: (params = {}) =>
    apiCall('/admin/accounts/customers/list', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  /** Chi tiết khách hàng (kèm addresses). */
  getById: (customerId) =>
    apiCall(`/admin/accounts/customers/${customerId}`),

  /** Thêm khách hàng. */
  create: (data) =>
    apiCall('/admin/accounts/customers/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** Cập nhật khách hàng. */
  update: (customerId, data) =>
    apiCall(`/admin/accounts/customers/${customerId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /** Khóa tài khoản. */
  lock: (customerId, reason) =>
    apiCall(`/admin/accounts/customers/${customerId}/lock`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    }),

  /** Mở khóa tài khoản. */
  unlock: (customerId) =>
    apiCall(`/admin/accounts/customers/${customerId}/unlock`, {
      method: 'PUT',
    }),

  /** Đặt lại mật khẩu. */
  resetPassword: (customerId) =>
    apiCall(`/admin/accounts/customers/${customerId}/reset-password`, {
      method: 'POST',
    }),

  /** KPI tổng quan. */
  getKpis: () =>
    apiCall('/admin/accounts/customers/kpi'),
};

// ── Employee API ────────────────────────────────────────────
export const adminEmployeeAPI = {
  /**
   * Danh sách nhân viên (server-side search/filter/paging).
   * @param {Object} params - { search, role, status, pageNum, pageSize }
   */
  list: (params = {}) =>
    apiCall('/admin/accounts/employees/list', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  /** Chi tiết nhân viên. */
  getById: (employeeId) =>
    apiCall(`/admin/accounts/employees/${employeeId}`),

  /** Thêm nhân viên. */
  create: (data) =>
    apiCall('/admin/accounts/employees/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** Cập nhật nhân viên. */
  update: (employeeId, data) =>
    apiCall(`/admin/accounts/employees/${employeeId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /** Khóa tài khoản. */
  lock: (employeeId, reason) =>
    apiCall(`/admin/accounts/employees/${employeeId}/lock`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    }),

  /** Mở khóa tài khoản. */
  unlock: (employeeId) =>
    apiCall(`/admin/accounts/employees/${employeeId}/unlock`, {
      method: 'PUT',
    }),

  /** Xóa nhân viên. */
  delete: (employeeId) =>
    apiCall(`/admin/accounts/employees/${employeeId}`, {
      method: 'DELETE',
    }),

  /** Đổi vai trò. */
  changeRole: (employeeId, roleId) =>
    apiCall(`/admin/accounts/employees/${employeeId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ roleId }),
    }),

  /** Đặt lại mật khẩu. */
  resetPassword: (employeeId) =>
    apiCall(`/admin/accounts/employees/${employeeId}/reset-password`, {
      method: 'POST',
    }),

  /** KPI tổng quan. */
  getKpis: () =>
    apiCall('/admin/accounts/employees/kpi'),
};

// ── Role API ────────────────────────────────────────────────
export const adminRoleAPI = {
  /** Danh sách roles (cho dropdown). */
  list: () => apiCall('/admin/accounts/roles'),
};
