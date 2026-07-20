import { Bell, Info, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import type { Notification } from '@/types';
import { formatRelative } from '@/utils/format';
import { cn } from '@/lib/utils';

const kindIcon = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
  alert: ShieldAlert,
} as const;

const kindTone = {
  info: 'text-primary bg-primary/10',
  warning: 'text-amber-500 bg-amber-500/10',
  success: 'text-emerald-500 bg-emerald-500/10',
  alert: 'text-red-500 bg-red-500/10',
} as const;

interface Props {
  notification: Notification;
}

export function NotificationCard({ notification: n }: Props) {
  const Icon = kindIcon[n.kind] ?? Bell;
  const body = (
    <Card className={cn(!n.read && 'border-primary/40')}>
      <CardContent className="p-4 flex items-start gap-3">
        <div className={cn('p-2 rounded-md', kindTone[n.kind])}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground">{n.title}</p>
            <span className="text-xs text-muted-foreground">{formatRelative(n.createdAt)}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
        </div>
        {!n.read && <span className="h-2 w-2 rounded-full bg-primary mt-2" aria-hidden />}
      </CardContent>
    </Card>
  );
  return n.link ? <Link to={n.link} className="block">{body}</Link> : body;
}
