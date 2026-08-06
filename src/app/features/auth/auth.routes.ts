import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then(c => c.LoginComponent)
  },
  {
    // Landing page for a "create login access" registration email (?token=...) — see
    // set-password.component.ts's docblock for how this ties into
    // EmployeeService.createLoginAccount, and how it shares SetPasswordComponent with the
    // reset-password route below rather than duplicating the form.
    path: 'register',
    data: { mode: 'register' },
    loadComponent: () =>
      import('./set-password/set-password.component').then(c => c.SetPasswordComponent)
  },
  {
    // Landing page for a "forgot password" email (?token=...) — same component/backend call as
    // 'register' above, different copy. See ForgotPasswordComponent for where the email gets
    // triggered.
    path: 'reset-password',
    data: { mode: 'reset' },
    loadComponent: () =>
      import('./set-password/set-password.component').then(c => c.SetPasswordComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./forgot-password/forgot-password.component').then(c => c.ForgotPasswordComponent)
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
