// TODO: replace with analytics GraphQL queries + recharts visualizations.
import { AppLayout } from '@/layouts/AppLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { TrendPanel } from '@/components/analytics/TrendPanel';

export default function AnalyticsPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <PageHeader
          title="Analytics"
          description="Cross-facility trends, benchmarks, and drill-downs into your environmental metrics."
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendPanel title="Emissions trend" description="Chart placeholder — will render Scope 1/2/3 monthly series." />
          <TrendPanel title="Energy intensity" description="kWh per unit of output vs. baseline. Chart placeholder." />
          <TrendPanel title="Water balance" description="Withdrawal vs. recycled vs. discharge. Chart placeholder." />
          <TrendPanel title="Waste diversion" description="% diverted by stream, weekly. Chart placeholder." />
        </div>
      </div>
    </AppLayout>
  );
}
