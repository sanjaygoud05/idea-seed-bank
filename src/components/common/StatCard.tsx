import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  animationDelay?: string;
  footer?: ReactNode;
}

const trendColor = {
  up: 'text-emerald-500',
  down: 'text-red-500',
  neutral: 'text-muted-foreground',
} as const;

export function StatCard({ label, value, hint, icon: Icon, trend = 'neutral', animationDelay, footer }: StatCardProps) {
  return (
    <Card
      className="animate-fade-up opacity-0 [animation-fill-mode:forwards]"
      style={animationDelay ? { animationDelay } : undefined}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-semibold text-foreground mt-1">{value}</p>
          </div>
          {Icon && (
            <div className="p-2 rounded-md bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>
        {hint && <p className={cn('text-xs mt-3', trendColor[trend])}>{hint}</p>}
        {footer && <div className="mt-3">{footer}</div>}
      </CardContent>
    </Card>
  );
}
