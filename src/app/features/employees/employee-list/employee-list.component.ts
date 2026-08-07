import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EmployeeStore } from '../store/employee.store';
import { EmployeeService } from '../services/employee.service';
import { Employee } from '../models/employee.model';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { AuthService } from '../../../core/services/auth.service';
import { ACCOUNT_STATUS_BADGE, getAccountStatus } from '../utils/account-status.util';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, LoaderComponent],
  templateUrl: './employee-list.component.html'
})
export class EmployeeListComponent implements OnInit {
  protected readonly store = inject(EmployeeStore);
  private readonly employeeService = inject(EmployeeService);
  private readonly authService = inject(AuthService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  /** Manager can view this list (route-guarded per §13) but not create/edit/delete — Admin/HR only.
   *  The Account status column (login access, separate from Employee.isActive's HR/employment
   *  status) is shown to the same pair — see EmployeeDetailComponent for where it's actually
   *  managed; this list only surfaces it at a glance. */
  protected readonly canManageEmployees = this.authService.getUserRole() === 'Admin'
    || this.authService.getUserRole() === 'HR';

  protected readonly accountStatusBadge = ACCOUNT_STATUS_BADGE;

  protected accountStatus(emp: Employee) {
    return getAccountStatus(emp);
  }

  ngOnInit(): void {
    this.store.loadEmployees();
  }

  /**
   * Previously called store.removeEmployee(id) directly, never DELETE /employees/{id} — the
   * row disappeared from the table but was never actually deleted server-side (harmless under
   * mock data, which reset every reload; a real bug once wired to a persistent backend).
   */
  async confirmDelete(id: number): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Remove Employee',
      message: 'Are you sure you want to remove this employee?',
      confirmText: 'Remove',
      confirmClass: 'btn-danger',
      icon: 'bi-person-x',
      iconColor: 'text-danger'
    });
    if (!confirmed) return;

    this.employeeService.delete(id).subscribe({
      next: () => this.store.removeEmployee(id)
      // errors surface via the global toast (403/409/500) or, for anything else, are simply
      // not applied locally — the row stays visible, matching the still-real server state.
    });
  }
}
