import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // ── Public routes (no auth) ───────────────────────────────────────────────
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(r => r.AUTH_ROUTES)
  },

  // ── Protected routes (behind authGuard + Shell layout) ───────────────────
  {
    path: '',
    loadComponent: () =>
      import('./layout/shell/shell.component').then(c => c.ShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(r => r.DASHBOARD_ROUTES)
      },
      {
        path: 'employees',
        loadChildren: () =>
          import('./features/employees/employees.routes').then(r => r.EMPLOYEE_ROUTES)
      },
      {
        path: 'departments',
        loadChildren: () =>
          import('./features/departments/departments.routes').then(r => r.DEPARTMENT_ROUTES)
      },
      {
        path: 'payroll',
        loadChildren: () =>
          import('./features/payroll/payroll.routes').then(r => r.PAYROLL_ROUTES)
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./features/reports/reports.routes').then(r => r.REPORT_ROUTES)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // ── Fallback ──────────────────────────────────────────────────────────────
  { path: '**', redirectTo: 'auth/login' }
];
