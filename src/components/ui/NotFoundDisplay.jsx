import Link from 'next/link';

export default function NotFoundDisplay({ message = 'Page not found.' }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <div className="text-center">
        <h2 className="mb-2 text-6xl font-bold text-gray-600">404</h2>
        <p className="mb-4 text-sm text-gray-400">{message}</p>
        <Link
          href="/"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
