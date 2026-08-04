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
 */

import { Routes } from '@angular/router';

export const PROJECT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./project-list/project-list.component').then(c => c.ProjectListComponent)
  },
  {
    path: 'create',
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
    loadComponent: () =>
      import('./project-form/project-form.component').then(c => c.ProjectFormComponent)
  }
];
