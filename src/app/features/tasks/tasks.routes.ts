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
 */

import { Routes } from '@angular/router';

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
    loadComponent: () =>
      import('./task-form/task-form.component').then(c => c.TaskFormComponent)
  }
];
