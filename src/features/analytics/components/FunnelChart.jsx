import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';
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

  // Map backend aggregations to visual props
  const formattedData = data.map(item => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count,
    color: COLORS[item.status.toLowerCase()] || '#94a3b8'
  }));

  return (
    <Card title="Recruitment Pipeline" subtitle="Current status distribution of all candidates" className="h-[400px] flex flex-col">
      <div className="w-full h-[320px] mt-2">
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={110}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
              itemStyle={{ color: '#f8fafc', fontWeight: 600 }}
              formatter={(value, name) => [`${value} candidates`, name]}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
