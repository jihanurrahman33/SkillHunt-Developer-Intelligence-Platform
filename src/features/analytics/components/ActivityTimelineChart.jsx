import { useMemo } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import Card from '@/components/ui/Card';

export default function ActivityTimelineChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <Card title="Developer Network Activity" subtitle="Timeline of detected spikes & changes (30 days)" className="h-[400px] flex flex-col">
        <div className="flex-1 flex items-center justify-center min-h-[300px] text-sm text-muted-foreground border border-dashed border-border rounded-lg m-4">
          No recent activity logs recorded.
        </div>
      </Card>
    );
  }

  const paddedData = useMemo(() => {
    const result = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const existing = data.find(item => item.date === dateStr);
      result.push({
        date: dateStr,
        count: existing ? existing.count : 0
      });
    }
    return result;
  }, [data]);

  return (
    <Card title="Developer Network Activity" subtitle="Timeline of detected spikes & changes (30 days)" className="h-[400px] flex flex-col">
      <div className="w-full h-[320px] pr-4 mt-2">
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={paddedData} margin={{ top: 10, right: 10, left: -30, bottom: 30 }}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 12 }} 
              tickMargin={12}
              minTickGap={30}
              tickFormatter={(val) => {
                const d = new Date(val);
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 12 }} 
              allowDecimals={false}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
              itemStyle={{ color: '#3b82f6', fontWeight: 600 }}
              labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
              formatter={(value) => [`${value} Alerts`, 'Events']}
            />
            <Area 
              type="monotone" 
              dataKey="count" 
              name="Events"
              stroke="#3b82f6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorCount)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
