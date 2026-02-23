'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/auth/context/AuthContext';
import { 
  fetchDevelopers,
  fetchDeveloperById,
  ingestDeveloper, 
  updateDeveloperStatus,
  bulkAssignDevelopersToCampaign,
  deleteDeveloper
} from '@/features/developers/services/developer.service';

export default function useDevelopers() {
  const { user } = useAuth();
  
  const searchParams = useSearchParams();
  
  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [techStack, setTechStack] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('');
  
  // Sorting & Pagination
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState(-1);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // Sync state if URL changes
  useEffect(() => {
    const query = searchParams.get('search');
    if (query !== null && query !== search) {
      setSearch(query);
    }
  }, [searchParams, search]);

  const params = {
    page,
    limit,
    sortBy,
    sortOrder,
    ...(search && { search }),
    ...(techStack && { techStack }),
    ...(location && { location }),
    ...(status && { status }),
  };

  const queryString = new URLSearchParams(params).toString();

  const { data, error, mutate, isLoading } = useSWR(
    user?.id ? `/api/developers?${queryString}` : null,
    () => fetchDevelopers(params),
    {
      keepPreviousData: true,
    }
  );

  const developers = data?.developers || [];
  const pagination = data?.pagination || null;

  const changeStatus = async (id, newStatus) => {
    try {
      // Optimistically update the UI
      mutate(
        {
          developers: developers.map((dev) =>
            dev._id === id ? { ...dev, currentStatus: newStatus } : dev
          ),
          pagination,
        },
        false
      );
      await updateDeveloperStatus(id, newStatus);
      mutate(); // Revalidate
      return { success: true };
    } catch (err) {
      mutate(); // Revert on failure
      return { success: false, error: err.message };
    }
  };

  const importDeveloper = async (username) => {
    try {
      const result = await ingestDeveloper(username);
      setPage(1);
      mutate(); // Revalidate data
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const removeDeveloper = async (id) => {
    try {
      // Optimistically remove from list
      mutate(
        {
          developers: developers.filter((dev) => dev._id !== id),
          pagination,
        },
        false
      );
      await deleteDeveloper(id);
      mutate(); // Revalidate
      return { success: true };
    } catch (err) {
      mutate(); // Revert
      return { success: false, error: err.message };
    }
  };

  const bulkAssignCampaign = async (developerIds, campaignId) => {
    try {
      // Optimistically update list
      mutate(
        {
          developers: developers.map((dev) => 
            developerIds.includes(dev._id) ? { ...dev, campaignId } : dev
          ),
          pagination,
        },
        false
      );
      await bulkAssignDevelopersToCampaign(developerIds, campaignId);
      mutate(); // Revalidate
      return { success: true };
    } catch (err) {
      mutate(); // Revert
      return { success: false, error: err.message };
    }
  };

  return {
    // Data
    developers,
    pagination,
    loading: isLoading,
    error: error?.message,
    
    // Filter State
    search, setSearch,
    techStack, setTechStack,
    location, setLocation,
    status, setStatus,
    
    // Sort/Page State
    sortBy, setSortBy,
    sortOrder, setSortOrder,
    page, setPage,
    
    // Actions
    reload: () => mutate(),
    changeStatus,
    importDeveloper,
    removeDeveloper,
    bulkAssignCampaign,
  };
}
