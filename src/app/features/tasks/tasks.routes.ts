/**
 * ═══════════════════════════════════════════════════════════════════
 * TASKS FEATURE ROUTES — List, Board, Create, Edit, Detail
 * ═══════════════════════════════════════════════════════════════════
 *
 * /tasks           → Task list view
 * /tasks/board     → Kanban board view
 * /tasks/create    → Create new task
 * /tasks/:id       → Task detail
 * /tasks/:id/edit  → Edit task
 *
 * ROLE GATING (UIIntegrationInfo.md §13): list/board/detail are open to any authenticated
 * role (server-side scoped — Manager sees own-project tasks, Employee sees assigned/member-of
 * tasks). Create/edit are role-gated to Admin/Manager (HR is read-only on Tasks per §13).
 * Status changes (Kanban drag) are NOT route-gated at all — Employees can patch the status of
 * their own assigned tasks, which is a per-record check (canChangeTaskStatus), not a role gate.
 */

import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const TASK_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./task-list/task-list.component').then(c => c.TaskListComponent)
  },
  {
    path: 'board',
    loadComponent: () =>
      import('./task-board/task-board.component').then(c => c.TaskBoardComponent)
  },
  {
    path: 'create',
    data: { roles: ['Admin', 'Manager'] },
    canActivate: [roleGuard],
    loadComponent: () =>
      import('./task-form/task-form.component').then(c => c.TaskFormComponent)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./task-detail/task-detail.component').then(c => c.TaskDetailComponent)
  },
  {
    path: ':id/edit',
    data: { roles: ['Admin', 'Manager'] },
    canActivate: [roleGuard],
    loadComponent: () =>
      import('./task-form/task-form.component').then(c => c.TaskFormComponent)
  }
];
