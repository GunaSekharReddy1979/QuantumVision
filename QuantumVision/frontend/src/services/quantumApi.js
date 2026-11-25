import api from './apiClient';

export const getQuantumStatus = () => api.get('/quantum/status');
export const optimizeRouteQuantum = (payload) => api.post('/quantum/optimize-route', payload);
export const getModelBenchmark = () => api.get('/models/benchmark');
export const getModelStatus = () => api.get('/models/status');
export const getModelDatasetStats = () => api.get('/models/dataset-stats');
export const getModelBaseline = () => api.get('/models/baseline');
export const getModelComparison = () => api.get('/models/comparison');
export const getFeatureImportance = () => api.get('/models/feature-importance');

export default {
  getQuantumStatus,
  optimizeRouteQuantum,
  getModelBenchmark,
  getModelStatus,
  getModelDatasetStats,
  getModelBaseline,
  getModelComparison,
  getFeatureImportance,
};