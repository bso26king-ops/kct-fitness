import api from './index';

export const getNutritionLog  = (params) => api.get('/api/nutrition', { params });
export const addNutritionLog  = (data)   => api.post('/api/nutrition', data);
export const deleteNutritionLog = (id)   => api.delete(`/api/nutrition/${id}`);
export const getNutritionGoals  = ()     => api.get('/api/nutrition/goals');
export const setNutritionGoals  = (data) => api.put('/api/nutrition/goals', data);
export const searchFood         = (q)    => api.get('/api/nutrition/search', { params: { q } });
