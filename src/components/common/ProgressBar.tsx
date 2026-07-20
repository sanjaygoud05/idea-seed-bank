import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  hint?: string;
  className?: string;
}

export function ProgressBar({ value, label, hint, className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn('space-y-1.5', className)}>
      {(label || hint) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="text-muted-foreground">{label}</span>}
          {hint && <span className="text-foreground font-medium">{hint}</span>}
        </div>
      )}
      <Progress value={clamped} />
    </div>
  );
}
