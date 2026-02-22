export default function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-lg bg-gray-800/50" />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-72 rounded-lg bg-gray-800/50" />
        <div className="h-72 rounded-lg bg-gray-800/50" />
      </div>

      {/* Table */}
      <div className="h-64 rounded-lg bg-gray-800/50" />
    </div>
  );
}
