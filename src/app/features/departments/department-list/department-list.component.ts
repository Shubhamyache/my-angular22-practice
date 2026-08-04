import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DepartmentService } from '../services/department.service';
import { Department } from '../models/department.model';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [LoaderComponent],
  templateUrl: './department-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
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
