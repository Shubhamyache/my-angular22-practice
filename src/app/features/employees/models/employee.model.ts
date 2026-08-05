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
   * Not yet returned by the backend — see PartFourBEChanges.md. `EmployeeDto` today has no way
   * to tell whether this Employee record has a linked `User` login account
   * (UIIntegrationInfo.md §18 — there's no account-provisioning endpoint at all yet). Optional
   * so existing code reading `Employee` objects is unaffected; `undefined` is treated as
   * "unknown" by `EmployeeDetailComponent`'s Login Access panel, not as `false`.
   */
  hasLoginAccount?: boolean;
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
