import type {
  Company, Facility, CarbonMetric, EnergyMetric,
  WaterMetric, WasteMetric, AIRecommendation, Report, Notification,
} from '@/types';

// TODO: replace with API call (Express/GraphQL/Prisma/Neon)
export const mockCompany: Company = {
  id: 'co_ecotwin_demo',
  name: 'Meridian Manufacturing Group',
  industry: 'Industrial Manufacturing',
  headquarters: 'Rotterdam, Netherlands',
  employeeCount: 4820,
  annualRevenueUsd: 1_240_000_000,
  sustainabilityGoal: 'Reduce operational emissions by 55% vs 2019 baseline',
  netZeroTargetYear: 2040,
  createdAt: '2019-04-12T09:00:00Z',
};

// TODO: replace with API call
export const mockFacilities: Facility[] = [
  { id: 'fac_1', companyId: 'co_ecotwin_demo', name: 'Rotterdam Plant A', type: 'factory', location: 'Rotterdam, NL', areaSqm: 42000, employees: 620, status: 'operational', efficiencyScore: 78 },
  { id: 'fac_2', companyId: 'co_ecotwin_demo', name: 'Hamburg Distribution', type: 'warehouse', location: 'Hamburg, DE', areaSqm: 28500, employees: 140, status: 'operational', efficiencyScore: 84 },
  { id: 'fac_3', companyId: 'co_ecotwin_demo', name: 'Amsterdam HQ', type: 'office', location: 'Amsterdam, NL', areaSqm: 9800, employees: 410, status: 'operational', efficiencyScore: 92 },
  { id: 'fac_4', companyId: 'co_ecotwin_demo', name: 'Dublin Data Center', type: 'data-center', location: 'Dublin, IE', areaSqm: 6200, employees: 45, status: 'maintenance', efficiencyScore: 66 },
  { id: 'fac_5', companyId: 'co_ecotwin_demo', name: 'Lyon Assembly', type: 'factory', location: 'Lyon, FR', areaSqm: 31000, employees: 380, status: 'operational', efficiencyScore: 71 },
];


// TODO: replace with API call
export const mockCarbon: CarbonMetric[] = [
  { id: 'c_1', facilityId: 'fac_1', periodStart: '2026-04-01', periodEnd: '2026-06-30', scope: 'scope-1', co2eTonnes: 1240, source: 'Natural gas boilers' },
  { id: 'c_2', facilityId: 'fac_1', periodStart: '2026-04-01', periodEnd: '2026-06-30', scope: 'scope-2', co2eTonnes: 890, source: 'Grid electricity' },
  { id: 'c_3', facilityId: 'fac_2', periodStart: '2026-04-01', periodEnd: '2026-06-30', scope: 'scope-1', co2eTonnes: 410, source: 'Fleet diesel' },
  { id: 'c_4', facilityId: 'fac_4', periodStart: '2026-04-01', periodEnd: '2026-06-30', scope: 'scope-2', co2eTonnes: 720, source: 'Grid electricity' },
  { id: 'c_5', facilityId: 'fac_5', periodStart: '2026-04-01', periodEnd: '2026-06-30', scope: 'scope-3', co2eTonnes: 2100, source: 'Purchased components' },
];

// TODO: replace with API call
export const mockEnergy: EnergyMetric[] = [
  { id: 'e_1', facilityId: 'fac_1', periodStart: '2026-06-01', periodEnd: '2026-06-30', source: 'grid', consumptionKwh: 1_820_000, renewableShare: 0.42 },
  { id: 'e_2', facilityId: 'fac_1', periodStart: '2026-06-01', periodEnd: '2026-06-30', source: 'solar', consumptionKwh: 210_000, renewableShare: 1 },
  { id: 'e_3', facilityId: 'fac_3', periodStart: '2026-06-01', periodEnd: '2026-06-30', source: 'grid', consumptionKwh: 88_000, renewableShare: 0.71 },
  { id: 'e_4', facilityId: 'fac_4', periodStart: '2026-06-01', periodEnd: '2026-06-30', source: 'grid', consumptionKwh: 1_310_000, renewableShare: 0.35 },
];

// TODO: replace with API call
export const mockWater: WaterMetric[] = [
  { id: 'w_1', facilityId: 'fac_1', periodStart: '2026-06-01', periodEnd: '2026-06-30', withdrawnM3: 18400, recycledM3: 6200, dischargeM3: 11800 },
  { id: 'w_2', facilityId: 'fac_5', periodStart: '2026-06-01', periodEnd: '2026-06-30', withdrawnM3: 12200, recycledM3: 3100, dischargeM3: 9000 },
  { id: 'w_3', facilityId: 'fac_3', periodStart: '2026-06-01', periodEnd: '2026-06-30', withdrawnM3: 1800, recycledM3: 400, dischargeM3: 1350 },
];

