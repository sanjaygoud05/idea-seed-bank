import { StatCard } from '@/components/common/StatCard';
import { Leaf, Zap, Droplet, Trash2 } from 'lucide-react';
import { formatNumber } from '@/utils/format';

interface Props {
  totalCo2e: number;
  totalEnergyMwh: number;
  totalWaterM3: number;
  totalWasteKg: number;
}

export function DashboardOverviewGrid({ totalCo2e, totalEnergyMwh, totalWaterM3, totalWasteKg }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="CO₂e (quarter)" value={`${formatNumber(totalCo2e)} t`} icon={Leaf} hint="Scopes 1–3" animationDelay="50ms" />
      <StatCard label="Energy (month)" value={`${formatNumber(totalEnergyMwh)} MWh`} icon={Zap} hint="Grid + on-site" animationDelay="100ms" />
      <StatCard label="Water withdrawn" value={`${formatNumber(totalWaterM3)} m³`} icon={Droplet} hint="Month to date" animationDelay="150ms" />
      <StatCard label="Waste generated" value={`${formatNumber(totalWasteKg)} kg`} icon={Trash2} hint="Month to date" animationDelay="200ms" />
    </div>
  );
}
