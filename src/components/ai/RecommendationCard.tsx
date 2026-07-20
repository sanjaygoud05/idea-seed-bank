import { Sparkles, TrendingDown, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AIRecommendation } from '@/types';
import { formatCurrency, formatNumber } from '@/utils/format';

const impactTone: Record<AIRecommendation['impact'], string> = {
  high: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  medium: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  low: 'bg-muted text-muted-foreground border-border',
};

interface Props {
  recommendation: AIRecommendation;
}

export function RecommendationCard({ recommendation: r }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-md bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base leading-snug">{r.title}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">{r.category}</p>
            </div>
          </div>
          <Badge variant="outline" className={impactTone[r.impact]}>{r.impact} impact</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{r.summary}</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="inline-flex items-center gap-2 text-foreground">
            <TrendingDown className="h-4 w-4 text-emerald-500" />
            {formatNumber(r.estimatedCo2eSavingTonnes)} t CO₂e/yr
          </div>
          <div className="inline-flex items-center gap-2 text-foreground">
            <DollarSign className="h-4 w-4 text-emerald-500" />
            {formatCurrency(r.estimatedAnnualSavingUsd)}/yr
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Confidence: {Math.round(r.confidence * 100)}%</p>
      </CardContent>
    </Card>
  );
}
