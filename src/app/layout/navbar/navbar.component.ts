import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AuthFeatureService } from '../../features/auth/services/auth-feature.service';
import { NotificationBellComponent } from '../../features/notifications/notification-bell/notification-bell.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, NotificationBellComponent],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  // ── Inputs from ShellComponent ────────────────────────────────────────────
  readonly menuToggled = output<void>();
  readonly pageTitle   = input<string>('Dashboard');
  readonly pageIcon    = input<string>('bi-speedometer2');
  readonly sidebarOpen = input<boolean>(true);

  // ── Services ──────────────────────────────────────────────────────────────
  protected readonly authService = inject(AuthService);
  private readonly authFeatureService = inject(AuthFeatureService);

  // ── Local UI state ────────────────────────────────────────────────────────
  protected readonly searchOpen = signal(false);

  toggleMenu(): void  { this.menuToggled.emit(); }
  toggleSearch(): void { this.searchOpen.update(v => !v); }

  /**
   * Calls the real POST /auth/logout (revokes the refresh token server-side) before clearing
   * local session state — previously called AuthService.logout() directly, which only ever
   * did the local half.
   */
  logout(): void {
    this.authFeatureService.logout().subscribe();
  }

  /** Returns the first character of the logged-in user's name for the avatar */
  protected get userInitial(): string {
    return (this.authService.getUserName() || 'A')[0].toUpperCase();
  }
}
