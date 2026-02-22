'use client';

import ErrorDisplay from '@/components/ui/ErrorDisplay';

export default function DevelopersError({ error, reset }) {
  return <ErrorDisplay error={error} reset={reset} />;
}
