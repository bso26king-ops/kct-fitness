import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 30000,
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API methods
export const authAPI = {
  login: (email, password) => api.post('/admin/auth/login', { email, password }),
  logout: () => api.post('/admin/auth/logout'),
  getMe: () => api.get('/admin/auth/me'),
};

export const exerciseAPI = {
  getAll: () => api.get('/exercises'),
  create: (data) => api.post('/exercises', data),
  update: (id, data) => api.patch(`/exercises/${id}`, data),
  delete: (id) => api.delete(`/exercises/${id}`),
};

export const workoutAPI = {
  getAll: () => api.get('/workouts'),
  create: (data) => api.post('/workouts', data),
  update: (id, data) => api.patch(`/workouts/${id}`, data),
  delete: (id) => api.delete(`/workouts/${id}`),
};

export const challengeAPI = {
  getAll: () => api.get('/challenges'),
  create: (data) => api.post('/challenges', data),
  update: (id, data) => api.patch(`/challenges/${id}`, data),
  delete: (id) => api.delete(`/challenges/${id}`),
};

export const groupAPI = {
  getAll: () => api.get('/groups'),
  getById: (id) => api.get(`/groups/${id}`),
  create: (data) => api.post('/groups', data),
  update: (id, data) => api.patch(`/groups/${id}`, data),
  getMembers: (id) => api.get(`/groups/${id}/members`),
};

export const userAPI = {
  getAll: (params) => api.get('/admin/users', { params }),
  getById: (id) => api.get(`/admin/users/${id}`),
  extendTrial: (id, days) => api.post(`/admin/users/${id}/extend-trial`, { days }),
  suspend: (id) => api.post(`/admin/users/${id}/suspend`),
  unsuspend: (id) => api.post(`/admin/users/${id}/unsuspend`),
};

export const sessionAPI = {
  getAll: () => api.get('/sessions'),
  create: (data) => api.post('/sessions', data),
  delete: (id) => api.delete(`/sessions/${id}`),
};

export const notificationAPI = {
  send: (data) => api.post('/admin/notifications/send', data),
  getHistory: () => api.get('/admin/notifications/history'),
};

export const analyticsAPI = {
  getMetrics: (params) => api.get('/admin/analytics', { params }),
  getUserGrowth: (params) => api.get('/admin/analytics/user-growth', { params }),
  getWorkoutStats: (params) => api.get('/admin/analytics/workouts', { params }),
};

export const subscriptionAPI = {
  getRevenue: () => api.get('/admin/subscriptions/revenue'),
  getSubscriptions: () => api.get('/admin/subscriptions'),
  getFailedPayments: () => api.get('/admin/subscriptions/failed-payments'),
};
