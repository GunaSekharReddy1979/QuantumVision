import { useState, useEffect } from 'react';
import { createSimulation, getSimulationState, stepSimulation, resetSimulation } from '../services/simulationApi';

export const useSimulation = (initialHazard = 'flood') => {
  const [simulation, setSimulation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  const initSimulation = async () => {
    setLoading(true);
    try {
      const res = await createSimulation({
        hazard_type: initialHazard,
        center_latitude: 16.5062,
        center_longitude: 80.6480,
      });
      setSimulation(res.data);
    } catch (err) {
      console.error('Failed to init simulation:', err);
    } finally {
      setLoading(false);
    }
  };

  const advance = async (steps = 1) => {
    if (!simulation) return;
    try {
      const res = await stepSimulation(simulation.simulation_id, steps);
      setSimulation(res.data);
    } catch (err) {
      console.error('Failed to step simulation:', err);
    }
  };

  const reset = async () => {
    if (!simulation) return;
    try {
      const res = await resetSimulation(simulation.simulation_id);
      setSimulation(res.data);
      setIsPlaying(false);
    } catch (err) {
      console.error('Failed to reset simulation:', err);
    }
  };

  useEffect(() => {
    initSimulation();
  }, [initialHazard]);

  return { simulation, isPlaying, setIsPlaying, advance, reset, loading };
};

export default useSimulation;