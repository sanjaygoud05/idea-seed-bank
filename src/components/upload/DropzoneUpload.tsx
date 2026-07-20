import { useCallback, useRef, useState } from 'react';
import { UploadCloud, X, RotateCw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { formatBytes } from '@/utils/bytes';
import { classifyFile, ACCEPTED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from '@/services/storage';
import type { UploadTask } from '@/types/Document';

interface DropzoneUploadProps {
  onUpload: (file: File, onProgress: (pct: number) => void) => Promise<void>;
  disabled?: boolean;
  disabledReason?: string;
}

const ACCEPT_ATTR = Object.keys(ACCEPTED_MIME_TYPES).join(',');

export function DropzoneUpload({ onUpload, disabled, disabledReason }: DropzoneUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const updateTask = (localId: string, patch: Partial<UploadTask>) => {
    setTasks((prev) => prev.map((t) => (t.localId === localId ? { ...t, ...patch } : t)));
  };

  const runTask = useCallback(
    async (task: UploadTask) => {
      updateTask(task.localId, { state: 'uploading', progress: 0, error: undefined });
      try {
        await onUpload(task.file, (pct) => updateTask(task.localId, { progress: pct }));
        updateTask(task.localId, { state: 'success', progress: 100 });
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Upload failed';
        updateTask(task.localId, { state: 'error', error: msg });
      }
    },
    [onUpload],
  );

  const enqueue = useCallback(
    (files: FileList | File[]) => {
      const list = Array.from(files);
      const next: UploadTask[] = [];
      for (const file of list) {
        const check = classifyFile(file);
        const task: UploadTask = {
          localId: crypto.randomUUID(),
          file,
          progress: 0,
          state: check.ok ? 'pending' : 'error',
          error: check.ok ? undefined : check.reason,
        };
        next.push(task);
      }
      setTasks((prev) => [...next, ...prev]);
      next.filter((t) => t.state === 'pending').forEach(runTask);
    },
    [runTask],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    if (e.dataTransfer.files?.length) enqueue(e.dataTransfer.files);
  };

  const removeTask = (localId: string) =>
    setTasks((prev) => prev.filter((t) => t.localId !== localId));

  const retry = (task: UploadTask) => {
    if (classifyFile(task.file).ok) runTask(task);
  };

  return (
    <div className="space-y-4">
      <Card
        onDrop={onDrop}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        className={cn(
          'border-2 border-dashed transition-colors p-8 text-center cursor-pointer',
          dragOver ? 'border-primary bg-primary/5' : 'border-border',
          disabled && 'opacity-60 cursor-not-allowed',
        )}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT_ATTR}
          className="hidden"
          onChange={(e) => e.target.files && enqueue(e.target.files)}
        />
        <div className="flex flex-col items-center gap-2">
          <div className="p-3 rounded-full bg-primary/10">
            <UploadCloud className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground">
            Drag & drop files, or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            PDF, PNG, JPG, CSV, XLSX · up to {MAX_FILE_SIZE_BYTES / 1024 / 1024} MB
          </p>
          {disabled && disabledReason && (
            <p className="text-xs text-destructive mt-2">{disabledReason}</p>
          )}
        </div>
      </Card>

      {tasks.length > 0 && (
        <div className="space-y-2">
          {tasks.map((t) => (
            <TaskRow key={t.localId} task={t} onRetry={retry} onRemove={removeTask} />
          ))}
        </div>
      )}
    </div>
  );
}

function TaskRow({
  task,
  onRetry,
  onRemove,
}: {
  task: UploadTask;
  onRetry: (t: UploadTask) => void;
  onRemove: (id: string) => void;
}) {
  const Icon =
    task.state === 'success'
      ? CheckCircle2
      : task.state === 'error'
        ? AlertCircle
        : task.state === 'uploading'
          ? Loader2
          : UploadCloud;
  const tone =
    task.state === 'success'
      ? 'text-emerald-500'
      : task.state === 'error'
        ? 'text-red-500'
        : task.state === 'uploading'
          ? 'text-primary'
          : 'text-muted-foreground';
  return (
    <Card className="p-3 flex items-center gap-3">
      <Icon className={cn('h-4 w-4 flex-shrink-0', tone, task.state === 'uploading' && 'animate-spin')} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-foreground truncate">{task.file.name}</p>
          <p className="text-xs text-muted-foreground flex-shrink-0">{formatBytes(task.file.size)}</p>
        </div>
        {task.state === 'uploading' && <Progress value={task.progress} className="mt-2 h-1" />}
        {task.state === 'error' && task.error && (
          <p className="text-xs text-red-500 mt-1">{task.error}</p>
        )}
      </div>
      <div className="flex items-center gap-1">
        {task.state === 'error' && (
          <Button variant="ghost" size="icon" onClick={() => onRetry(task)}>
            <RotateCw className="h-4 w-4" />
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={() => onRemove(task.localId)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
