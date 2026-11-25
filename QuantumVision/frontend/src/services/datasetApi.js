import api from './apiClient';

export const getDatasets = () => api.get('/datasets');
export const getDataset = (datasetId) => api.get(`/datasets/${datasetId}`);
export const validateDataset = (payload) => api.post('/datasets/validate', payload);
export const processDataset = (datasetId, options) => api.post(`/datasets/${datasetId}/process`, options);
export const getDatasetStatus = (datasetId) => api.get(`/datasets/${datasetId}/status`);