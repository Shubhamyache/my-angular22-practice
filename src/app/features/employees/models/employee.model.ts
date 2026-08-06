export interface Employee {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  departmentId: number;
  departmentName: string;
  jobTitle: string;
  salary: number;
  hireDate: string;
  isActive: boolean;
  managerId: number | null;
  managerName: string | null;
  avatarUrl: string | null;
  /**
   * Not yet returned by the backend — see PartFourBEChanges.md/PartSixBEChangesNeeded.md.
   * `EmployeeDto` today has no way to tell whether this Employee record has a linked `User`
   * login account (UIIntegrationInfo.md §18 — there's no account-provisioning endpoint at all
   * yet). Optional so existing code reading `Employee` objects is unaffected; `undefined` is
   * treated as "unknown" by `EmployeeDetailComponent`'s Account Access panel, not as `false`.
   */
  hasLoginAccount?: boolean;
  /** Whether the linked `User` account can currently log in — `undefined` whenever
   *  `hasLoginAccount` isn't `true` (there's no account to have a status). Toggled by an Admin
   *  via EmployeeService.setAccountActive(); see PartSixBEChangesNeeded.md. */
  accountActive?: boolean;
  /** Whether the linked `User` has completed registration (successfully set a password) yet.
   *  `false` while an invite is outstanding — drives the "Resend Registration Email" action.
   *  `undefined` whenever `hasLoginAccount` isn't `true`. See PartSixBEChangesNeeded.md. */
  registrationCompleted?: boolean;
}

/** PartFourBEChanges.md — request for the (not yet built) account-provisioning endpoint. */
export interface CreateLoginAccountDto {
  role: 'Admin' | 'HR' | 'Manager' | 'Employee';
}

/** PartFourBEChanges.md — response for the (not yet built) account-provisioning endpoint. */
export interface LoginAccountResult {
  userId: number;
  email: string;
  role: string;
}

/** PartSixBEChangesNeeded.md — response for the (not yet built) activate/deactivate endpoint. */
export interface AccountStatusResult {
  userId: number;
  isActive: boolean;
}

export interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  departmentId: number;
  jobTitle: string;
  salary: number;
  hireDate: string;
  managerId?: number | null;
  avatarUrl?: string | null;
}

export interface UpdateEmployeeDto extends CreateEmployeeDto {
  isActive: boolean;
}

export interface EmployeeListFilter {
  page?: number;
  pageSize?: number;
  search?: string;
  departmentId?: number;
  isActive?: boolean;
  sortBy?: 'firstName' | 'lastName' | 'email' | 'hireDate' | 'salary' | 'departmentName' | 'employeeCode';
  sortDirection?: 'asc' | 'desc';
}
