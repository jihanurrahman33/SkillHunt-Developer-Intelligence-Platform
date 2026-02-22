import { useState, useCallback } from 'react';
import { useDeveloperContext } from '@/features/developers/context/DeveloperContext';
import { fetchDevelopers, fetchDeveloperById } from '@/features/developers/services/developer.service';

export default function useDevelopers() {
  const { developers, setDevelopers, loading, setLoading, searchQuery, filters } = useDeveloperContext();
  const [error, setError] = useState(null);

  const loadDevelopers = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchDevelopers({ ...params, q: searchQuery, ...filters });
      setDevelopers(data.developers || []);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters, setDevelopers, setLoading]);

  return {
    developers,
    loading,
    error,
    loadDevelopers,
  };
}
