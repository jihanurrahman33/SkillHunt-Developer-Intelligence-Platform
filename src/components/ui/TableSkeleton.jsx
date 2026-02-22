export default function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="h-8 w-48 rounded bg-gray-800/50" />
        <div className="h-10 w-64 rounded bg-gray-800/50" />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-800">
        {/* Table header */}
        <div className="flex gap-4 border-b border-gray-800 bg-gray-800/30 px-4 py-3">
          {[...Array(columns)].map((_, i) => (
            <div key={i} className="h-4 flex-1 rounded bg-gray-700/50" />
          ))}
        </div>

        {/* Table rows */}
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex gap-4 border-b border-gray-800/50 px-4 py-3">
            {[...Array(columns)].map((_, j) => (
              <div key={j} className="h-4 flex-1 rounded bg-gray-800/50" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
