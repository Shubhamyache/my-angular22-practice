import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EmployeeStore } from '../store/employee.store';
import { EmployeeService } from '../services/employee.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { AuthService } from '../../../core/services/auth.service';

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

  /** Manager can view this list (route-guarded per §13) but not create/edit/delete — Admin/HR only. */
  protected readonly canManageEmployees = this.authService.getUserRole() === 'Admin'
    || this.authService.getUserRole() === 'HR';

  ngOnInit(): void {
    this.store.loadEmployees();
  }

  /**
   * Previously called store.removeEmployee(id) directly, never DELETE /employees/{id} — the
   * row disappeared from the table but was never actually deleted server-side (harmless under
   * mock data, which reset every reload; a real bug once wired to a persistent backend).
   */
  confirmDelete(id: number): void {
    if (confirm('Are you sure you want to remove this employee?')) {
      this.employeeService.delete(id).subscribe({
        next: () => this.store.removeEmployee(id)
        // errors surface via the global toast (403/409/500) or, for anything else, are simply
        // not applied locally — the row stays visible, matching the still-real server state.
      });
    }
  }
}
