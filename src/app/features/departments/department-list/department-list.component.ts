import { Component, OnInit, inject, signal } from '@angular/core';
import { DepartmentService } from '../services/department.service';
import { Department } from '../models/department.model';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [LoaderComponent],
  template: `
    <div class="container-fluid py-2">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 class="fw-bold mb-0">
          <i class="bi bi-diagram-3-fill me-2 text-success"></i>Departments
        </h2>
        <button class="btn btn-success">
          <i class="bi bi-plus-lg me-1"></i> Add Department
        </button>
      </div>

      @if (loading()) {
        <app-loader />
      } @else if (error()) {
        <div class="alert alert-danger">{{ error() }}</div>
      } @else {
        <div class="row g-4">
          @for (dept of departments(); track dept.id) {
            <div class="col-12 col-md-6 col-xl-4">
              <div class="card border-0 shadow-sm h-100">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 class="fw-bold mb-0">{{ dept.name }}</h6>
                      <span class="badge bg-light text-dark border font-monospace small">{{ dept.code }}</span>
                    </div>
                    <span class="badge rounded-pill"
                      [class.bg-success]="dept.isActive"
                      [class.bg-secondary]="!dept.isActive">
                      {{ dept.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                  <hr class="my-3" />
                  <div class="d-flex align-items-center gap-2 text-muted small">
                    <i class="bi bi-people text-success"></i>
                    <span>{{ dept.employeeCount }} employees</span>
                    @if (dept.managerName) {
                      <span class="ms-auto">
                        <i class="bi bi-person-badge me-1"></i>{{ dept.managerName }}
                      </span>
                    }
                  </div>
                </div>
              </div>
            </div>
          } @empty {
            <div class="col-12 text-center py-5 text-muted">
              <i class="bi bi-inbox display-6 d-block mb-2"></i>
              No departments found.
            </div>
          }
        </div>
      }
    </div>
  `
})
export class DepartmentListComponent implements OnInit {
  private readonly departmentService = inject(DepartmentService);

  protected readonly departments = signal<Department[]>([]);
  protected readonly loading     = signal(true);
  protected readonly error       = signal<string | null>(null);

  ngOnInit(): void {
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
}
