export interface Department {
  id: number;
  name: string;
  code: string;
  managerId: number | null;
  managerName: string | null;
  isActive: boolean;
  employeeCount: number;
}

export interface CreateDepartmentDto {
  name: string;
  code: string;
  managerId: number | null;
}

export interface UpdateDepartmentDto extends CreateDepartmentDto {
  isActive: boolean;
}
