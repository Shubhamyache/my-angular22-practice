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
