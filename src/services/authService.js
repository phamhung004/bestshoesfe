import axiosClient from '../api/axiosClient';

export const authService = {
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  register: (data) => axiosClient.post('/auth/register', data),
};
