import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EmployeeService } from '../services/employee.service';
import { Employee, LoginAccountResult } from '../models/employee.model';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { AuthService } from '../../../core/services/auth.service';
import { AuthFeatureService } from '../../auth/services/auth-feature.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { LoginAccessModalComponent } from '../login-access-modal/login-access-modal.component';
import { getAccountStatus } from '../utils/account-status.util';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, LoaderComponent, DateFormatPipe, CurrencyFormatPipe, LoginAccessModalComponent],
  templateUrl: './employee-detail.component.html'
})
export class EmployeeDetailComponent implements OnInit {
  private readonly route              = inject(ActivatedRoute);
  private readonly employeeService    = inject(EmployeeService);
  private readonly authService        = inject(AuthService);
  private readonly authFeatureService = inject(AuthFeatureService);
  private readonly errorHandler       = inject(ErrorHandlerService);

  protected readonly employee = signal<Employee | null>(null);
  protected readonly loading  = signal(true);
  protected readonly error    = signal<string | null>(null);

  /**
   * Account provisioning is visible to Admin+HR (same pair that can create/edit Employee records
   * per §13) — but only Admin can grant anything above a plain 'Employee' role; HR granting
   * themselves-equivalent-or-higher access via an onboarding flow would be a privilege-escalation
   * footgun, so their version of this panel has no role picker at all (see allowedRoles below
   * and LoginAccessModalComponent's template). See that component's docblock for why this screen
   * has this section in the first place (no self-registration/admin "create user" flow exists on
   * the backend today, UIIntegrationInfo.md §18).
   *
   * Activate/Deactivate is intentionally Admin-only (not HR) — it's a more consequential action
   * than granting a base Employee login (it force-signs-out an existing, possibly-elevated
   * account), so it gets the tighter gate. See PartSixBEChangesNeeded.md.
   */
  private readonly currentRole = this.authService.getUserRole();
  protected readonly canManageLoginAccess = ['Admin', 'HR'].includes(this.currentRole);
  protected readonly canManageAccountStatus = this.currentRole === 'Admin';
  protected readonly allowedGrantRoles: ('Admin' | 'HR' | 'Manager' | 'Employee')[] =
    this.currentRole === 'Admin' ? ['Employee', 'Manager', 'HR', 'Admin'] : ['Employee'];

  protected readonly loginAccessModalOpen = signal(false);
  protected readonly justGrantedAccess = signal<LoginAccountResult | null>(null);
  protected readonly resendingEmail = signal(false);
  protected readonly resendSuccess = signal(false);
  protected readonly togglingActive = signal(false);
  protected readonly accountActionError = signal<string | null>(null);

  /** Derives a single status from the (currently backend-unshipped, see model docblock) account
   *  fields rather than scattering `@if` chains across the template — see account-status.util.ts,
   *  shared with EmployeeListComponent's status badge. */
  protected readonly accountStatus = computed(() => {
    const emp = this.employee();
    return emp ? getAccountStatus(emp) : 'unknown';
  });

  /** An Admin can't deactivate the account they're currently signed in with — that would either
   *  no-op confusingly or force-log-them-out mid-action. Employee-less Admin accounts (no linked
   *  Employee record) never match, which is correct — there's nothing to guard there. */
  protected readonly isSelf = computed(() =>
    this.employee()?.id !== undefined && this.employee()!.id === this.authService.employeeId()
  );

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.employeeService.getById(id).subscribe({
      next: emp => {
        this.employee.set(emp);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  onLoginAccessCreated(result: LoginAccountResult): void {
    this.loginAccessModalOpen.set(false);
    this.justGrantedAccess.set(result);
    this.employee.update(emp => emp
      ? { ...emp, hasLoginAccount: true, registrationCompleted: false, accountActive: true }
      : emp
    );
  }

  /** Reuses the already-live forgot-password flow to re-issue a fresh token/email — see
   *  LoginAccessModalComponent's docblock for why this needs no dedicated "resend" endpoint. */
  resendRegistrationEmail(): void {
    const emp = this.employee();
    if (!emp || this.resendingEmail()) return;

    this.resendingEmail.set(true);
    this.resendSuccess.set(false);
    this.accountActionError.set(null);

    this.authFeatureService.forgotPassword({ email: emp.email }).subscribe({
      next: () => {
        this.resendingEmail.set(false);
        this.resendSuccess.set(true);
        setTimeout(() => this.resendSuccess.set(false), 4000);
      },
      error: (err: Error) => {
        this.resendingEmail.set(false);
        this.accountActionError.set(err.message);
      }
    });
  }

  deactivateAccount(): void {
    const emp = this.employee();
    if (!emp || this.togglingActive() || this.isSelf()) return;

    if (!confirm(`Deactivate ${emp.firstName} ${emp.lastName}'s account? They'll be signed out immediately and won't be able to log in until reactivated.`)) {
      return;
    }

    this.setAccountActive(emp, false);
  }

  activateAccount(): void {
    const emp = this.employee();
    if (!emp || this.togglingActive()) return;

    this.setAccountActive(emp, true);
  }

  private setAccountActive(emp: Employee, isActive: boolean): void {
    this.togglingActive.set(true);
    this.accountActionError.set(null);

    this.employeeService.setAccountActive(emp.id, isActive).subscribe({
      next: () => {
        this.togglingActive.set(false);
        this.employee.update(current => current ? { ...current, accountActive: isActive } : current);
        this.errorHandler.notify(
          'success',
          isActive
            ? `${emp.firstName} ${emp.lastName}'s account is active again.`
            : `${emp.firstName} ${emp.lastName}'s account has been deactivated.`
        );
      },
      error: (err: Error) => {
        this.togglingActive.set(false);
        this.accountActionError.set(err.message);
      }
    });
  }
}
