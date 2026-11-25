import api from './apiClient';

export const getFloodSummary = () => api.get('/hazards/flood');
export const getFloodHazard = () => api.get('/hazards/flood');
export const getFloodInundation = () => api.get('/hazards/flood/inundation');
export const analyzeFlood = (payload) => api.post('/hazards/flood/analyze', payload);