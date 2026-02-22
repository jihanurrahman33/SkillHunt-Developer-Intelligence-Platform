'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error('Dashboard Route Error:', error);
  }, [error]);

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center p-8 text-center text-foreground">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-danger/10 mb-6">
        <svg
          className="h-10 w-10 text-danger"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          ></path>
        </svg>
      </div>
      <h2 className="text-2xl font-bold tracking-tight mb-2">Something went wrong!</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        {error.message || "We encountered an unexpected error while loading this page."}
      </p>
      <div className="flex justify-center gap-4">
        <Button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
        >
          Try again
        </Button>
        <Button
          variant="outline"
          onClick={() => window.location.href = '/dashboard'}
        >
          Return Home
        </Button>
      </div>
    </div>
  );
}
