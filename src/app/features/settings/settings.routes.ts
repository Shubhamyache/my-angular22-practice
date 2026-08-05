import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

/**
 * SETTINGS routes — demonstrates a SECOND-LEVEL nested router-outlet.
 *
 * The SettingsShellComponent owns its own <router-outlet>.
 * Angular renders it inside the FIRST router-outlet (ShellComponent),
 * then renders each child route inside the SECOND router-outlet
 * (SettingsShellComponent).
 *
 * URL → Component tree:
 * /settings/general
 *   ShellComponent            (layout router-outlet #1)
 *     └─ SettingsShellComponent  (settings router-outlet #2)
 *          └─ GeneralSettingsComponent
 */
export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./settings-shell/settings-shell.component').then(c => c.SettingsShellComponent),
    children: [
      {
        // Admin-only per UIIntegrationInfo.md §13 (app-wide config). Also has no backend
        // endpoint yet at all — see §18 and general-settings.component.ts for the stub notice.
        path: 'general',
        data: { roles: ['Admin'] },
        canActivate: [roleGuard],
        loadComponent: () =>
          import('./general/general-settings.component').then(c => c.GeneralSettingsComponent)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./profile/profile-settings.component').then(c => c.ProfileSettingsComponent)
      },
      {
        path: 'security',
        loadComponent: () =>
          import('./security/security-settings.component').then(c => c.SecuritySettingsComponent)
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./notifications/notifications-settings.component').then(c => c.NotificationsSettingsComponent)
      },
      {
        path: 'preferences',
        loadComponent: () =>
          import('./preferences/preferences-settings.component').then(c => c.PreferencesSettingsComponent)
      },
      { path: '', redirectTo: 'general', pathMatch: 'full' }
    ]
  }
];
