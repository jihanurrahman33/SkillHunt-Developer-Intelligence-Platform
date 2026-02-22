'use client';

import { useState, useCallback, useEffect } from 'react';
import { 
  fetchDevelopers, 
  ingestDeveloper, 
  updateDeveloperStatus 
} from '@/features/developers/services/developer.service';

export default function useDevelopers() {
  const [developers, setDevelopers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [techStack, setTechStack] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('');
  
  // Sorting & Pagination
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState(-1);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const loadDevelopers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
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

      const data = await fetchDevelopers(params);
      setDevelopers(data.developers || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, sortOrder, search, techStack, location, status]);

  useEffect(() => {
    loadDevelopers();
  }, [loadDevelopers]);

  const changeStatus = async (id, newStatus) => {
    try {
      await updateDeveloperStatus(id, newStatus);
      // Optimistic update
      setDevelopers((prev) =>
        prev.map((dev) =>
          dev._id === id ? { ...dev, currentStatus: newStatus } : dev
        )
      );
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const importDeveloper = async (username) => {
    try {
      const result = await ingestDeveloper(username);
      // Reload the first page to show the new developer
      setPage(1);
      loadDevelopers();
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    // Data
    developers,
    pagination,
    loading,
    error,
    
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
    reload: loadDevelopers,
    changeStatus,
    importDeveloper,
  };
}
