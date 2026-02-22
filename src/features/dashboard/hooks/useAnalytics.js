import { useState, useEffect } from 'react';
import { fetchAnalyticsData } from '../services/analytics.service';
import Swal from 'sweetalert2';

export function useAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchAnalyticsData();
      setData(result);
    } catch (err) {
      setError(err.message);
      Swal.fire({
        icon: 'error',
        title: 'Dashboard Error',
        text: err.message,
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        background: '#0B1220',
        color: '#e2e8f0',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
    
    // Auto-refresh every 5 minutes (300000ms) to ensure live feel
    const intervalId = setInterval(loadAnalytics, 300000);
    
    return () => clearInterval(intervalId);
  }, []);

  return { data, loading, error, refresh: loadAnalytics };
}
