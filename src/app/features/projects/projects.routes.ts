/**
 * ═══════════════════════════════════════════════════════════════════
 * PROJECTS FEATURE ROUTES — Lazy-Loaded Module Routes
 * ═══════════════════════════════════════════════════════════════════
 *
 * ROUTE PATTERN:
 * ───────────────
 * /projects          → List all projects
 * /projects/create   → Create new project
 * /projects/:id      → View project details
 * /projects/:id/edit → Edit existing project
 *
 * ORDER MATTERS:
 * ───────────────
 * Angular matches routes top-to-bottom. Put specific routes (like 'create')
 * BEFORE parameterized routes (like ':id'). Otherwise, Angular would treat
 * 'create' as an ID.
 *
 * ROLE GATING (UIIntegrationInfo.md §13):
 * ─────────────────────────────────────────
 * List/detail are open to any authenticated role — the backend itself scopes what a Manager
 * (own-managed projects) or Employee (member-of projects) actually sees/can open; a route
 * guard can't express that per-record nuance, only "can this role reach this screen at all."
 * Create/edit are role-gated to Admin/Manager (HR has read-only access to Projects per §13).
 */

import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const PROJECT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./project-list/project-list.component').then(c => c.ProjectListComponent)
  },
  {
    path: 'create',
    data: { roles: ['Admin', 'Manager'] },
    canActivate: [roleGuard],
    loadComponent: () =>
      import('./project-form/project-form.component').then(c => c.ProjectFormComponent)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./project-detail/project-detail.component').then(c => c.ProjectDetailComponent)
  },
  {
    path: ':id/edit',
    data: { roles: ['Admin', 'Manager'] },
    canActivate: [roleGuard],
    loadComponent: () =>
      import('./project-form/project-form.component').then(c => c.ProjectFormComponent)
  },
  {
    path: ':id/members',
    data: { roles: ['Admin', 'Manager'] },
    canActivate: [roleGuard],
    loadComponent: () =>
      import('./project-members/project-members.component').then(c => c.ProjectMembersComponent)
  }
];
