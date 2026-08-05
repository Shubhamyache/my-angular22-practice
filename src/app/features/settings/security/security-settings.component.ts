import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SecurityService } from '../services/security.service';
import { SessionDto } from '../models/settings.model';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { AuthService } from '../../../core/services/auth.service';
import { ApiError, getFieldError } from '../../../core/utils/api-error.util';
import { TwoFactorModalComponent } from '../two-factor-modal/two-factor-modal.component';

const SESSIONS_PAGE_SIZE = 10;

@Component({
  selector: 'app-security-settings',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, TwoFactorModalComponent],
  templateUrl: './security-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SecuritySettingsComponent implements OnInit {
  private readonly fb              = inject(FormBuilder);
  private readonly securityService = inject(SecurityService);
  private readonly errorHandler    = inject(ErrorHandlerService);
  private readonly authService     = inject(AuthService);

  protected readonly passwordForm = this.fb.group({
    current: ['', Validators.required],
    newPass: ['', [Validators.required, Validators.minLength(8)]],
    confirm: ['', Validators.required]
  });

  protected readonly changingPassword = signal(false);
  protected readonly passwordSaved    = signal(false);
  protected readonly passwordError    = signal<string | null>(null);
  protected readonly currentPasswordError = signal<string | null>(null);
  protected readonly newPasswordError     = signal<string | null>(null);

  protected readonly sessions        = signal<SessionDto[]>([]);
  protected readonly sessionsLoading = signal(true);
  protected readonly revokingId      = signal<number | null>(null);
  /** Long-lived accounts can accumulate dozens of session rows (PartTwoUIIntegration.md §5) —
   *  no server-side pagination is provided, so cap what's rendered client-side. */
  protected readonly showAllSessions = signal(false);
  protected readonly visibleSessions = computed(() =>
    this.showAllSessions() ? this.sessions() : this.sessions().slice(0, SESSIONS_PAGE_SIZE)
  );

  /** Seeded from CurrentUserDto.twoFactorEnabled (GET /auth/me, already loaded into AuthService
   *  at login/refresh); the modal re-syncs it via onTwoFactorChanged() after a successful
   *  verify/disable so this stays correct without a second round trip. */
  protected readonly twoFAModalOpen = signal(false);
  protected readonly twoFAEnabled   = signal(this.authService.currentUser()?.twoFactorEnabled ?? false);
  protected readonly twoFactorModalMode = computed<'enable' | 'disable'>(() =>
    this.twoFAEnabled() ? 'disable' : 'enable'
  );

  ngOnInit(): void {
    this.securityService.getSessions().subscribe({
      next: sessions => {
        this.sessions.set(sessions);
        this.sessionsLoading.set(false);
      },
      error: () => this.sessionsLoading.set(false)
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { current, newPass, confirm } = this.passwordForm.getRawValue();
    this.currentPasswordError.set(null);
    this.newPasswordError.set(null);
    this.passwordError.set(null);

    if (newPass !== confirm) {
      this.passwordError.set("New password and confirmation don't match.");
      return;
    }

    this.changingPassword.set(true);
    this.passwordSaved.set(false);

    this.securityService.changePassword({ currentPassword: current!, newPassword: newPass! }).subscribe({
      next: () => {
        this.changingPassword.set(false);
        this.passwordSaved.set(true);
        this.passwordForm.reset();
        setTimeout(() => this.passwordSaved.set(false), 3000);
        // Backend revokes every active refresh token on a successful password change
        // (PartTwoUIIntegration.md §3) — the current tab keeps working until its access token's
        // normal ~15 min expiry, then the next refresh attempt 401s and the existing interceptor
        // redirects to /login. Flagging this up front so it doesn't read as a bug when it happens.
        this.errorHandler.notify('info', 'Password changed. You’ll need to sign in again shortly on this and any other signed-in device.');
      },
      error: (err: ApiError) => {
        this.changingPassword.set(false);
        // currentPassword (lowercase, hand-thrown wrong-password check) or CurrentPassword /
        // NewPassword (PascalCase, FluentValidation) — case-insensitive lookup handles both
        // (PartTwoUIIntegration.md §3).
        const currentErr = getFieldError(err.fieldErrors, 'currentPassword');
        const newErr = getFieldError(err.fieldErrors, 'newPassword');
        if (currentErr || newErr) {
          this.currentPasswordError.set(currentErr ?? null);
          this.newPasswordError.set(newErr ?? null);
        } else {
          this.passwordError.set(err.message);
        }
      }
    });
  }

  revokeSession(session: SessionDto): void {
    if (session.isCurrent) return;
    if (!confirm('Revoke this session? That device will be signed out.')) return;

    this.revokingId.set(session.id);
    this.securityService.revokeSession(session.id).subscribe({
      next: () => {
        this.sessions.update(list => list.filter(s => s.id !== session.id));
        this.revokingId.set(null);
      },
      error: () => this.revokingId.set(null)
    });
  }

  openTwoFactorModal(): void {
    this.twoFAModalOpen.set(true);
  }

  onTwoFactorChanged(enabled: boolean): void {
    this.twoFAEnabled.set(enabled);
    this.twoFAModalOpen.set(false);

    // Keep the app-wide CurrentUserDto (AuthService) in sync too — otherwise anything else that
    // reads authService.currentUser()?.twoFactorEnabled (there is none today, but it's the same
    // signal navbar/profile read for other fields) would show stale state until next login/refresh.
    const user = this.authService.currentUser();
    if (user) {
      this.authService.setCurrentUser({ ...user, twoFactorEnabled: enabled });
    }
  }
}
