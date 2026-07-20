export type RecommendationCategory = 'energy' | 'water' | 'waste' | 'carbon' | 'operations';
export type RecommendationImpact = 'low' | 'medium' | 'high';

export interface AIRecommendation {
  id: string;
  title: string;
  summary: string;
  category: RecommendationCategory;
  impact: RecommendationImpact;
  estimatedCo2eSavingTonnes: number;
  estimatedAnnualSavingUsd: number;
  confidence: number; // 0-1
  createdAt: string;
  facilityId?: string;
}
