import api from './apiClient';

export const predictRisk = (payload) => api.post('/risk/predict', payload);
export const explainRisk = (payload) => api.post('/risk/explain', payload);
export const getModelComparison = () => api.get('/risk/comparison');