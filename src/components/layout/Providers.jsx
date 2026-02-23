'use client';

import { Suspense } from 'react';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/providers/ThemeContext';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { DeveloperProvider } from '@/features/developers/context/DeveloperContext';
import { CampaignProvider } from '@/features/campaigns/context/CampaignContext';

import { UIProvider } from '@/providers/UIContext';

export default function Providers({ children, session }) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <UIProvider>
          <AuthProvider>
            <Suspense fallback={null}>
              <DeveloperProvider>
                <CampaignProvider>
                  {children}
                </CampaignProvider>
              </DeveloperProvider>
            </Suspense>
          </AuthProvider>
        </UIProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
