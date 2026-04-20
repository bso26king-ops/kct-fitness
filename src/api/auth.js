import api from './index';

export const login = (email, password) =>
  api.post('/api/auth/login', { email, password });

export const register = (data) =>
  api.post('/api/auth/register', data);

export const getMe = () =>
  api.get('/api/auth/me');

export const updateProfile = (data) =>
  api.put('/api/auth/profile', data);

export const changePassword = (data) =>
  api.put('/api/auth/password', data);

export const forgotPassword = (email) =>
  api.post('/api/auth/forgot-password', { email });

export const resetPassword = (data) =>
  api.post('/api/auth/reset-password', data);

export const deleteAccount = () =>
  api.delete('/api/auth/account');
