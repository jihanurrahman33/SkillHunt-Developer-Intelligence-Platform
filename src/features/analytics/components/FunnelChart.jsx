import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import Card from '@/components/ui/Card';

const COLORS = {
  new: '#3b82f6', // blue-500
  contacted: '#8b5cf6', // violet-500
  interviewing: '#f59e0b', // amber-500
  hired: '#10b981', // emerald-500
  rejected: '#ef4444' // red-500
};

export default function FunnelChart({ data = [] }) {
  // Ensure we have fallback data for empty states
  if (!data || data.length === 0) {
    return (
      <Card title="Recruitment Pipeline" subtitle="Current status distribution of all candidates" className="h-[400px] flex flex-col">
        <div className="flex-1 flex items-center justify-center min-h-[300px] text-sm text-muted-foreground border border-dashed border-border rounded-lg m-4">
          No pipeline data available yet.
        </div>
      </Card>
    );
  }

  const total = data.reduce((acc, item) => acc + item.count, 0);

  // Map backend aggregations to visual props
  const formattedData = data.map(item => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    status: item.status.toLowerCase(),
    value: item.count,
    percentage: ((item.count / total) * 100).toFixed(1),
    color: COLORS[item.status.toLowerCase()] || '#94a3b8'
  })).sort((a, b) => b.value - a.value);

  return (
    <Card 
      title="Recruitment Pipeline" 
      subtitle="Current status distribution of all candidates" 
      className="h-[400px] flex flex-col"
      innerClassName="flex-1 flex flex-col items-center gap-2 overflow-hidden"
    >
      <div className="relative w-full h-[200px] shrink-0 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              animationBegin={0}
              animationDuration={800}
            >
              {formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#0B1220', borderColor: '#1F2937', borderRadius: '8px', color: '#e2e8f0' }}
              itemStyle={{ color: '#e2e8f0', fontWeight: 600 }}
              formatter={(value, name) => [`${value} candidates`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Stats */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold text-foreground leading-none">{total}</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">Total</span>
        </div>
      </div>

      {/* Legend List */}
      <div className="w-full flex-1 flex flex-col justify-start gap-2 px-2 overflow-y-auto pr-1">
        {formattedData.map((item) => (
          <div key={item.status} className="flex items-center justify-between group">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-xs font-medium text-foreground/80 group-hover:text-foreground transition-colors">{item.name}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-bold text-foreground">{item.value}</span>
              <span className="text-[10px] text-muted-foreground font-medium w-8 text-right">{item.percentage}%</span>
            </div>
          </div>
        ))}
        
        {/* Progress Bar visualization */}
        <div className="mt-2 h-1.5 w-full flex rounded-full overflow-hidden bg-muted/30">
          {formattedData.map((item) => (
            <div 
              key={item.status}
              style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
              className="h-full first:rounded-l-full last:rounded-r-full opacity-80"
              title={`${item.name}: ${item.percentage}%`}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
