import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NotificationBellComponent } from '../../features/notifications/notification-bell/notification-bell.component';
import { GlobalSearchComponent } from '../../features/search/global-search/global-search.component';
import { ProfileMenuComponent } from './profile-menu/profile-menu.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, NotificationBellComponent, GlobalSearchComponent, ProfileMenuComponent],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  // ── Inputs from ShellComponent ────────────────────────────────────────────
  readonly menuToggled = output<void>();
  readonly pageTitle   = input<string>('Dashboard');
  readonly pageIcon    = input<string>('bi-speedometer2');
  readonly sidebarOpen = input<boolean>(true);

  // ── Local UI state ────────────────────────────────────────────────────────
  protected readonly searchOpen = signal(false);

  toggleMenu(): void  { this.menuToggled.emit(); }
  toggleSearch(): void { this.searchOpen.update(v => !v); }
}
