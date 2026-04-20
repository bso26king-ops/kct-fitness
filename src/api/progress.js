import api from './index';

export const getProgress     = (params) => api.get('/api/progress', { params });
export const logProgress     = (data)   => api.post('/api/progress', data);
export const getStats        = ()       => api.get('/api/progress/stats');
export const getLeaderboard  = (params) => api.get('/api/leaderboard', { params });
export const getGoals        = ()       => api.get('/api/goals');
export const createGoal      = (data)   => api.post('/api/goals', data);
export const updateGoal      = (id, data) => api.put(`/api/goals/${id}`, data);
export const deleteGoal      = (id)     => api.delete(`/api/goals/${id}`);
export const getChallenges   = ()       => api.get('/api/challenges');
