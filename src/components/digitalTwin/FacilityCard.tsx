import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/common/ProgressBar';
import { MapPin, Users } from 'lucide-react';
import type { Facility } from '@/types';

interface FacilityCardProps {
  facility: Facility;
}

const statusTone: Record<Facility['status'], string> = {
  operational: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  maintenance: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  offline: 'bg-red-500/10 text-red-500 border-red-500/30',
};

export function FacilityCard({ facility }: FacilityCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{facility.name}</CardTitle>
          <Badge variant="outline" className={statusTone[facility.status]}>{facility.status}</Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{facility.location}</span>
          <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{facility.employees}</span>
          <span className="uppercase tracking-wide">{facility.type}</span>
        </div>
      </CardHeader>
      <CardContent>
        <ProgressBar
          value={facility.efficiencyScore}
          label="Efficiency score"
          hint={`${facility.efficiencyScore}/100`}
        />
      </CardContent>
    </Card>
  );
}
