import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileBarChart } from 'lucide-react';
import type { Report } from '@/types';
import { formatDate } from '@/utils/format';

const statusTone: Record<Report['status'], string> = {
  draft: 'bg-muted text-muted-foreground',
  'in-review': 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  published: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
};

export function ReportListItem({ report }: { report: Report }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className="p-2 rounded-md bg-primary/10 text-primary">
          <FileBarChart className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{report.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {report.periodLabel} · {report.type.toUpperCase()} · updated {formatDate(report.updatedAt)}
          </p>
        </div>
        <Badge variant="outline" className={statusTone[report.status]}>{report.status}</Badge>
      </CardContent>
    </Card>
  );
}
