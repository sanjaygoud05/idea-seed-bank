import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Zap, Flame, Droplet, Trash2 } from 'lucide-react';

interface Row { emission_type?: string | null; source?: string | null; carbon_tonnes: number | string }

const CATEGORIES = [
  { key: 'electricity', label: 'Electricity', color: 'hsl(160 60% 50%)', icon: Zap, match: /electric|grid|power/i },
  { key: 'fuel',        label: 'Fuel',        color: 'hsl(28 85% 55%)',  icon: Flame, match: /fuel|gas|diesel|petrol|combust/i },
  { key: 'water',       label: 'Water',       color: 'hsl(190 70% 50%)', icon: Droplet, match: /water/i },
  { key: 'waste',       label: 'Waste',       color: 'hsl(220 8% 55%)',  icon: Trash2, match: /waste|landfill/i },
] as const;

export function EmissionBreakdown({ data }: { data: Row[] }) {
  const totals = useMemo(() => {
    const t: Record<string, number> = { electricity: 0, fuel: 0, water: 0, waste: 0, other: 0 };
    for (const r of data) {
      const label = `${r.emission_type ?? ''} ${r.source ?? ''}`.trim();
      const cat = CATEGORIES.find((c) => c.match.test(label));
      const v = Number(r.carbon_tonnes ?? 0);
      if (cat) t[cat.key] += v; else t.other += v;
    }
    return t;
  }, [data]);

  const total = CATEGORIES.reduce((s, c) => s + totals[c.key], 0);
  const chartData = CATEGORIES.map((c) => ({ name: c.label, value: Math.max(0, totals[c.key]), color: c.color }));
  const hasData = total > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
      <div className="md:col-span-2 h-[220px]">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                stroke="hsl(var(--background))"
                strokeWidth={2}
              >
                {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 0,
                  fontSize: 12,
                }}
                formatter={(v: number, n) => [`${Math.round(v * 100) / 100} t CO₂e`, n]}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No breakdown yet.</div>
        )}
      </div>
      <ul className="md:col-span-3 space-y-2">
        {CATEGORIES.map((c) => {
          const v = totals[c.key];
          const pct = hasData ? (v / total) * 100 : 0;
          const Icon = c.icon;
          return (
            <li key={c.key} className="group">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-md border border-border/60" style={{ background: `${c.color}1a`, color: c.color }}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-foreground font-medium">{c.label}</span>
                </div>
                <div className="flex items-baseline gap-2 tabular-nums">
                  <span className="text-foreground">{Math.round(v * 100) / 100} t</span>
                  <span className="text-xs text-muted-foreground w-10 text-right">{pct.toFixed(0)}%</span>
                </div>
              </div>
              <div className="mt-1.5 h-1.5 bg-muted overflow-hidden">
                <div
                  className="h-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${c.color}, ${c.color}99)` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
