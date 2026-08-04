/**
 * ═══════════════════════════════════════════════════════════════════
 * DASHBOARD DOMAIN MODELS
 * ═══════════════════════════════════════════════════════════════════
 *
 * WHY SEPARATE MODELS? — The Projection Pattern
 * ───────────────────────────────────────────────
 * The full Employee entity has 25+ fields. The full Project entity has
 * 30+ fields. The dashboard only needs 5–8 fields from each entity
 * to render its summary cards and lists.
 *
 * Instead of reusing the full entity type (which would couple features),
 * we define a PROJECTION — a minimal interface containing only the
 * fields THIS feature needs.
 *
 * Benefits:
 *  1. DECOUPLING    — Dashboard does not import from Employee/Project feature
 *  2. PERFORMANCE   — API sends less data (avoids over-fetching)
 *  3. SINGLE RESPONSIBILITY — Each type has one focused purpose
 *  4. TESTABILITY   — Easy to create minimal mock data for tests
 *
 * .NET 10 Backend Mapping (future integration):
 * ──────────────────────────────────────────────
 *   DashboardSummary   ←→   DashboardSummaryDto   (C# record)
 *   RecentEmployee     ←→   RecentEmployeeDto
 *   RecentProject      ←→   RecentProjectDto
 *   RecentTask         ←→   RecentTaskDto
 *
 * The C# endpoint:
 *   GET /api/dashboard  →  returns DashboardSummaryDto
 *   Uses a single SQL query with multiple JOINs (no N+1 problem).
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

// ── Union Types (preferred over numeric enums in Angular) ─────────
/**
 * WHY STRING UNION TYPES instead of TypeScript enums?
 * ─────────────────────────────────────────────────────
 * enum EmployeeStatus { Active = 0, Inactive = 1 }
 *   → JSON from .NET: { "status": 0 }  — requires a mapping layer
 *   → Not self-documenting in DevTools
 *
 * type EmployeeStatus = 'Active' | 'Inactive' | 'OnLeave'
 *   → JSON from .NET: { "status": "Active" } — maps directly
 *   → TypeScript enforces valid values at compile time
 *   → Self-documenting in logs, DevTools, and UI
 */
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
  initials:   string;   // Pre-computed server-side: 'Sarah Johnson' → 'SJ'
  color:      string;   // Bootstrap token: 'primary'|'success'|'info'|'warning'|'danger'
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
  assigneeColor:    string;   // Bootstrap color token
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

// ── Root Aggregate — maps 1:1 to GET /api/dashboard response ─────
export interface DashboardSummary {
  stats:           DashboardStats;
  recentEmployees: RecentEmployee[];
  recentProjects:  RecentProject[];
  recentTasks:     RecentTask[];
  lastUpdated:     Date;
}
