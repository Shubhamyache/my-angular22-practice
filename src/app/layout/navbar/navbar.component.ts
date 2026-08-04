import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule],
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

  // ── Local UI state ────────────────────────────────────────────────────────
  protected readonly searchOpen       = signal(false);
  protected readonly notificationCount = signal(4);

  toggleMenu(): void  { this.menuToggled.emit(); }
  toggleSearch(): void { this.searchOpen.update(v => !v); }
  logout(): void { this.authService.logout(); }

  /** Returns the first character of the logged-in user's name for the avatar */
  protected get userInitial(): string {
    return (this.authService.getUserName() || 'A')[0].toUpperCase();
  }
}
