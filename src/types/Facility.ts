export type FacilityType = 'factory' | 'office' | 'warehouse' | 'data-center' | 'retail';

export interface Facility {
  id: string;
  companyId: string;
  name: string;
  type: FacilityType;
  location: string;
  areaSqm: number;
  employees: number;
  status: 'operational' | 'maintenance' | 'offline';
  efficiencyScore: number; // 0-100
}
