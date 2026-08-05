import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const EMPLOYEE_ROUTES: Routes = [
  {
    // List/search — Admin, HR, Manager (UIIntegrationInfo.md §13; Employee has no directory access)
    path: '',
    data: { roles: ['Admin', 'HR', 'Manager'] },
    canActivate: [roleGuard],
    loadComponent: () =>
      import('./employee-list/employee-list.component').then(c => c.EmployeeListComponent)
  },
  {
    // Create — Admin, HR only (Manager can view the directory but not create/edit/delete)
    path: 'create',
    data: { roles: ['Admin', 'HR'] },
    canActivate: [roleGuard],
    loadComponent: () =>
      import('./employee-form/employee-form.component').then(c => c.EmployeeFormComponent)
  },
  {
    // Detail — any authenticated role; Employee restricted to their own record via backend
    // 403 + component-level check (canViewEmployee), not a route-level role gate.
    path: ':id',
    loadComponent: () =>
      import('./employee-detail/employee-detail.component').then(c => c.EmployeeDetailComponent)
  },
  {
    path: ':id/edit',
    data: { roles: ['Admin', 'HR'] },
    canActivate: [roleGuard],
    loadComponent: () =>
      import('./employee-form/employee-form.component').then(c => c.EmployeeFormComponent)
  }
];
