'use client';

import { createContext, useContext, useState } from 'react';

const DeveloperContext = createContext();

export function DeveloperProvider({ children }) {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});

  const value = {
    developers,
    setDevelopers,
    loading,
    setLoading,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
  };

  return (
    <DeveloperContext.Provider value={value}>
      {children}
    </DeveloperContext.Provider>
  );
}

export function useDeveloperContext() {
  const context = useContext(DeveloperContext);
  if (!context) {
    throw new Error('useDeveloperContext must be used within a DeveloperProvider');
  }
  return context;
}

export default DeveloperContext;
