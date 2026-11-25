import api from './apiClient';

export const getReportsSummary = () => api.get('/reports/summary');
export const generateReport = (payload) => api.post('/reports/generate', payload);

export default {
  getReportsSummary,
  generateReport
};
