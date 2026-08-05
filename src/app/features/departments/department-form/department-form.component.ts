/**
 * ═══════════════════════════════════════════════════════════════════
 * DEPARTMENT FORM COMPONENT — Create & Edit
 * ═══════════════════════════════════════════════════════════════════
 * Same reactive-forms pattern as ProjectFormComponent/EmployeeFormComponent — see those for the
 * full rationale writeup. The backend already implements full Department CRUD
 * (UIIntegrationInfo.md §4 "Departments") and the DepartmentService methods already existed;
 * this component was the only missing piece — the "Add Department" button had nowhere to go.
 */

import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DepartmentService } from '../services/department.service';
import { EmployeeService } from '../../employees/services/employee.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from '../models/department.model';

@Component({
  selector: 'app-department-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './department-form.component.html'
})
export class DepartmentFormComponent implements OnInit {
  private readonly fb                = inject(FormBuilder);
  private readonly departmentService = inject(DepartmentService);
  private readonly employeeService   = inject(EmployeeService);
  private readonly route             = inject(ActivatedRoute);
  private readonly router            = inject(Router);

  protected readonly isEditMode = signal(false);
  protected readonly loading    = signal(false);
  protected readonly error      = signal<string | null>(null);
  private editId = 0;
  // isActive has no form field on create (mirrors ProjectFormComponent.current for the same
  // reason: UpdateDepartmentDto requires a field this form doesn't expose) — captured on load
  // and passed through unchanged.
  private currentIsActive = true;

  protected readonly managers = signal<{ id: number; name: string }[]>([]);

  protected readonly form = this.fb.group({
    name:      ['', [Validators.required, Validators.maxLength(100)]],
    code:      ['', [Validators.required, Validators.maxLength(10)]],
    managerId: [0]
  });

  ngOnInit(): void {
    this.employeeService.getAll({ page: 1, pageSize: 100, isActive: true }).subscribe({
      next: res => this.managers.set(res.data.map(e => ({ id: e.id, name: `${e.firstName} ${e.lastName}` })))
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.editId = Number(id);
      this.loadDepartment();
    }
  }

  private loadDepartment(): void {
    this.loading.set(true);
    this.departmentService.getById(this.editId).subscribe({
      next: dept => {
        this.currentIsActive = dept.isActive;
        this.form.patchValue({
          name:      dept.name,
          code:      dept.code,
          managerId: dept.managerId ?? 0
        });
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  field(name: string) {
    return this.form.get(name);
  }

  isInvalid(name: string): boolean {
    const ctrl = this.field(name);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  getErrorMessage(name: string): string {
    const ctrl = this.field(name);
    if (!ctrl || !ctrl.errors) return '';

    if (ctrl.errors['required']) return `${name} is required`;
    if (ctrl.errors['maxLength']) return `${name} is too long`;

    return 'Invalid value';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const raw = this.form.getRawValue();
    const dto: CreateDepartmentDto = {
      name:      raw.name ?? '',
      code:      raw.code ?? '',
      managerId: raw.managerId ? raw.managerId : null
    };

    const request$ = this.isEditMode()
      ? this.departmentService.update(this.editId, { ...dto, isActive: this.currentIsActive } satisfies UpdateDepartmentDto)
      : this.departmentService.create(dto);

    request$.subscribe({
      next: () => this.router.navigate(['/departments']),
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/departments']);
  }
}
