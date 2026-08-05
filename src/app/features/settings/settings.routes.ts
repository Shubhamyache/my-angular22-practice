import { Routes } from '@angular/router';

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
        // View is open to any authenticated user; only the Save action inside the component is
        // Admin-gated (PartTwoUIIntegration.md §8 — "don't gate the route itself, just the Save
        // button/form submit for non-Admins"). GeneralSettingsComponent disables the form for
        // non-Admins rather than the route refusing to render.
        path: 'general',
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
      // 'profile' — a reasonable default landing tab for every role now that General no longer
      // route-guards non-Admins away (it renders read-only for them instead, see above).
      { path: '', redirectTo: 'profile', pathMatch: 'full' }
    ]
  }
];
