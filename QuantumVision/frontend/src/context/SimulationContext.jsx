import React, { createContext, useContext, useState } from 'react';

export const SimulationContext = createContext(null);

export const SimulationProvider = ({ children }) => {
  const [simulationState, setSimulationState] = useState({
    simulationId: 'sim-default',
    currentStep: 0,
    totalSteps: 24,
    hazardType: 'flood',
    isPlaying: false,
    speedMs: 1000,
  });

  return (
    <SimulationContext.Provider
      value={{
        simulationState,
        setSimulationState,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulationContext = () => useContext(SimulationContext);