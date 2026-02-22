'use client';

import ErrorDisplay from '@/components/ui/ErrorDisplay';

export default function RegisterError({ error, reset }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <ErrorDisplay error={error} reset={reset} />
    </div>
  );
}
