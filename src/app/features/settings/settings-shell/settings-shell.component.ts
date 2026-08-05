import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

interface SettingsTab {
  label: string;
  icon:  string;
  route: string;
}

@Component({
  selector: 'app-settings-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule],
  templateUrl: './settings-shell.component.html'
})
export class SettingsShellComponent {
  // General is viewable by every role now (PartTwoUIIntegration.md §8 — only the Save action is
  // Admin-gated, inside GeneralSettingsComponent itself), so no role filtering needed here.
  protected readonly tabs: SettingsTab[] = [
    { label: 'General',       icon: 'bi-sliders',          route: 'general' },
    { label: 'Profile',       icon: 'bi-person-circle',    route: 'profile' },
    { label: 'Security',      icon: 'bi-shield-lock-fill', route: 'security' },
    { label: 'Notifications', icon: 'bi-bell-fill',        route: 'notifications' },
    { label: 'Preferences',   icon: 'bi-gear-fill',        route: 'preferences' }
  ];
}
