export type EmissionScope = 'scope-1' | 'scope-2' | 'scope-3';

export interface CarbonMetric {
  id: string;
  facilityId: string;
  periodStart: string;
  periodEnd: string;
  scope: EmissionScope;
  co2eTonnes: number;
  source: string;
}
