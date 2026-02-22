'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { DeveloperProvider } from '@/features/developers/context/DeveloperContext';

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <AuthProvider>
          <DeveloperProvider>
            {children}
          </DeveloperProvider>
        </AuthProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
