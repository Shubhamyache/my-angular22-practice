export interface Employee {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  departmentId: number;
  department: string;
  jobTitle: string;
  salary: number;
  hireDate: string;
  isActive: boolean;
  managerId: number | null;
  avatarUrl?: string;
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
  managerId?: number;
}

export type UpdateEmployeeDto = Partial<CreateEmployeeDto>;
