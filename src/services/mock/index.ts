import {
  mockCompany, mockFacilities, mockCarbon, mockEnergy,
  mockWater, mockWaste, mockRecommendations, mockReports, mockNotifications,
} from './data';
import type {
  Company, Facility, CarbonMetric, EnergyMetric,
  WaterMetric, WasteMetric, AIRecommendation, Report, Notification,
} from '@/types';

const delay = <T>(value: T, ms = 120): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

// TODO: swap these mocks for Express + GraphQL (Apollo) resolvers backed by Prisma / Neon.
export const getCompany = (): Promise<Company> => delay(mockCompany);
export const listFacilities = (): Promise<Facility[]> => delay(mockFacilities);
export const listCarbonMetrics = (): Promise<CarbonMetric[]> => delay(mockCarbon);
export const listEnergyMetrics = (): Promise<EnergyMetric[]> => delay(mockEnergy);
export const listWaterMetrics = (): Promise<WaterMetric[]> => delay(mockWater);
export const listWasteMetrics = (): Promise<WasteMetric[]> => delay(mockWaste);
export const listRecommendations = (): Promise<AIRecommendation[]> => delay(mockRecommendations);
export const listReports = (): Promise<Report[]> => delay(mockReports);
export const listNotifications = (): Promise<Notification[]> => delay(mockNotifications);

export * from './data';
