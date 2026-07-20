// TODO: back with real report service (Prisma models + SMTP delivery).
import { AppLayout } from '@/layouts/AppLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { ReportListItem } from '@/components/reports/ReportListItem';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { useMockQuery } from '@/hooks/useMockQuery';
import { listReports } from '@/services/mock';
import { FileBarChart, Plus } from 'lucide-react';

export default function ReportsPage() {
  const { data, isLoading } = useMockQuery(['reports'], listReports);
  return (
    <AppLayout>
      <div className="space-y-8">
        <PageHeader
          title="Reports"
          description="ESG disclosures, GHG inventories, and internal reviews."
          action={{ label: 'New report', icon: Plus }}
        />
        {isLoading ? (
          <LoadingSkeleton rows={4} />
        ) : (data ?? []).length === 0 ? (
          <EmptyState icon={FileBarChart} title="No reports" description="Generate a report to get started." />
        ) : (
          <div className="space-y-3">
            {(data ?? []).map((r) => <ReportListItem key={r.id} report={r} />)}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
