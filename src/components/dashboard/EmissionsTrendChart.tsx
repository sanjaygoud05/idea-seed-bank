import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Row { calculation_date: string; carbon_tonnes: number | string }

export function EmissionsTrendChart({ data }: { data: Row[] }) {
  const series = useMemo(() => {
    const byMonth = new Map<string, number>();
    for (const r of data) {
      const d = new Date(r.calculation_date);
      if (isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      byMonth.set(key, (byMonth.get(key) ?? 0) + Number(r.carbon_tonnes ?? 0));
    }
    return Array.from(byMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([k, v]) => {
        const [, m] = k.split('-');
        const label = new Date(2000, Number(m) - 1, 1).toLocaleString('en', { month: 'short' });
        return { month: label, co2e: Math.round(v * 100) / 100 };
      });
  }, [data]);

  if (series.length === 0) {
    return (
      <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground">
        No emission records yet.
      </div>
    );
  }

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="co2eFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 0,
              fontSize: 12,
            }}
            labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
            formatter={(v: number) => [`${v} t CO₂e`, 'Emissions']}
          />
          <Area
            type="monotone"
            dataKey="co2e"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#co2eFill)"
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
