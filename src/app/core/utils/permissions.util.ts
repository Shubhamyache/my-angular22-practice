import { CurrentUserDto } from '../models/auth.model';

/**
 * Record-level ("ownership-scoped") permission checks, per UIIntegrationInfo.md §13.
 *
 * Route-level RoleGuard only expresses coarse role gates ("can a Manager navigate to the
 * project-edit route at all") — it cannot know whether *this specific* project belongs to
 * *this specific* Manager. These functions fill that gap for component-level UI decisions
 * (e.g. hiding an Edit button on someone else's project). The backend re-checks all of this
 * server-side regardless (returning 403 if bypassed) — these are UX-only, not a security
 * boundary.
 */

export function isAdmin(user: CurrentUserDto | null): boolean {
  return user?.role === 'Admin';
}

export function isHR(user: CurrentUserDto | null): boolean {
  return user?.role === 'HR';
}

export function isManager(user: CurrentUserDto | null): boolean {
  return user?.role === 'Manager';
}

export function isEmployee(user: CurrentUserDto | null): boolean {
  return user?.role === 'Employee';
}

/** Employees: view detail — Admin/HR/Manager see any record; Employee only their own. */
export function canViewEmployee(employeeId: number, user: CurrentUserDto | null): boolean {
  if (!user) return false;
  if (user.role === 'Admin' || user.role === 'HR' || user.role === 'Manager') return true;
  return user.employeeId === employeeId;
}

/** Projects: edit/delete/manage-members — Admin (any), Manager (only projects they manage). */
export function canEditProject(projectManagerId: number, user: CurrentUserDto | null): boolean {
  if (!user) return false;
  if (user.role === 'Admin') return true;
  if (user.role === 'Manager') return user.employeeId === projectManagerId;
  return false;
}

/** Tasks: create/edit/delete — Admin (any), Manager (only tasks within projects they manage). */
export function canEditTask(taskProjectManagerId: number, user: CurrentUserDto | null): boolean {
  return canEditProject(taskProjectManagerId, user);
}

/** Tasks: change status (Kanban drag) — Admin, Manager (own project), Employee (own assignment). */
export function canChangeTaskStatus(
  taskAssigneeId: number,
  taskProjectManagerId: number,
  user: CurrentUserDto | null
): boolean {
  if (!user) return false;
  if (user.role === 'Admin') return true;
  if (user.role === 'Manager') return user.employeeId === taskProjectManagerId;
  if (user.role === 'Employee') return user.employeeId === taskAssigneeId;
  return false;
}

/** Payroll: view history — Admin/HR (any employee), Employee (only their own). */
export function canViewPayrollHistory(employeeId: number, user: CurrentUserDto | null): boolean {
  if (!user) return false;
  if (user.role === 'Admin' || user.role === 'HR') return true;
  return user.employeeId === employeeId;
}
