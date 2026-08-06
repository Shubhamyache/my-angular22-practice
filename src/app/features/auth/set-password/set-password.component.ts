/**
 * ═══════════════════════════════════════════════════════════════════
 * SET PASSWORD — shared by /auth/register and /auth/reset-password
 * ═══════════════════════════════════════════════════════════════════
 * Both routes redeem the exact same backend token via the exact same call,
 * `AuthFeatureService.resetPassword({ token, newPassword })` (UIIntegrationInfo.md §3, already
 * live) — a "create login access" registration email and a "forgot password" email both
 * ultimately hand the user a token that's consumed here. Only the framing differs:
 *   - /auth/register        → "Welcome, set a password to activate your account" (first login)
 *   - /auth/reset-password  → "Reset your password" (an existing user who forgot theirs)
 * `mode` comes from the route's static `data`, not a runtime input, since this is always
 * reached via direct navigation (an emailed link), never as a child component — see
 * auth.routes.ts. One component instead of two near-duplicates because the actual logic
 * (validation, submit, error mapping, success redirect) is identical either way; only ~10 lines
 * of copy differ, which the template branches on.
 *
 * EDGE CASES HANDLED:
 *  - No/blank token in the URL → invalid-link state, no form rendered at all.
 *  - Token invalid, expired, or already redeemed → server-driven inline error (the backend's
 *    `detail` message is already user-appropriate per UIIntegrationInfo.md §11).
 *  - Weak password / password+confirm mismatch → client-side, before any request is sent.
 *  - Double-submit → guarded by `submitting`.
 *  - Success → brief confirmation, then redirect to `/auth/login` with a mode-specific query
 *    flag; LoginComponent shows the matching banner (see login.component.ts).
 */
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthFeatureService } from '../services/auth-feature.service';
import { ApiError, getFieldError } from '../../../core/utils/api-error.util';

export type SetPasswordMode = 'register' | 'reset';

// Mirrors the documented change-password/reset-password policy (PartTwoUIIntegration.md §3):
// min 8 chars, at least one letter and one number.
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

const COPY: Record<SetPasswordMode, {
  icon: string; title: string; subtitle: string;
  successTitle: string; successBody: string;
  submitLabel: string; submitLoadingLabel: string;
  redirectParam: string;
}> = {
  register: {
    icon: 'bi-person-check-fill',
    title: 'Welcome to EMS',
    subtitle: 'Set a password to activate your account',
    successTitle: "You're all set!",
    successBody: 'Redirecting you to sign in…',
    submitLabel: 'Set Password & Continue',
    submitLoadingLabel: 'Activating...',
    redirectParam: 'registered'
  },
  reset: {
    icon: 'bi-shield-lock-fill',
    title: 'Reset Your Password',
    subtitle: 'Choose a new password for your account',
    successTitle: 'Password updated!',
    successBody: 'Redirecting you to sign in…',
    submitLabel: 'Reset Password',
    submitLoadingLabel: 'Updating...',
    redirectParam: 'passwordReset'
  }
};

@Component({
  selector: 'app-set-password',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './set-password.component.html'
})
export class SetPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authFeatureService = inject(AuthFeatureService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly mode: SetPasswordMode = this.route.snapshot.data['mode'] === 'reset' ? 'reset' : 'register';
  protected readonly copy = COPY[this.mode];
  protected readonly token = this.route.snapshot.queryParamMap.get('token')?.trim() || null;

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly showPassword = signal(false);
  protected readonly success = signal(false);

  protected readonly form = this.fb.group({
    password: ['', [Validators.required, Validators.pattern(PASSWORD_PATTERN)]],
    confirm:  ['', Validators.required]
  });

  get password() { return this.form.get('password'); }
  get confirm()  { return this.form.get('confirm'); }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    if (!this.token || this.loading()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { password, confirm } = this.form.getRawValue();
    if (password !== confirm) {
      this.errorMessage.set("Passwords don't match.");
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authFeatureService.resetPassword({ token: this.token, newPassword: password! }).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        setTimeout(() => {
          this.router.navigate(['/auth/login'], { queryParams: { [this.copy.redirectParam]: 'true' } });
        }, 2500);
      },
      error: (err: ApiError) => {
        this.loading.set(false);
        // Hand-thrown token-validity checks use a lowercase `token` key; a too-weak password
        // (if it somehow slipped past the client pattern) uses PascalCase `NewPassword` —
        // case-insensitive lookup handles either (UIIntegrationInfo.md §11).
        this.errorMessage.set(
          getFieldError(err.fieldErrors, 'token') ??
          getFieldError(err.fieldErrors, 'newPassword') ??
          err.message
        );
      }
    });
  }
}
