'use client';

import useSWR from 'swr';
import { useAuth } from '@/features/auth/context/AuthContext';
import { fetchAnalyticsData } from '../services/analytics.service';
import Swal from 'sweetalert2';

export function useAnalytics() {
  const { isAuthenticated, user } = useAuth();
  
  const { data, error, mutate, isLoading } = useSWR(
    isAuthenticated && user?.id ? `/api/analytics` : null,
    fetchAnalyticsData,
    {
      refreshInterval: 300000, // Auto-refresh every 5 minutes
      keepPreviousData: true,
      revalidateOnFocus: true,
      onError: (err) => {
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
      }
    }
  );

  return { data, loading: isLoading, error: error?.message, refresh: () => mutate() };
}
