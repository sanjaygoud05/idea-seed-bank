export type ReportType = 'esg' | 'ghg-inventory' | 'cdp' | 'gri' | 'internal';
export type ReportStatus = 'draft' | 'in-review' | 'published';

export interface Report {
  id: string;
  title: string;
  type: ReportType;
  status: ReportStatus;
  periodLabel: string;
  createdAt: string;
  updatedAt: string;
  author: string;
}
