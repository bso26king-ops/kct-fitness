import api from './index';

export const getWorkouts      = (params) => api.get('/api/workouts', { params });
export const getWorkout       = (id)      => api.get(`/api/workouts/${id}`);
export const getTodayWorkout  = ()        => api.get('/api/workouts/today');
export const logWorkout       = (id, data)=> api.post(`/api/workouts/${id}/log`, data);
export const getWorkoutLogs   = (params)  => api.get('/api/workout-logs', { params });
export const getExercises     = (params)  => api.get('/api/exercises', { params });
export const getSchedule      = (params)  => api.get('/api/schedule', { params });
