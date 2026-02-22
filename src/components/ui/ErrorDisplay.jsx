'use client';

export default function ErrorDisplay({ error, reset }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6 text-center">
        <h2 className="mb-2 text-lg font-semibold text-red-400">
          Something went wrong
        </h2>
        <p className="mb-4 text-sm text-gray-400">
          {error?.message || 'An unexpected error occurred.'}
        </p>
        <button
          onClick={reset}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
