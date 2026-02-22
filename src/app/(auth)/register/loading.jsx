export default function RegisterLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm animate-pulse">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 h-11 w-11 rounded-lg bg-gray-800/50" />
          <div className="h-6 w-44 rounded bg-gray-800/50" />
          <div className="mt-2 h-4 w-56 rounded bg-gray-800/50" />
        </div>
        <div className="space-y-2.5">
          <div className="h-9 rounded-md bg-gray-800/50" />
          <div className="h-9 rounded-md bg-gray-800/50" />
        </div>
        <div className="my-5 h-px bg-gray-800/50" />
        <div className="space-y-3.5">
          <div className="h-16 rounded-md bg-gray-800/50" />
          <div className="h-16 rounded-md bg-gray-800/50" />
          <div className="h-16 rounded-md bg-gray-800/50" />
          <div className="h-16 rounded-md bg-gray-800/50" />
          <div className="h-9 rounded-md bg-gray-800/50" />
        </div>
      </div>
    </div>
  );
}
