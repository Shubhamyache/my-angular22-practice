import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface SettingsTab {
  label: string;
  icon:  string;
  route: string;
  roles?: string[];
}

const TABS: SettingsTab[] = [
  { label: 'General',       icon: 'bi-sliders',          route: 'general', roles: ['Admin'] },
  { label: 'Profile',       icon: 'bi-person-circle',    route: 'profile' },
  { label: 'Security',      icon: 'bi-shield-lock-fill', route: 'security' },
  { label: 'Notifications', icon: 'bi-bell-fill',        route: 'notifications' },
  { label: 'Preferences',   icon: 'bi-gear-fill',        route: 'preferences' }
];

@Component({
  selector: 'app-settings-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule],
  templateUrl: './settings-shell.component.html'
})
export class SettingsShellComponent {
  private readonly authService = inject(AuthService);

  /** Hides the General tab for non-Admins — previously shown to everyone, but clicking it as a
   *  non-Admin silently redirected to /dashboard via roleGuard (settings.routes.ts), which reads
   *  as a broken link rather than a permissions boundary. */
  protected readonly tabs: SettingsTab[] = TABS.filter(
    tab => !tab.roles || tab.roles.includes(this.authService.getUserRole())
  );
}
