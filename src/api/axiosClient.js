import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach Authorization header if token exists
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.params ?? '');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: unwrap data and handle errors
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (!error.response) {
      // Network error
      const netError = new Error('Không có kết nối mạng. Kiểm tra internet.');
      netError.type = 'NetworkError';
      return Promise.reject(netError);
    }

    const { status } = error.response;

    if (status === 401) {
      // Don't redirect if the failing request is itself an auth endpoint (login/register)
      if (!error.config?.url?.includes('/auth/')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(
        new Error(error.response.data?.message ?? 'Phiên đăng nhập hết hạn.')
      );
    }

    if (status === 404) {
      const notFoundError = new Error(
        error.response.data?.message ?? 'Không tìm thấy dữ liệu.'
      );
      notFoundError.type = 'NotFoundError';
      notFoundError.status = 404;
      return Promise.reject(notFoundError);
    }

    if (status === 409) {
      const conflictError = new Error(
        error.response.data?.message ?? 'Dữ liệu xung đột.'
      );
      conflictError.type = 'ConflictError';
      conflictError.status = 409;
      conflictError.data = error.response.data?.data ?? null;
      return Promise.reject(conflictError);
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

export default axiosClient;
