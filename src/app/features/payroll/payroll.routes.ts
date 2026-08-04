import { Routes } from '@angular/router';

export const PAYROLL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./payroll-list/payroll-list.component').then(c => c.PayrollListComponent)
  }
];
