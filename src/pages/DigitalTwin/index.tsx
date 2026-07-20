// TODO: connect to live telemetry stream (GraphQL subscription + digital twin service).
import { AppLayout } from '@/layouts/AppLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { FacilityCard } from '@/components/digitalTwin/FacilityCard';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { useMockQuery } from '@/hooks/useMockQuery';
import { listFacilities } from '@/services/mock';
import { Boxes } from 'lucide-react';

export default function DigitalTwinPage() {
  const { data, isLoading } = useMockQuery(['facilities'], listFacilities);
  return (
    <AppLayout>
      <div className="space-y-8">
        <PageHeader
          title="Digital Twin"
          description="Live model of each facility with efficiency scores derived from ingested telemetry."
        />
        {isLoading ? (
          <LoadingSkeleton rows={4} />
        ) : (data ?? []).length === 0 ? (
          <EmptyState icon={Boxes} title="No facilities modeled" description="Add a facility to spin up its digital twin." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {(data ?? []).map((f) => <FacilityCard key={f.id} facility={f} />)}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
