/**
 * QuantumVision Rainfall Forecasting & Weather API Service.
 * Connects frontend dashboard to FastAPI backend endpoints.
 */
import api from './apiClient';

export const fetchRainfallForecast = async ({ hours = 24, locationId = null, mode = 'both', refresh = false } = {}) => {
  let endpoint = `/rainfall/forecast?hours=${hours}&mode=${mode}`;
  if (locationId && locationId !== 'all') {
    endpoint += `&location_id=${locationId}`;
  }
  return api.get(endpoint);
};

export const fetchRainfallLocations = async () => {
  return api.get('/rainfall/locations');
};

export const fetchRainfallModelEvaluation = async () => {
  return api.get('/rainfall/model/evaluation');
};

export const fetchRainfallModelStatus = async () => {
  return api.get('/rainfall/model/status');
};

export const trainRainfallModel = async (force = false) => {
  return api.post('/rainfall/model/train', { force_retrain: force });
};

export const fetchWeatherHistoricalStatus = async () => {
  return api.get('/weather/historical-status');
};

export const syncWeatherHistorical = async ({ startYear = 2021, endYear = 2025, force = false } = {}) => {
  return api.post('/weather/historical/sync', { start_year: startYear, end_year: endYear, force });
};

export default {
  fetchRainfallForecast,
  fetchRainfallLocations,
  fetchRainfallModelEvaluation,
  fetchRainfallModelStatus,
  trainRainfallModel,
  fetchWeatherHistoricalStatus,
  syncWeatherHistorical
};
