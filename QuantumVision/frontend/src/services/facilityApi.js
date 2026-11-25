import api from './apiClient';

export const getFacilities = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return api.get(`/facilities${query ? `?${query}` : ''}`);
};

export const getNearbyFacilities = (lat, lon, radiusKm = 50, type = null) => {
  let url = `/facilities/nearby?lat=${lat}&lon=${lon}&radius_km=${radiusKm}`;
  if (type) url += `&type=${type}`;
  return api.get(url);
};

export const recommendFacility = (payload) => api.post('/facilities/recommend', payload);