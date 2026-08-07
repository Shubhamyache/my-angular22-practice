/**
 * ═══════════════════════════════════════════════════════════════════
 * PROFILE MENU — dropdown panel under the navbar avatar
 * ═══════════════════════════════════════════════════════════════════
 * Settings and Logout used to be two separate always-visible controls in the navbar. Grouping
 * them behind the avatar keeps the navbar's right side from growing a new button every time an
 * account-level action is added, and matches the click-outside-to-close pattern this app already
 * uses for NotificationBellComponent (own ElementRef + HostListener('document:click'), no
 * Bootstrap JS dependency needed).
 *
 * AVATAR: shows the real photo when CurrentUserDto.avatarUrl is set, otherwise falls back to
 * initials built from the full name via getInitials() — e.g. "Nitish Reddy" → "NR", not just
 * the single-letter "N" the old navbar showed.
 */
import { ChangeDetectionStrategy, Component, ElementRef, HostListener, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AuthFeatureService } from '../../../features/auth/services/auth-feature.service';
import { environment } from '../../../../environments/environment';
import { getInitials, resolveAvatarSrc } from '../../../utils/functions.util';

@Component({
  selector: 'app-profile-menu',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './profile-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileMenuComponent {
  private readonly authService = inject(AuthService);
  private readonly authFeatureService = inject(AuthFeatureService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  protected readonly open = signal(false);
  protected readonly currentUser = this.authService.currentUser;

  /** FirstName + LastName initials (e.g. "Nitish Reddy" → "NR"). Falls back to the JWT-decoded
   *  name while /auth/me is still resolving, so the avatar isn't empty for that brief window. */
  protected readonly initials = computed(() => {
    const name = this.currentUser()?.fullName || this.authService.getUserName() || 'User';
    return getInitials(name);
  });

  /** null until the backend adds avatarUrl to /auth/me — see PartEigthBEChanges.md. Until then
   *  this always falls back to the initials circle above. */
  protected readonly avatarSrc = computed(() => {
    const url = this.currentUser()?.avatarUrl;
    return url ? resolveAvatarSrc(url, environment.backendOrigin) : null;
  });

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  toggle(): void {
    this.open.update(v => !v);
  }

  close(): void {
    this.open.set(false);
  }

  logout(): void {
    this.close();
    this.authFeatureService.logout().subscribe();
  }
}
