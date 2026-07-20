export interface WaterMetric {
  id: string;
  facilityId: string;
  periodStart: string;
  periodEnd: string;
  withdrawnM3: number;
  recycledM3: number;
  dischargeM3: number;
}
