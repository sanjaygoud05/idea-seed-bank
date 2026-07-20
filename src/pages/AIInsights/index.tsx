// TODO: fetch recommendations from Hugging Face inference service via Express proxy.
import { AppLayout } from '@/layouts/AppLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { RecommendationCard } from '@/components/ai/RecommendationCard';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { useMockQuery } from '@/hooks/useMockQuery';
import { listRecommendations } from '@/services/mock';
import { Sparkles } from 'lucide-react';

export default function AIInsightsPage() {
  const { data, isLoading } = useMockQuery(['recs'], listRecommendations);
  return (
    <AppLayout>
      <div className="space-y-8">
        <PageHeader
          title="AI Insights"
          description="Model-generated recommendations ranked by CO₂e impact and financial return."
        />
        {isLoading ? (
          <LoadingSkeleton rows={4} />
        ) : (data ?? []).length === 0 ? (
          <EmptyState icon={Sparkles} title="No recommendations" description="Insights appear once telemetry is ingested." />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {(data ?? []).map((r) => <RecommendationCard key={r.id} recommendation={r} />)}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
