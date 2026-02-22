export default function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Profile Header */}
      <div className="flex items-start gap-6">
        <div className="h-20 w-20 rounded-full bg-gray-800/50" />
        <div className="flex-1 space-y-3">
          <div className="h-6 w-48 rounded bg-gray-800/50" />
          <div className="h-4 w-32 rounded bg-gray-800/50" />
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-6 w-16 rounded-full bg-gray-800/50" />
            ))}
          </div>
        </div>
        <div className="h-8 w-28 rounded bg-gray-800/50" />
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-800 pb-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-4 w-20 rounded bg-gray-800/50" />
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="col-span-2 space-y-4">
          <div className="h-48 rounded-lg bg-gray-800/50" />
          <div className="h-32 rounded-lg bg-gray-800/50" />
        </div>
        <div className="space-y-4">
          <div className="h-32 rounded-lg bg-gray-800/50" />
          <div className="h-48 rounded-lg bg-gray-800/50" />
        </div>
      </div>
    </div>
  );
}
