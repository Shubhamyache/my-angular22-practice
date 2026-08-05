export type ProjectStatus   = 'Planning' | 'Active' | 'OnHold' | 'Completed' | 'Cancelled';
export type ProjectPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Project {
  id:          number;
  name:        string;
  code:        string;
  description: string | null;
  status:      ProjectStatus;
  priority:    ProjectPriority;
  managerId:   number;
  managerName: string;
  teamSize:    number;
  startDate:   string;
  endDate:     string;
  progress:    number;   // 0–100
  budget:      number;
  spent:       number;
  tags:        string[];
}

export interface CreateProjectDto {
  name:        string;
  code:        string;
  description?: string;
  priority:    ProjectPriority;
  managerId:   number;
  startDate:   string;
  endDate:     string;
  budget:      number;
  tags?:       string[];
}

export interface UpdateProjectDto extends CreateProjectDto {
  status:   ProjectStatus;
  progress: number;
  spent:    number;
}

export interface ProjectListFilter {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  sortBy?: 'name' | 'code' | 'startDate' | 'endDate' | 'budget' | 'progress' | 'priority';
  sortDirection?: 'asc' | 'desc';
}

export interface AddProjectMemberDto {
  employeeId: number;
}
