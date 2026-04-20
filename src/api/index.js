import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_URL || 'https://kct-fitness-production.up.railway.app';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kct_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Unwrap response data; handle 401 globally
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('kct_token');
      localStorage.removeItem('kct_user');
      window.location.href = '/login';
    }
    return Promise.reject(err.response?.data || err);
  }
);

export default api;
