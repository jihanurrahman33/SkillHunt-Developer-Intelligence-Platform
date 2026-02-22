import { useState, useCallback } from 'react';
import { fetchAnalytics } from '@/features/analytics/services/analytics.service';

export default function useAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const analytics = await fetchAnalytics();
      setData(analytics);
      return analytics;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    loadAnalytics,
  };
}
