import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response handling for auth/payment
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      // token invalid/expired
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    if (status === 402) {
      // payment required – send to upgrade flow
      if (window.location.pathname !== '/upgrade') {
        window.location.href = '/upgrade';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
