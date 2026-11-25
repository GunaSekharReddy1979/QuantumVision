import { useState } from 'react';
import { calculateRoute, calculateAlternatives } from '../services/routingApi';

export const useRouting = () => {
  const [route, setRoute] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getEvacuationRoute = async (origin, destination, algorithm = 'A*') => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        origin_latitude: origin.lat,
        origin_longitude: origin.lon,
        destination_latitude: destination.lat,
        destination_longitude: destination.lon,
        algorithm,
      };
      const res = await calculateRoute(payload);
      setRoute(res.data);
      const altRes = await calculateAlternatives(payload);
      setAlternatives(altRes.data);
      return res.data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { route, alternatives, loading, error, getEvacuationRoute };
};

export default useRouting;