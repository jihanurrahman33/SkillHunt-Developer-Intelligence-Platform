import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Card from '@/components/ui/Card';

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#ef4444'];

export default function TalentGeoChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <Card title="Talent Geo-Distribution" subtitle="Top developer locations" className="h-[400px] flex flex-col">
        <div className="flex-1 flex items-center justify-center min-h-[300px] text-sm text-muted-foreground border border-dashed border-border rounded-lg m-4">
          No location data available.
        </div>
      </Card>
    );
  }

  const formattedData = data.map(item => ({
    name: item.location,
    count: item.count
  })).sort((a, b) => b.count - a.count);

  return (
    <Card title="Talent Geo-Distribution" subtitle="Top developer locations" className="h-[400px] flex flex-col">
      <div className="w-full h-[320px] mt-2 pr-4">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart 
            data={formattedData} 
            layout="vertical"
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              width={80}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
              contentStyle={{ backgroundColor: '#0B1220', borderColor: '#1F2937', borderRadius: '8px', color: '#e2e8f0' }}
              itemStyle={{ color: '#e2e8f0', fontWeight: 600 }}
              labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
              formatter={(value) => [`${value} Developers`, 'Count']}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
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
