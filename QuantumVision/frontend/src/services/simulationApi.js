import api from './apiClient';

export const createSimulation = (payload) => api.post('/simulation/create', payload);
export const runSimulationScenario = (payload) => api.post('/simulation/run', payload);
export const getSimulationState = (simulationId) => api.get(`/simulation/${simulationId}`);
export const stepSimulation = (simulationId, advanceSteps = 1) => api.post(`/simulation/${simulationId}/step`, { advance_steps: advanceSteps });
export const resetSimulation = (simulationId) => api.post(`/simulation/${simulationId}/reset`);