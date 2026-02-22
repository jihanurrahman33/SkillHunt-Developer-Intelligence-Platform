'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { DeveloperProvider } from '@/features/developers/context/DeveloperContext';
import { CampaignProvider } from '@/features/campaigns/context/CampaignContext';

export default function Providers({ children, session }) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <AuthProvider>
          <DeveloperProvider>
            <CampaignProvider>
              {children}
            </CampaignProvider>
          </DeveloperProvider>
        </AuthProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
