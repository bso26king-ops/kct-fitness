import api from './index';

export const getPrograms     = (params) => api.get('/api/programs', { params });
export const getProgram      = (id)     => api.get(`/api/programs/${id}`);
export const enrollProgram   = (id)     => api.post(`/api/programs/${id}/enroll`);
export const unenrollProgram = (id)     => api.delete(`/api/programs/${id}/enroll`);
export const getMyPrograms   = ()       => api.get('/api/programs/my');
