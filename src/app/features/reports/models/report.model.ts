export type ReportCategory = 'HR' | 'Payroll' | 'Compliance';

export interface ReportDto {
  id: string;
  name: string;
  description: string | null;
  category: ReportCategory;
  isActive: boolean;
}

export interface GenerateReportRequest {
  parameters: Record<string, string> | null;
}
