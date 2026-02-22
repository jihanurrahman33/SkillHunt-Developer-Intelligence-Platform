'use client';

import ErrorDisplay from '@/components/ui/ErrorDisplay';

export default function CampaignsError({ error, reset }) {
  return <ErrorDisplay error={error} reset={reset} />;
}
