import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EmployeeService } from '../services/employee.service';
import { Employee, LoginAccountResult } from '../models/employee.model';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { AuthService } from '../../../core/services/auth.service';
import { LoginAccessModalComponent } from '../login-access-modal/login-access-modal.component';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, LoaderComponent, DateFormatPipe, CurrencyFormatPipe, LoginAccessModalComponent],
  templateUrl: './employee-detail.component.html'
})
export class EmployeeDetailComponent implements OnInit {
  private readonly route           = inject(ActivatedRoute);
  private readonly employeeService = inject(EmployeeService);
  private readonly authService     = inject(AuthService);

  protected readonly employee = signal<Employee | null>(null);
  protected readonly loading  = signal(true);
  protected readonly error    = signal<string | null>(null);

  /** Account provisioning is Admin-only — see LoginAccessModalComponent's docblock for why this
   *  screen even has this section (there's no self-registration or admin "create user" flow on
   *  the backend today, UIIntegrationInfo.md §18). */
  protected readonly isAdmin = this.authService.getUserRole() === 'Admin';
  protected readonly loginAccessModalOpen = signal(false);
  protected readonly justGrantedAccess = signal<LoginAccountResult | null>(null);

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
    this.employee.update(emp => emp ? { ...emp, hasLoginAccount: true } : emp);
  }
}
