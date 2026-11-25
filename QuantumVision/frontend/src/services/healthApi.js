import api from './apiClient';

export const getHealth = () => api.get('/health');