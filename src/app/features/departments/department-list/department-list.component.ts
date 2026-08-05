import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DepartmentService } from '../services/department.service';
import { Department } from '../models/department.model';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [RouterModule, LoaderComponent],
  templateUrl: './department-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepartmentListComponent implements OnInit {
  private readonly departmentService = inject(DepartmentService);
  private readonly authService       = inject(AuthService);

  /** Create/edit/delete — Admin, HR per §13 (Manager/Employee are view-only on Departments). */
  protected readonly canManageDepartments = ['Admin', 'HR'].includes(this.authService.getUserRole());

  protected readonly departments = signal<Department[]>([]);
  protected readonly loading     = signal(true);
  protected readonly error       = signal<string | null>(null);
  private readonly deletingIds   = signal<Set<number>>(new Set());

  ngOnInit(): void {
    this.loadDepartments();
  }

  private loadDepartments(): void {
    this.loading.set(true);
    this.departmentService.getAll().subscribe({
      next: data => {
        this.departments.set(data);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  isDeleting(id: number): boolean {
    return this.deletingIds().has(id);
  }

  /**
   * Delete with confirmation. The backend rejects this with 409 (surfaced via the shared error
   * toast per UIIntegrationInfo.md §11) when the department still has employees assigned to it —
   * there is nothing to reconcile client-side, just let that response come back and stop
   * spinning.
   */
  confirmDelete(id: number, name: string): void {
    if (!confirm(`Are you sure you want to delete department "${name}"?`)) return;

    this.deletingIds.update(ids => new Set(ids).add(id));
    this.departmentService.delete(id).subscribe({
      next: () => {
        this.departments.update(list => list.filter(d => d.id !== id));
        this.deletingIds.update(ids => {
          const next = new Set(ids);
          next.delete(id);
          return next;
        });
      },
      error: () => {
        this.deletingIds.update(ids => {
          const next = new Set(ids);
          next.delete(id);
          return next;
        });
      }
    });
  }
}
