export type EnergySource = 'grid' | 'solar' | 'wind' | 'gas' | 'diesel';

export interface EnergyMetric {
  id: string;
  facilityId: string;
  periodStart: string;
  periodEnd: string;
  source: EnergySource;
  consumptionKwh: number;
  renewableShare: number; // 0-1
}
