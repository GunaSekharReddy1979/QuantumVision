import { useState, useEffect } from 'react';

export const useCesium = (containerId) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [viewer, setViewer] = useState(null);

  useEffect(() => {
    // If window.Cesium exists, initialize or simulate viewer container readiness
    if (typeof window !== 'undefined') {
      setIsLoaded(true);
    }
  }, [containerId]);

  const flyToAP = () => {
    // Andhra Pradesh center coords
    return { lat: 16.5062, lon: 80.6480, height: 250000 };
  };

  return { isLoaded, viewer, setViewer, flyToAP };
};

export default useCesium;