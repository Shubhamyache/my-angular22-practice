import { Employee } from '../../employees/models/employee.model';
import { Project } from '../../projects/models/project.model';
import { Task } from '../../tasks/models/task.model';

/**
 * ═══════════════════════════════════════════════════════════════════
 * RAW BACKEND DTOs — exactly what GET /api/v1/dashboard returns
 * ═══════════════════════════════════════════════════════════════════
 * Per UIIntegrationInfo.md §5/§4 (Dashboard): `recentEmployees`/`recentProjects`/`recentTasks`
 * are full `EmployeeDto[]`/`ProjectDto[]`/`TaskDto[]` — NOT the slim per-widget projections
 * (`RecentEmployee`/`RecentProject`/`RecentTask` below) that this app's dashboard widgets were
 * originally built against while running on mock data. The backend has no `initials`/`color`
 * fields at all (those were a mock-data-only convenience), and `changePercent` replaces the
 * mock's `employeeChange`/`projectChange`/etc.
 *
 * Rather than reshaping the widget components (which would violate "preserve the UI exactly"),
 * `DashboardService` adapts these raw DTOs into the unchanged `DashboardSummary` shape below —
 * see the adapter functions in dashboard.service.ts for the full rationale.
 */
export interface DashboardStatDto {
  value: number;
  changePercent: number;
}

export interface DashboardStatsDto {
  headcount: DashboardStatDto;
  activeProjects: DashboardStatDto;
  pendingTasks: DashboardStatDto;
  departments: DashboardStatDto;
}

export interface DashboardSummaryDto {
  stats: DashboardStatsDto;
  recentEmployees: Employee[];
  recentProjects: Project[];
  recentTasks: Task[];
  lastUpdated: string;
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * WIDGET-FACING PROJECTIONS — unchanged public contract of the dashboard widgets
 * ═══════════════════════════════════════════════════════════════════
 * These are exactly what they were before backend integration. Every dashboard widget
 * component (`stats-card`, `recent-employees`, `recent-projects`, `recent-tasks`,
 * `quick-actions`) keeps reading these shapes — only `DashboardService` changes.
 */

// ── Statistics (the four KPI cards at the top) ───────────────────
export interface DashboardStats {
  totalEmployees:   number;
  employeeChange:   number;   // +5.2 means grew 5.2% vs last month
  activeProjects:   number;
  projectChange:    number;
  pendingTasks:     number;
  taskChange:       number;   // negative = fewer pending tasks (good)
  totalDepartments: number;
  departmentChange: number;
}

export type EmployeeStatus = 'Active' | 'Inactive' | 'OnLeave';
export type ProjectStatus  = 'Planning' | 'Active' | 'OnHold' | 'Completed' | 'Cancelled';
export type TaskStatus     = 'Todo' | 'InProgress' | 'InReview' | 'Done';
export type Priority       = 'Low' | 'Medium' | 'High' | 'Critical';

// ── Dashboard Projections ─────────────────────────────────────────

export interface RecentEmployee {
  id:         string;
  name:       string;
  jobTitle:   string;
  department: string;
  initials:   string;   // Client-computed from firstName/lastName — the backend doesn't send this
  color:      string;   // Bootstrap token — client-assigned deterministically from the employee id
  joinDate:   Date;
  status:     EmployeeStatus;
}

export interface RecentProject {
  id:       string;
  name:     string;
  status:   ProjectStatus;
  priority: Priority;
  progress: number;     // 0–100 (% complete)
  dueDate:  Date;
  teamSize: number;
  budget:   number;     // USD
}

export interface RecentTask {
  id:               string;
  title:            string;
  status:           TaskStatus;
  priority:         Priority;
  assignee:         string;
  assigneeInitials: string;
  assigneeColor:    string;   // Bootstrap color token — client-assigned, see RecentEmployee.color
  dueDate:          Date;
  projectName:      string;
}

export interface QuickAction {
  label:       string;
  icon:        string;        // Bootstrap Icons class e.g. 'bi-person-plus-fill'
  route:       string;
  color:       string;        // Bootstrap color token
  description: string;
}

// ── Root Aggregate — the shape every dashboard widget consumes ────
export interface DashboardSummary {
  stats:           DashboardStats;
  recentEmployees: RecentEmployee[];
  recentProjects:  RecentProject[];
  recentTasks:     RecentTask[];
  lastUpdated:     Date;
}