// TODO: replace with API call
export const mockWaste: WasteMetric[] = [
  { id: 'ws_1', facilityId: 'fac_1', periodStart: '2026-06-01', periodEnd: '2026-06-30', stream: 'general', generatedKg: 24000, divertedKg: 4200 },
  { id: 'ws_2', facilityId: 'fac_1', periodStart: '2026-06-01', periodEnd: '2026-06-30', stream: 'recyclable', generatedKg: 12500, divertedKg: 11800 },
  { id: 'ws_3', facilityId: 'fac_2', periodStart: '2026-06-01', periodEnd: '2026-06-30', stream: 'hazardous', generatedKg: 820, divertedKg: 820 },
  { id: 'ws_4', facilityId: 'fac_4', periodStart: '2026-06-01', periodEnd: '2026-06-30', stream: 'e-waste', generatedKg: 320, divertedKg: 300 },
];

// TODO: replace with API call to Hugging Face inference service
export const mockRecommendations: AIRecommendation[] = [
  { id: 'r_1', title: 'Shift Rotterdam boilers to heat-pump hybrid', summary: 'Model predicts 38% gas reduction with 2.6-year payback based on current load profile.', category: 'energy', impact: 'high', estimatedCo2eSavingTonnes: 470, estimatedAnnualSavingUsd: 312_000, confidence: 0.86, createdAt: '2026-07-12T09:00:00Z', facilityId: 'fac_1' },
  { id: 'r_2', title: 'Dublin DC cold-aisle containment', summary: 'Reduce cooling load by ~22% during summer months; addresses recent PUE spike.', category: 'energy', impact: 'medium', estimatedCo2eSavingTonnes: 180, estimatedAnnualSavingUsd: 96_000, confidence: 0.78, createdAt: '2026-07-14T11:20:00Z', facilityId: 'fac_4' },
  { id: 'r_3', title: 'Consolidate Hamburg outbound routes', summary: 'Route optimization on top 12 lanes cuts fleet km by 14%.', category: 'carbon', impact: 'medium', estimatedCo2eSavingTonnes: 62, estimatedAnnualSavingUsd: 41_000, confidence: 0.72, createdAt: '2026-07-15T14:05:00Z', facilityId: 'fac_2' },
  { id: 'r_4', title: 'Greywater reuse loop at Lyon', summary: 'Capex-light retrofit; recycles ~28% of process water within 18 months.', category: 'water', impact: 'medium', estimatedCo2eSavingTonnes: 12, estimatedAnnualSavingUsd: 58_000, confidence: 0.69, createdAt: '2026-07-16T08:44:00Z', facilityId: 'fac_5' },
  { id: 'r_5', title: 'Segregate PP/PE waste stream at Rotterdam', summary: 'Raises recyclable diversion from 34% to ~62% with modest sorting change.', category: 'waste', impact: 'low', estimatedCo2eSavingTonnes: 8, estimatedAnnualSavingUsd: 17_000, confidence: 0.81, createdAt: '2026-07-17T06:12:00Z', facilityId: 'fac_1' },
];

// TODO: replace with API call
export const mockReports: Report[] = [
  { id: 'rep_1', title: 'FY2025 GHG Inventory', type: 'ghg-inventory', status: 'published', periodLabel: 'Jan–Dec 2025', createdAt: '2026-03-01T10:00:00Z', updatedAt: '2026-04-10T15:30:00Z', author: 'Priya Menon' },
  { id: 'rep_2', title: 'CDP Climate Response 2026', type: 'cdp', status: 'in-review', periodLabel: '2026 disclosure cycle', createdAt: '2026-05-11T09:00:00Z', updatedAt: '2026-07-10T09:00:00Z', author: 'Lena Vos' },
  { id: 'rep_3', title: 'Q2 2026 Internal Sustainability Review', type: 'internal', status: 'draft', periodLabel: 'Apr–Jun 2026', createdAt: '2026-07-05T12:00:00Z', updatedAt: '2026-07-16T18:22:00Z', author: 'Marc Dubois' },
  { id: 'rep_4', title: 'GRI 305 Emissions Disclosure', type: 'gri', status: 'draft', periodLabel: 'FY2025', createdAt: '2026-06-20T09:00:00Z', updatedAt: '2026-07-01T09:00:00Z', author: 'Priya Menon' },
];

// TODO: replace with API call / Firebase Cloud Messaging stream
export const mockNotifications: Notification[] = [
  { id: 'n_1', title: 'Anomaly detected at Dublin DC', message: 'Cooling energy 18% above forecast for the last 6 hours.', kind: 'alert', read: false, createdAt: '2026-07-17T05:30:00Z', link: '/digital-twin' },
  { id: 'n_2', title: 'New AI recommendation', message: 'Rotterdam boiler retrofit — projected 470 t CO₂e/yr saving.', kind: 'info', read: false, createdAt: '2026-07-17T04:10:00Z', link: '/ai-insights' },
  { id: 'n_3', title: 'CDP report ready for review', message: 'Draft compiled from Q1 & Q2 data; awaiting approver.', kind: 'warning', read: false, createdAt: '2026-07-16T22:00:00Z', link: '/reports' },
  { id: 'n_4', title: 'Q2 targets on track', message: 'Scope-2 emissions trending 6% below plan.', kind: 'success', read: true, createdAt: '2026-07-15T09:00:00Z' },
  { id: 'n_5', title: 'Upload failed', message: 'dublin-cooling-logs.csv could not be parsed.', kind: 'alert', read: true, createdAt: '2026-07-16T09:01:00Z', link: '/uploads' },
];
