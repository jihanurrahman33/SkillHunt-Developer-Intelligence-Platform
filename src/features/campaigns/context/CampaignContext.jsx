'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import Swal from 'sweetalert2';

const CampaignContext = createContext();

const API_BASE = '/api/campaigns';

export function CampaignProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const fetchCampaigns = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setCampaigns([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (status) queryParams.append('status', status);

      const res = await fetch(`${API_BASE}?${queryParams.toString()}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to fetch campaigns');
      
      setCampaigns(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, search, status]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const addCampaign = async (campaignData) => {
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to create campaign');
      
      setCampaigns((prev) => [data.data, ...prev]);
      return { success: true, data: data.data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const editCampaign = async (id, updates) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to update campaign');
      
      setCampaigns((prev) => 
        prev.map(c => c._id === id ? data.data : c)
      );
      return { success: true, data: data.data };
    } catch (err) {
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
        const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || 'Failed to delete campaign');
        
        setCampaigns((prev) => prev.filter(c => c._id !== id));
        Swal.fire({
          title: 'Deleted!',
          text: 'Campaign has been deleted.',
          icon: 'success',
          background: '#0B1220',
          color: '#e2e8f0',
          showConfirmButton: false,
          timer: 1500
        });
        return { success: true };
      }
      return { success: false, cancelled: true };
    } catch (err) {
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
        error,
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
