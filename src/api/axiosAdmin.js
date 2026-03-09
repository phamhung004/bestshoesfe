import axios from 'axios';

/**
 * Axios instance for admin/legacy API endpoints (baseURL: /api — no /v1 prefix).
 * Used for brands, categories, promotions, and other endpoints under /api.
 */
const axiosAdmin = axios.create({
  baseURL: import.meta.env.VITE_API_ADMIN_URL ?? 'http://localhost:8080/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach Authorization header if token exists
axiosAdmin.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (import.meta.env.DEV) {
      console.log(`[API-Admin] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.params ?? '');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: unwrap data and handle errors
axiosAdmin.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (!error.response) {
      const netError = new Error('Không có kết nối mạng. Kiểm tra internet.');
      netError.type = 'NetworkError';
      return Promise.reject(netError);
    }

    const { status } = error.response;

    if (status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(new Error('Phiên đăng nhập hết hạn.'));
    }

    if (status === 403) {
      const forbiddenError = new Error(
        error.response.data?.message ?? 'Bạn không có quyền thực hiện hành động này.'
      );
      forbiddenError.type = 'ForbiddenError';
      forbiddenError.status = 403;
      return Promise.reject(forbiddenError);
    }

    if (status === 404) {
      const notFoundError = new Error(
        error.response.data?.message ?? 'Không tìm thấy dữ liệu.'
      );
      notFoundError.type = 'NotFoundError';
      notFoundError.status = 404;
      return Promise.reject(notFoundError);
    }

    if (status >= 500) {
      const serverError = new Error(
        error.response.data?.message ?? 'Lỗi hệ thống. Vui lòng thử lại sau.'
      );
      serverError.type = 'ServerError';
      serverError.status = status;
      return Promise.reject(serverError);
    }

    return Promise.reject(
      new Error(error.response.data?.message ?? 'Đã xảy ra lỗi.')
    );
  }
);

export default axiosAdmin;
