import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

interface SettingsTab {
  label: string;
  icon:  string;
  route: string;
}

@Component({
  selector: 'app-settings-shell',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './settings-shell.component.html'
})
export class SettingsShellComponent {
  protected readonly tabs: SettingsTab[] = [
    { label: 'General',       icon: 'bi-sliders',          route: 'general' },
    { label: 'Profile',       icon: 'bi-person-circle',    route: 'profile' },
    { label: 'Security',      icon: 'bi-shield-lock-fill', route: 'security' },
    { label: 'Notifications', icon: 'bi-bell-fill',        route: 'notifications' },
    { label: 'Preferences',   icon: 'bi-gear-fill',        route: 'preferences' }
  ];
}
