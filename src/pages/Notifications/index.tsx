// TODO: stream real-time notifications via Firebase Cloud Messaging.
import { AppLayout } from '@/layouts/AppLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { NotificationCard } from '@/components/notifications/NotificationCard';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { useMockQuery } from '@/hooks/useMockQuery';
import { listNotifications } from '@/services/mock';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  const { data, isLoading } = useMockQuery(['notifs'], listNotifications);
  return (
    <AppLayout>
      <div className="space-y-8">
        <PageHeader title="Notifications" description="Anomalies, thresholds, and workflow updates." />
        {isLoading ? (
          <LoadingSkeleton rows={4} />
        ) : (data ?? []).length === 0 ? (
          <EmptyState icon={Bell} title="You're all caught up" description="New alerts will appear here." />
        ) : (
          <div className="space-y-3 max-w-3xl">
            {(data ?? []).map((n) => <NotificationCard key={n.id} notification={n} />)}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
