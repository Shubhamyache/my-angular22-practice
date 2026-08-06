/**
 * ═══════════════════════════════════════════════════════════════════
 * LOGIN ACCESS MODAL — provision a User account for an Employee
 * ═══════════════════════════════════════════════════════════════════
 * There is currently no way for any Employee to log in unless a `User` row is created for them
 * directly in the database (UIIntegrationInfo.md §18 — "no user/account creation endpoint
 * exists"). This modal is the UI half of closing that gap; see PartFourBEChanges.md §2 for the
 * backend contract it's written against (`POST /employees/{id}/account`, not built yet).
 *
 * Once created, the new account should be able to log in and see exactly the record-scoped data
 * the rest of this app already enforces server-side for each role (§13) — for an Employee role
 * specifically, that means Projects/Tasks/Payroll narrow to "mine only" automatically, with zero
 * further Angular changes, since that scoping already happens in the list endpoints today.
 *
 * RESEND EDGE CASE: a 409 here means an account already exists (first email lost, expired, or
 * this is a deliberate resend). Rather than dead-ending on the error, this falls back to the
 * ALREADY-LIVE `POST /auth/forgot-password` (UIIntegrationInfo.md §3) for that employee's email —
 * no new backend endpoint needed for "resend," since forgot-password already re-issues a fresh
 * token and email regardless of whether the account has ever set a password before.
 */
import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { EmployeeService } from '../services/employee.service';
import { LoginAccountResult } from '../models/employee.model';
import { AuthFeatureService } from '../../auth/services/auth-feature.service';
import { ApiError } from '../../../core/utils/api-error.util';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

type Role = 'Admin' | 'HR' | 'Manager' | 'Employee';

@Component({
  selector: 'app-login-access-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModalComponent],
  templateUrl: './login-access-modal.component.html'
})
export class LoginAccessModalComponent {
  private readonly employeeService = inject(EmployeeService);
  private readonly authFeatureService = inject(AuthFeatureService);

  readonly employeeId = input.required<number>();
  readonly employeeEmail = input.required<string>();
  /** Which roles the CURRENT user is allowed to grant — PartFourBEChanges.md §2 proposes
   *  Admin+HR can both create a plain 'Employee' account (the common onboarding case), but only
   *  Admin can grant an elevated role. EmployeeDetailComponent passes the right set in. */
  readonly allowedRoles = input<Role[]>(['Employee']);
  readonly created = output<LoginAccountResult>();
  readonly closed  = output<void>();

  protected readonly role = signal<Role>('Employee');
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  /** True once a 409 tells us an account already exists — swaps the form for a "resend" prompt. */
  protected readonly alreadyExists = signal(false);
  protected readonly resent = signal(false);

  submit(): void {
    if (this.submitting()) return;

    this.submitting.set(true);
    this.error.set(null);

    this.employeeService.createLoginAccount(this.employeeId(), { role: this.role() }).subscribe({
      next: result => {
        this.submitting.set(false);
        this.created.emit(result);
      },
      error: (err: ApiError) => {
        this.submitting.set(false);
        if (err.status === 409) {
          this.alreadyExists.set(true);
        } else {
          this.error.set(err.message);
        }
      }
    });
  }

  resend(): void {
    if (this.submitting()) return;

    this.submitting.set(true);
    this.error.set(null);

    this.authFeatureService.forgotPassword({ email: this.employeeEmail() }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.resent.set(true);
      },
      error: (err: Error) => {
        this.submitting.set(false);
        this.error.set(err.message);
      }
    });
  }

  close(): void {
    this.closed.emit();
  }
}
