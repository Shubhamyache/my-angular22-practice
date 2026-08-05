export type TaskStatus   = 'Todo' | 'InProgress' | 'InReview' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Task {
  id:              number;
  title:           string;
  description:     string | null;
  status:          TaskStatus;
  priority:        TaskPriority;
  projectId:       number;
  projectName:     string;
  assigneeId:      number;
  assigneeName:    string;
  assigneeInitial: string;
  dueDate:         string;
  estimatedHours:  number;
  loggedHours:     number;
  createdAt:       string;
  tags:            string[];
}

export interface CreateTaskDto {
  title:          string;
  description?:   string;
  priority:       TaskPriority;
  projectId:      number;
  assigneeId:     number;
  dueDate:        string;
  estimatedHours: number;
  tags?:          string[];
}

export interface UpdateTaskDto extends CreateTaskDto {
  loggedHours: number;
  status:      TaskStatus;
}

export interface PatchTaskStatusDto {
  status: TaskStatus;
}

export interface TaskListFilter {
  page?: number;
  pageSize?: number;
  search?: string;
  projectId?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  sortBy?: 'title' | 'dueDate' | 'priority' | 'status' | 'estimatedHours';
  sortDirection?: 'asc' | 'desc';
}
