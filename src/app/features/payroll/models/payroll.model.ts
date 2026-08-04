export type PayrollStatus = 'Pending' | 'Processed' | 'Paid' | 'Cancelled';

export interface Payroll {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  periodStart: string;
  periodEnd: string;
  grossSalary: number;
  deductions: number;
  netSalary: number;
  status: PayrollStatus;
  processedAt: string | null;
}
