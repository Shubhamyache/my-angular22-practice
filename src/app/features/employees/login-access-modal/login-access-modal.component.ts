/**
 * ═══════════════════════════════════════════════════════════════════
 * LOGIN ACCESS MODAL — provision a User account for an Employee
 * ═══════════════════════════════════════════════════════════════════
 * There is currently no way for any Employee to log in unless a `User` row is created for them
 * directly in the database (UIIntegrationInfo.md §18 — "no user/account creation endpoint
 * exists"). This modal is the UI half of closing that gap; see PartFourBEChanges.md for the
 * backend contract it's written against (`POST /employees/{id}/account`, not built yet).
 *
 * Once created, the new account should be able to log in and see exactly the record-scoped data
 * the rest of this app already enforces server-side for each role (§13) — for an Employee role
 * specifically, that means Projects/Tasks/Payroll narrow to "mine only" automatically, with zero
 * further Angular changes, since that scoping already happens in the list endpoints today.
 */
import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { EmployeeService } from '../services/employee.service';
import { LoginAccountResult } from '../models/employee.model';
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

  readonly employeeId = input.required<number>();
  readonly employeeEmail = input.required<string>();
  readonly created = output<LoginAccountResult>();
  readonly closed  = output<void>();

  protected readonly roles: Role[] = ['Employee', 'Manager', 'HR', 'Admin'];
  protected readonly role = signal<Role>('Employee');
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

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
        this.error.set(err.message);
      }
    });
  }

  close(): void {
    this.closed.emit();
  }
}
