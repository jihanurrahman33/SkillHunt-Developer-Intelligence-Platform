'use client';

import ErrorDisplay from '@/components/ui/ErrorDisplay';

export default function CampaignError({ error, reset }) {
  return <ErrorDisplay error={error} reset={reset} />;
}
