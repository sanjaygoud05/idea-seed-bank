// TODO: compute via server-side calculator (Express + emission factor library).
import { useMemo, useState } from 'react';
import { AppLayout } from '@/layouts/AppLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatCard } from '@/components/common/StatCard';
import { Leaf } from 'lucide-react';
import { formatNumber } from '@/utils/format';

// Illustrative emission factors — replace with server-side factor library.
const EF = {
  electricityKgPerKwh: 0.35,
  gasKgPerKwh: 0.20,
  dieselKgPerL: 2.68,
};

export default function CarbonCalculatorPage() {
  const [kwh, setKwh] = useState(10000);
  const [gasKwh, setGasKwh] = useState(4000);
  const [dieselL, setDieselL] = useState(500);

  const totalKg = useMemo(
    () => kwh * EF.electricityKgPerKwh + gasKwh * EF.gasKgPerKwh + dieselL * EF.dieselKgPerL,
    [kwh, gasKwh, dieselL],
  );

  return (
    <AppLayout>
      <div className="space-y-8">
        <PageHeader
          title="Carbon Calculator"
          description="Quick estimate of monthly CO₂e for a facility. Uses illustrative emission factors."
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-base">Inputs</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Electricity (kWh)" value={kwh} onChange={setKwh} />
              <Field label="Natural gas (kWh)" value={gasKwh} onChange={setGasKwh} />
              <Field label="Diesel (L)" value={dieselL} onChange={setDieselL} />
            </CardContent>
          </Card>
          <StatCard
            label="Estimated monthly CO₂e"
            value={`${formatNumber(totalKg / 1000, 2)} t`}
            icon={Leaf}
            hint="Illustrative factors only"
          />
        </div>
      </div>
    </AppLayout>
  );
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input type="number" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} />
    </div>
  );
}
