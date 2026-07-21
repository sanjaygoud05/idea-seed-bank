import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  icon: LucideIcon;
  accent?: 'emerald' | 'amber' | 'sky' | 'slate';
  delay?: string;
}

const accentMap = {
  emerald: 'from-emerald-500/20 to-emerald-500/0 text-primary',
  amber: 'from-amber-500/20 to-amber-500/0 text-amber-500',
  sky: 'from-sky-500/20 to-sky-500/0 text-sky-400',
  slate: 'from-slate-500/20 to-slate-500/0 text-slate-300',
} as const;

export function KpiCard({ label, value, unit, hint, icon: Icon, accent = 'emerald', delay }: KpiCardProps) {
  return (
    <div
      className="glass-card glass-card-emerald p-5 rounded-none animate-fade-up opacity-0 [animation-fill-mode:forwards]"
      style={delay ? { animationDelay: delay } : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-semibold tracking-tight text-foreground">{value}</span>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
          {hint && <p className="text-xs text-muted-foreground/80">{hint}</p>}
        </div>
        <div className={cn('p-2.5 rounded-md bg-gradient-to-br border border-border/50', accentMap[accent])}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
