/**
 * ═══════════════════════════════════════════════════════════════════
 * FORGOT PASSWORD — request a reset link
 * ═══════════════════════════════════════════════════════════════════
 * Calls the already-live `POST /auth/forgot-password` (UIIntegrationInfo.md §3). The resulting
 * email should link to `/auth/reset-password?token=...`, redeemed by SetPasswordComponent in
 * `reset` mode — see that component's docblock and PartSixBEChangesNeeded.md for the exact
 * link-format requirement (same pattern already established for the registration email).
 *
 * SECURITY EDGE CASE — email enumeration: this form shows the SAME generic confirmation
 * ("if an account exists for that email, we've sent a link") whether the address exists or not,
 * and regardless of what the backend actually returns for an unknown email. If the backend ever
 * responds differently for a known-vs-unknown email (a distinct 404, a different message, a
 * different timing), that's a backend-side enumeration leak this page can't fully close on its
 * own — flagged in PartSixBEChangesNeeded.md to confirm the endpoint is already write-only/
 * silent on that distinction. The one exception show a REAL error for is 423 (rate-limited) —
 * that's legitimate, non-identity-revealing feedback ("too many attempts"), not an account-
 * existence signal, and UIIntegrationInfo.md §3 already documents forgot-password shares
 * login's rate limiter.
 */
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthFeatureService } from '../services/auth-feature.service';
import { ApiError } from '../../../core/utils/api-error.util';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authFeatureService = inject(AuthFeatureService);

  protected readonly loading = signal(false);
  protected readonly submitted = signal(false);
  protected readonly lockoutMessage = signal<string | null>(null);

  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  get email() { return this.form.get('email'); }

  onSubmit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.lockoutMessage.set(null);

    const { email } = this.form.getRawValue();

    this.authFeatureService.forgotPassword({ email: email! }).subscribe({
      next: () => {
        this.loading.set(false);
        this.submitted.set(true);
      },
      error: (err: ApiError) => {
        this.loading.set(false);
        if (err.status === 423) {
          this.lockoutMessage.set(err.message);
          return;
        }
        // Any other error (including "email not found", if the backend ever sends one) still
        // shows the generic confirmation — see the docblock above on why.
        this.submitted.set(true);
      }
    });
  }
}
