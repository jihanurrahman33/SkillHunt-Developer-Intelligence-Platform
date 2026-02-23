import { useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';

export default function ProfileActivityChart({ data = [] }) {
  const paddedData = useMemo(() => {
    const result = [];
    const dateMap = new Map(data.map(item => [item.date, item.count]));
    
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      result.push({
        date: dateStr,
        count: dateMap.get(dateStr) || 0
      });
    }
    return result;
  }, [data]);

  const hasActivity = data.some(d => d.count > 0);

  if (!hasActivity) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-border rounded-xl bg-surface/30">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Activity Trend (30d)</p>
        <p className="text-sm text-foreground/40 mt-2">Insufficient historical data to render trend.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Activity Trend (30d)</h3>
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Recruiter Discovery Pulse</span>
      </div>
      
      <div className="h-[120px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={paddedData}>
            <Tooltip 
              cursor={{ fill: 'rgba(59, 130, 246, 0.1)', radius: 4 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border border-border bg-surface p-2 text-[10px] shadow-lg">
                      <p className="font-bold text-foreground">{payload[0].payload.date}</p>
                      <p className="text-primary">{payload[0].value} Events Detected</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[2, 2, 0, 0]}>
              {paddedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.count > 0 ? '#3b82f6' : '#1e293b'} 
                  fillOpacity={entry.count > 0 ? 0.8 : 0.2}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border/50">
        <span>30 Days Ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}
