'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import useSWR from 'swr';
import { useAuth } from '@/features/auth/context/AuthContext';
import Swal from 'sweetalert2';

const CampaignContext = createContext();

const API_BASE = '/api/campaigns';

const fetcher = async (url) => {
  const res = await fetch(url);
  const payload = await res.json();
  if (!res.ok) throw new Error(payload.error || 'Failed to fetch');
  return payload;
};

export function CampaignProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  
  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const queryParams = new URLSearchParams();
  if (search) queryParams.append('search', search);
  if (status) queryParams.append('status', status);
  const queryString = queryParams.toString();

  const { data: campaigns = [], error, mutate, isLoading: loading } = useSWR(
    isAuthenticated && user?.id ? `${API_BASE}?${queryString}` : null,
    fetcher,
    { keepPreviousData: true }
  );

  const fetchCampaigns = useCallback(() => {
    mutate();
  }, [mutate]);

  const addCampaign = async (campaignData) => {
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData),
      });
      const payload = await res.json();
      
      if (!res.ok) throw new Error(payload.error || 'Failed to create campaign');
      
      mutate([payload, ...campaigns], false); // Optimistic UI
      mutate(); // Revalidate
      return { success: true, campaign: payload };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const editCampaign = async (id, updates) => {
    try {
      // Optimistic update
      mutate(campaigns.map(c => c._id === id ? { ...c, ...updates } : c), false);

      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const payload = await res.json();
      
      if (!res.ok) throw new Error(payload.error || 'Failed to update campaign');
      
      mutate(); // Revalidate
      return { success: true, campaign: payload };
    } catch (err) {
      mutate(); // Revert
      return { success: false, error: err.message };
    }
  };

  const removeCampaign = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Delete Campaign?',
        text: "You won't be able to revert this! Developers in this campaign will lose this assignment.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#3b82f6',
        confirmButtonText: 'Yes, delete it!',
        background: '#0B1220',
        color: '#e2e8f0',
      });

      if (result.isConfirmed) {
        // Optimistic delete
        mutate(campaigns.filter(c => c._id !== id), false);
        
        const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || 'Failed to delete campaign');
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Campaign has been deleted.',
          icon: 'success',
          background: '#0B1220',
          color: '#e2e8f0',
          showConfirmButton: false,
          timer: 1500
        });
        mutate();
        return { success: true };
      }
      return { success: false, cancelled: true };
    } catch (err) {
      mutate();
      Swal.fire({
        title: 'Error!',
        text: err.message,
        icon: 'error',
        background: '#0B1220',
        color: '#e2e8f0',
      });
      return { success: false, error: err.message };
    }
  };

  return (
    <CampaignContext.Provider
      value={{
        campaigns,
        loading,
        error: error?.message,
        search, setSearch,
        status, setStatus,
        fetchCampaigns,
        addCampaign,
        editCampaign,
        removeCampaign,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaignContext() {
  const context = useContext(CampaignContext);
  if (!context) {
    throw new Error('useCampaignContext must be used within a CampaignProvider');
  }
  return context;
}
