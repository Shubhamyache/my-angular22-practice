import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

/**
 * Create/edit are role-gated to Admin/HR (UIIntegrationInfo.md §13 — Manager/Employee are
 * view-only on Departments), same pattern as PROJECT_ROUTES.
 */
export const DEPARTMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./department-list/department-list.component').then(c => c.DepartmentListComponent)
  },
  {
    path: 'create',
    data: { roles: ['Admin', 'HR'] },
    canActivate: [roleGuard],
    loadComponent: () =>
      import('./department-form/department-form.component').then(c => c.DepartmentFormComponent)
  },
  {
    path: ':id/edit',
    data: { roles: ['Admin', 'HR'] },
    canActivate: [roleGuard],
    loadComponent: () =>
      import('./department-form/department-form.component').then(c => c.DepartmentFormComponent)
  }
];
