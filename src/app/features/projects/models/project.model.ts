export type ProjectStatus   = 'Active' | 'OnHold' | 'Completed' | 'Cancelled';
export type ProjectPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Project {
  id:          number;
  name:        string;
  code:        string;
  description: string;
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
  description: string;
  priority:    ProjectPriority;
  managerId:   number;
  startDate:   string;
  endDate:     string;
  budget:      number;
}
