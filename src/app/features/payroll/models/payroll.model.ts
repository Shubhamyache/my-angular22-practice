export type PayrollStatus = 'Pending' | 'Processed' | 'Paid' | 'Cancelled';

export interface Payroll {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  departmentName: string;
  periodStart: string;
  periodEnd: string;
  grossSalary: number;
  deductions: number;
  netSalary: number;
  status: PayrollStatus;
  processedAt: string | null;
  processedBy: number | null;
  processedByName: string | null;
}

export interface GeneratePayrollRequest {
  periodStart: string;
  periodEnd: string;
}

export interface GeneratePayrollResultDto {
  generatedCount: number;
  skippedCount: number;
}

export interface PayrollListFilter {
  page?: number;
  pageSize?: number;
  status?: PayrollStatus;
  periodStart?: string;
  periodEnd?: string;
  sortBy?: 'employeeName' | 'departmentName' | 'periodStart' | 'grossSalary' | 'deductions' | 'netSalary' | 'status';
  sortDirection?: 'asc' | 'desc';
}

export type PayrollSortField = NonNullable<PayrollListFilter['sortBy']>;
