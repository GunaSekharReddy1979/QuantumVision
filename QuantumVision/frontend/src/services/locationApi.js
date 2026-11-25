import api from './apiClient';

export const getDistricts = () => api.get('/locations/districts');
export const searchLocations = (query) => api.get(`/locations/search?q=${encodeURIComponent(query)}`);
export const selectLocation = (selection) => api.post('/locations/select', selection);
export const validateLocation = (coordinate) => api.post('/locations/validate', { coordinate });