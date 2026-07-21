import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

interface Row { record_date: string; electricity_kwh: number | string; renewable_kwh: number | string }

export function EnergyMixChart({ data }: { data: Row[] }) {
  const series = useMemo(() => {
    const byMonth = new Map<string, { electricity: number; renewable: number }>();
    for (const r of data) {
      const d = new Date(r.record_date);
      if (isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const cur = byMonth.get(key) ?? { electricity: 0, renewable: 0 };
      const total = Number(r.electricity_kwh ?? 0);
      const ren = Number(r.renewable_kwh ?? 0);
      cur.electricity += Math.max(0, total - ren);
      cur.renewable += ren;
      byMonth.set(key, cur);
    }
    return Array.from(byMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([k, v]) => {
        const [, m] = k.split('-');
        const label = new Date(2000, Number(m) - 1, 1).toLocaleString('en', { month: 'short' });
        return {
          month: label,
          Grid: Math.round(v.electricity / 1000 * 10) / 10,
          Renewable: Math.round(v.renewable / 1000 * 10) / 10,
        };
      });
  }, [data]);

  if (series.length === 0) {
    return <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">No energy records yet.</div>;
  }

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={series} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} unit=" MWh" />
          <Tooltip
            cursor={{ fill: 'hsl(var(--muted) / 0.4)' }}
            contentStyle={{
              background: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 0,
              fontSize: 12,
            }}
            formatter={(v: number, n) => [`${v} MWh`, n]}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} iconType="square" />
          <Bar dataKey="Grid" stackId="e" fill="hsl(220 10% 45%)" animationDuration={700} />
          <Bar dataKey="Renewable" stackId="e" fill="hsl(var(--primary))" animationDuration={700} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
