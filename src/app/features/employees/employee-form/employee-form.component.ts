import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EmployeeService } from '../services/employee.service';
import { EmployeeStore } from '../store/employee.store';
import { CreateEmployeeDto, UpdateEmployeeDto } from '../models/employee.model';

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
    hireDate:     ['', Validators.required]
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

    const request$ = this.isEditMode()
      ? this.employeeService.update(this.editId, { ...dto, isActive: this.currentIsActive } satisfies UpdateEmployeeDto)
      : this.employeeService.create(dto);

    request$.subscribe({
      next: emp => {
        this.isEditMode() ? this.store.updateEmployee(emp) : this.store.addEmployee(emp);
        this.router.navigate(['/employees']);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }
}
