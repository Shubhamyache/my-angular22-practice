import { Injectable, computed, inject, signal } from '@angular/core';
import { Employee } from '../models/employee.model';
import { EmployeeService } from '../services/employee.service';

@Injectable({ providedIn: 'root' })
export class EmployeeStore {
  private readonly employeeService = inject(EmployeeService);

  // ── Private writable state ──────────────────────────────────────────────────
  private readonly _employees        = signal<Employee[]>([]);
  private readonly _loading          = signal(false);
  private readonly _error            = signal<string | null>(null);
  private readonly _selectedEmployee = signal<Employee | null>(null);
  private readonly _currentPage      = signal(1);
  private readonly _totalCount       = signal(0);

  // ── Public read-only signals ────────────────────────────────────────────────
  readonly employees        = this._employees.asReadonly();
  readonly loading          = this._loading.asReadonly();
  readonly error            = this._error.asReadonly();
  readonly selectedEmployee = this._selectedEmployee.asReadonly();
  readonly currentPage      = this._currentPage.asReadonly();
  readonly totalCount       = this._totalCount.asReadonly();

  // ── Computed (derived state) ────────────────────────────────────────────────
  readonly activeEmployees = computed(() =>
    this._employees().filter(e => e.isActive)
  );
  readonly inactiveCount = computed(() =>
    this._employees().filter(e => !e.isActive).length
  );

  // ── Actions ─────────────────────────────────────────────────────────────────
  loadEmployees(page = 1): void {
    this._loading.set(true);
    this._error.set(null);

    this.employeeService.getAll(page).subscribe({
      next: res => {
        this._employees.set(res.data);
        this._totalCount.set(res.totalCount);
        this._currentPage.set(page);
        this._loading.set(false);
      },
      error: (err: Error) => {
        this._error.set(err.message);
        this._loading.set(false);
      }
    });
  }

  selectEmployee(employee: Employee | null): void {
    this._selectedEmployee.set(employee);
  }

  addEmployee(employee: Employee): void {
    this._employees.update(list => [employee, ...list]);
    this._totalCount.update(n => n + 1);
  }

  updateEmployee(updated: Employee): void {
    this._employees.update(list =>
      list.map(e => (e.id === updated.id ? updated : e))
    );
  }

  removeEmployee(id: number): void {
    this._employees.update(list => list.filter(e => e.id !== id));
    this._totalCount.update(n => Math.max(0, n - 1));
  }
}
