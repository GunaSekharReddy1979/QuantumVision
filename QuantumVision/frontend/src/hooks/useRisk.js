import { useState, useEffect } from 'react';
import { predictRisk, explainRisk } from '../services/riskApi';

export const useRisk = (lat = 16.5062, lon = 80.6480) => {
  const [riskData, setRiskData] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRisk = async (latitude = lat, longitude = lon) => {
    setLoading(true);
    try {
      const pred = await predictRisk({ latitude, longitude, hazard_type: 'combined' });
      setRiskData(pred.data);
      const expl = await explainRisk({ latitude, longitude, hazard_type: 'combined' });
      setExplanation(expl.data);
    } catch (err) {
      console.error('Failed to load risk prediction:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisk(lat, lon);
  }, [lat, lon]);

  return { riskData, explanation, loading, refetch: fetchRisk };
};

export default useRisk;