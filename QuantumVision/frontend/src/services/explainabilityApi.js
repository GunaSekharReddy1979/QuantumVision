import api from './apiClient';
 
export const getFeatureImportances = () => api.get('/explainability/features');
export const explainRisk = (payload) => api.post('/explainability/risk', payload);
export const explainRoute = (routeId) => api.post('/explainability/route', { route_id: routeId });