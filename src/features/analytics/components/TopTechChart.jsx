import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import Card from '@/components/ui/Card';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function TopTechChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <Card title="Top Skills" subtitle="Most common technologies in your talent pool" className="h-[400px] flex flex-col">
        <div className="flex-1 flex items-center justify-center min-h-[300px] text-sm text-muted-foreground border border-dashed border-border rounded-lg m-4">
          No skills data available.
        </div>
      </Card>
    );
  }

  const formattedData = data.map(item => ({
    name: item.technology,
    count: item.count
  }));

  return (
    <Card title="Top Skills" subtitle="Most common technologies in your talent pool" className="h-[400px] flex flex-col">
      <div className="w-full h-[320px] mt-2 pr-4">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 11 }} 
              interval={0}
              angle={-25}
              textAnchor="end"
              tickMargin={8} 
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
              itemStyle={{ color: '#f8fafc', fontWeight: 600 }}
              formatter={(value) => [`${value} developers`, 'Count']}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={60}>
              {formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
