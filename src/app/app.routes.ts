import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

/**
 * ROOT ROUTE TABLE
 * ─────────────────────────────────────────────────────────────────────────────
 * Angular evaluates routes TOP-TO-BOTTOM and stops at the FIRST match.
 * The order here matters:
 *   1. /auth  → public, no guard
 *   2. ''     → ShellComponent (protected), all child routes live here
 *   3. **     → wildcard fallback — must be LAST
 *
 * loadComponent / loadChildren use dynamic import().
 * The browser only downloads that JavaScript bundle the FIRST time
 * the user navigates to that path — this is Lazy Loading.
 */
export const routes: Routes = [

  // ── 1. PUBLIC — no auth required ─────────────────────────────────────────
  {
    path: 'auth',
    // loadChildren returns a ROUTE ARRAY (not a module).
    // Angular merges AUTH_ROUTES as children under /auth.
    loadChildren: () =>
      import('./features/auth/auth.routes').then(r => r.AUTH_ROUTES)
  },

  // ── 2. PROTECTED — behind ShellComponent + authGuard ─────────────────────
  {
    path: '',
    // loadComponent lazy-loads a single standalone component.
    // ShellComponent contains the Navbar, Sidebar, and the
    // primary <router-outlet> where child routes render.
    loadComponent: () =>
      import('./layout/shell/shell.component').then(c => c.ShellComponent),

    // canActivate runs BEFORE the component is created.
    // If authGuard returns false/UrlTree, Angular redirects immediately
    // and never instantiates ShellComponent or any child.
    canActivate: [authGuard],

    children: [

      // ── Dashboard ────────────────────────────────────────────────────────
      {
        path: 'dashboard',
        data: { title: 'Dashboard', icon: 'bi-speedometer2' },
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(r => r.DASHBOARD_ROUTES)
      },

      // ── Employees ────────────────────────────────────────────────────────
      {
        path: 'employees',
        data: { title: 'Employees', icon: 'bi-people-fill' },
        loadChildren: () =>
          import('./features/employees/employees.routes').then(r => r.EMPLOYEE_ROUTES)
      },

      // ── Projects ─────────────────────────────────────────────────────────
      {
        path: 'projects',
        data: { title: 'Projects', icon: 'bi-kanban-fill' },
        loadChildren: () =>
          import('./features/projects/projects.routes').then(r => r.PROJECT_ROUTES)
      },

      // ── Tasks (child routes: /tasks and /tasks/board) ─────────────────────
      // Demonstrates that lazy-loaded feature chunks can contain
      // their own nested child routes.
      {
        path: 'tasks',
        data: { title: 'Tasks', icon: 'bi-check2-square' },
        loadChildren: () =>
          import('./features/tasks/tasks.routes').then(r => r.TASK_ROUTES)
      },

      // ── Departments ──────────────────────────────────────────────────────
      {
        path: 'departments',
        data: { title: 'Departments', icon: 'bi-diagram-3-fill' },
        loadChildren: () =>
          import('./features/departments/departments.routes').then(r => r.DEPARTMENT_ROUTES)
      },

      // ── Payroll (role-guarded: Admin or HR only) ──────────────────────────
      // canActivate runs on EVERY navigation to /payroll.
      // roleGuard reads route.data.roles and compares to JWT claim.
      {
        path: 'payroll',
        data: { title: 'Payroll', icon: 'bi-cash-coin', roles: ['Admin', 'HR'] },
        canActivate: [roleGuard],
        loadChildren: () =>
          import('./features/payroll/payroll.routes').then(r => r.PAYROLL_ROUTES)
      },

      // ── Reports ───────────────────────────────────────────────────────────
      {
        path: 'reports',
        data: { title: 'Reports', icon: 'bi-bar-chart-fill' },
        loadChildren: () =>
          import('./features/reports/reports.routes').then(r => r.REPORT_ROUTES)
      },

      // ── Notifications (reached mainly via the navbar bell's "View All") ──
      {
        path: 'notifications',
        data: { title: 'Notifications', icon: 'bi-bell-fill' },
        loadChildren: () =>
          import('./features/notifications/notifications.routes').then(r => r.NOTIFICATION_ROUTES)
      },

      // ── Settings (nested router-outlet: /settings/general etc.) ───────────
      // Demonstrates two-level router-outlet nesting.
      // SettingsShellComponent has its OWN <router-outlet> inside it.
      {
        path: 'settings',
        data: { title: 'Settings', icon: 'bi-gear-fill' },
        loadChildren: () =>
          import('./features/settings/settings.routes').then(r => r.SETTINGS_ROUTES)
      },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // ── 3. WILDCARD — catch-all, must be LAST ─────────────────────────────────
  // If no route above matches the URL, redirect to login.
  // Placed last because Angular stops at the first match.
  { path: '**', redirectTo: 'auth/login' }
];
