export type WasteStream = 'general' | 'recyclable' | 'organic' | 'hazardous' | 'e-waste';

export interface WasteMetric {
  id: string;
  facilityId: string;
  periodStart: string;
  periodEnd: string;
  stream: WasteStream;
  generatedKg: number;
  divertedKg: number; // recycled / composted
}
