import { Routes } from '@angular/router';

export const EMPLOYEE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./employee-list/employee-list.component').then(c => c.EmployeeListComponent)
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./employee-form/employee-form.component').then(c => c.EmployeeFormComponent)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./employee-detail/employee-detail.component').then(c => c.EmployeeDetailComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./employee-form/employee-form.component').then(c => c.EmployeeFormComponent)
  }
];
