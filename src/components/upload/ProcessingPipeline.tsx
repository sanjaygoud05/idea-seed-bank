import { ArrowRight, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { key: 'uploaded', label: 'Uploaded' },
  { key: 'processing', label: 'Processing' },
  { key: 'extracted', label: 'Extraction complete' },
  { key: 'analyzed', label: 'Analysis ready' },
] as const;

const ORDER: Record<string, number> = {
  uploaded: 0,
  processing: 1,
  extracted: 2,
  analyzed: 3,
  failed: -1,
};

interface ProcessingPipelineProps {
  status: string;
  errorMessage?: string | null;
  className?: string;
}

export function ProcessingPipeline({ status, errorMessage, className }: ProcessingPipelineProps) {
  const current = ORDER[status] ?? 0;
  const failed = status === 'failed';

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-wrap items-center gap-2">
        {STEPS.map((step, i) => {
          const done = i < current;
          const active = i === current && !failed;
          const Icon = done ? CheckCircle2 : active ? Loader2 : Circle;
          return (
            <div key={step.key} className="flex items-center gap-2">
              <div
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs',
                  done && 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500',
                  active && 'border-primary/40 bg-primary/10 text-primary',
                  !done && !active && 'border-border text-muted-foreground',
                )}
              >
                <Icon className={cn('h-3 w-3', active && 'animate-spin')} />
                {step.label}
              </div>
              {i < STEPS.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
            </div>
          );
        })}
      </div>
      {failed && (
        <p className="text-xs text-red-500">
          Processing failed{errorMessage ? `: ${errorMessage}` : ''}
        </p>
      )}
    </div>
  );
}
