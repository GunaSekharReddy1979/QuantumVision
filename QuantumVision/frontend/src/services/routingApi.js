import api from './apiClient';

export const calculateRoute = (payload) => api.post('/routing/route', payload);
export const calculateAlternatives = (payload) => api.post('/routing/alternatives', payload);
export const recalculateRoute = (payload) => api.post('/routing/recalculate', payload);
export const explainRoute = (routeId) => api.post('/routing/explain', { route_id: routeId });
export const getRoutingStatus = () => api.get('/routing/status');