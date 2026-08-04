export interface Department {
  id: number;
  name: string;
  code: string;
  managerId: number | null;
  managerName?: string;
  employeeCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateDepartmentDto {
  name: string;
  code: string;
  managerId?: number;
}
