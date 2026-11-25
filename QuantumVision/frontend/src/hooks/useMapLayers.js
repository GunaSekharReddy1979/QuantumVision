import { useState } from 'react';

export const useMapLayers = (initialLayers = {}) => {
  const [layers, setLayers] = useState({
    floodExtent: true,
    riskZones: true,
    waterways: true,
    shelters: true,
    hospitals: true,
    evacuationRoutes: true,
    ...initialLayers,
  });

  const toggleLayer = (key) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return { layers, toggleLayer, setLayers };
};

export default useMapLayers;