'use client';

import { createContext, useContext } from 'react';
import useDevelopersHook from '@/features/developers/hooks/useDevelopers';

const DeveloperContext = createContext();

export function DeveloperProvider({ children }) {
  const developerState = useDevelopersHook();

  return (
    <DeveloperContext.Provider value={developerState}>
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
