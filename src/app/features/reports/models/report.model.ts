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

/** Matches EMS.Domain.Enums.ReportExportFormat — sent as the `format` query param on generate. */
export type ReportExportFormat = 'Pdf' | 'Xlsx';

/** Same dataset a download produces, as JSON — powers the report preview modal. */
export interface ReportPreviewDto {
  title: string;
  headers: string[];
  rows: string[][];
}
