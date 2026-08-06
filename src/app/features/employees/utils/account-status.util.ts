import { Employee } from '../models/employee.model';

export type AccountStatus = 'unknown' | 'none' | 'pending' | 'active' | 'deactivated';

/** Single source of truth for deriving login-account status from an Employee, shared by
 *  EmployeeDetailComponent's Account Access panel and EmployeeListComponent's status badge —
 *  see employee.model.ts's docblock on hasLoginAccount/accountActive/registrationCompleted for
 *  why these fields are all optional (not yet returned by the backend). */
export function getAccountStatus(emp: Employee): AccountStatus {
  if (emp.hasLoginAccount === undefined) return 'unknown';
  if (!emp.hasLoginAccount) return 'none';
  if (emp.registrationCompleted === false) return 'pending';
  if (emp.accountActive === false) return 'deactivated';
  return 'active';
}

export const ACCOUNT_STATUS_BADGE: Record<AccountStatus, { label: string; badgeClass: string; icon: string }> = {
  unknown:     { label: 'Unknown',   badgeClass: 'bg-light text-dark border', icon: 'bi-question-circle' },
  none:        { label: 'No Login',  badgeClass: 'bg-light text-dark border', icon: 'bi-person-x' },
  pending:     { label: 'Pending',   badgeClass: 'bg-warning text-dark',      icon: 'bi-hourglass-split' },
  active:      { label: 'Active',    badgeClass: 'bg-success',                icon: 'bi-check-circle-fill' },
  deactivated: { label: 'Deactivated', badgeClass: 'bg-danger',               icon: 'bi-x-circle-fill' }
};
