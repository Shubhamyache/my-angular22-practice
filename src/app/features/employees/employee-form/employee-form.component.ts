import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EmployeeService } from '../services/employee.service';
import { EmployeeStore } from '../store/employee.store';
import { CreateEmployeeDto, Employee, UpdateEmployeeDto } from '../models/employee.model';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './employee-form.component.html'
})
export class EmployeeFormComponent implements OnInit {
  private readonly fb              = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly store           = inject(EmployeeStore);
  private readonly route           = inject(ActivatedRoute);
  private readonly router          = inject(Router);
  private readonly errorHandler    = inject(ErrorHandlerService);

  protected readonly isEditMode = signal(false);
  protected readonly loading    = signal(false);
  protected readonly error      = signal<string | null>(null);
  private editId = 0;
  // UpdateEmployeeDto requires isActive, which this form has no field for (preserves the
  // existing UI exactly) — captured from the loaded record and passed through unchanged.
  private currentIsActive = true;

  protected readonly form = this.fb.group({
    firstName:    ['', Validators.required],
    lastName:     ['', Validators.required],
    email:        ['', [Validators.required, Validators.email]],
    phone:        ['', Validators.required],
    departmentId: [0,  [Validators.required, Validators.min(1)]],
    jobTitle:     ['', Validators.required],
    salary:       [0,  [Validators.required, Validators.min(1)]],
    hireDate:     ['', Validators.required],
    // Create-mode only (see the template) — kicks off EmployeeService.createLoginAccount()
    // right after the Employee record itself is created. Always role: 'Employee' here; granting
    // an elevated role stays a deliberate, separate action via EmployeeDetailComponent's Login
    // Access panel (LoginAccessModalComponent), not something a bulk-onboarding checkbox should
    // be able to do by accident.
    sendRegistrationEmail: [true]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.editId = Number(id);
      this.employeeService.getById(this.editId).subscribe({
        next: emp  => {
          this.currentIsActive = emp.isActive;
          this.form.patchValue(emp);
        },
        error: (err: Error) => this.error.set(err.message)
      });
    }
  }

  field(name: string) {
    return this.form.get(name);
  }

  isInvalid(name: string): boolean {
    const ctrl = this.field(name);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const raw = this.form.getRawValue();
    const dto: CreateEmployeeDto = {
      firstName:    raw.firstName    ?? '',
      lastName:     raw.lastName     ?? '',
      email:        raw.email        ?? '',
      phone:        raw.phone        ?? '',
      departmentId: raw.departmentId ?? 0,
      jobTitle:     raw.jobTitle     ?? '',
      salary:       raw.salary       ?? 0,
      hireDate:     raw.hireDate     ?? ''
    };

    const sendRegistrationEmail = this.form.getRawValue().sendRegistrationEmail;

    const request$ = this.isEditMode()
      ? this.employeeService.update(this.editId, { ...dto, isActive: this.currentIsActive } satisfies UpdateEmployeeDto)
      : this.employeeService.create(dto);

    request$.subscribe({
      next: emp => {
        this.isEditMode() ? this.store.updateEmployee(emp) : this.store.addEmployee(emp);

        if (!this.isEditMode() && sendRegistrationEmail) {
          // Deliberately not awaited before navigating — the Employee record is already safely
          // created at this point, and this second call is a nice-to-have on top of it, not a
          // precondition for it. See sendLoginAccountEmail()'s docblock for the failure handling.
          this.sendLoginAccountEmail(emp);
        }

        this.router.navigate(['/employees']);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  /**
   * Fire-and-forget: creates the login account + triggers the registration email
   * (PartFourBEChanges.md §2). Failure here must never look like the employee creation itself
   * failed — the Employee record already exists and is already saved by the time this runs — so
   * errors surface as a dismissible warning toast pointing at the manual retry path
   * (EmployeeDetailComponent's "Create Login Access" panel) rather than blocking navigation or
   * reusing this form's own `error` banner.
   */
  private sendLoginAccountEmail(emp: Employee): void {
    this.employeeService.createLoginAccount(emp.id, { role: 'Employee' }).subscribe({
      next: () => {
        this.errorHandler.notify('success', `${emp.firstName} ${emp.lastName} was created and a registration email was sent to ${emp.email}.`);
      },
      error: () => {
        this.errorHandler.notify(
          'warning',
          `${emp.firstName} ${emp.lastName} was created, but the registration email couldn't be sent. You can send it later from their profile.`
        );
      }
    });
  }
}
