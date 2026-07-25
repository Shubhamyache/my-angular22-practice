export type TaskStatus   = 'Todo' | 'InProgress' | 'InReview' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Task {
  id:             number;
  title:          string;
  description:    string;
  status:         TaskStatus;
  priority:       TaskPriority;
  projectId:      number;
  projectName:    string;
  assigneeId:     number;
  assigneeName:   string;
  assigneeInitial: string;
  dueDate:        string;
  estimatedHours: number;
  loggedHours:    number;
  tags:           string[];
  createdAt:      string;
}

export interface CreateTaskDto {
  title:          string;
  description:    string;
  priority:       TaskPriority;
  projectId:      number;
  assigneeId:     number;
  dueDate:        string;
  estimatedHours: number;
}
