/**
 * ═══════════════════════════════════════════════════════════════════
 * TASK FORM COMPONENT — Create & Edit Tasks
 * ═══════════════════════════════════════════════════════════════════
 */

import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TaskService } from '../services/task.service';
import { TaskStore } from '../store/task.store';
import { CreateTaskDto, TaskPriority, TaskStatus, UpdateTaskDto } from '../models/task.model';
import { ProjectService } from '../../projects/services/project.service';
import { EmployeeService } from '../../employees/services/employee.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './task-form.component.html'
})
export class TaskFormComponent implements OnInit {
  private readonly fb              = inject(FormBuilder);
  private readonly taskService     = inject(TaskService);
  private readonly projectService  = inject(ProjectService);
  private readonly employeeService = inject(EmployeeService);
  private readonly store           = inject(TaskStore);
  private readonly route           = inject(ActivatedRoute);
  private readonly router          = inject(Router);

  protected readonly isEditMode = signal(false);
  protected readonly loading    = signal(false);
  protected readonly error      = signal<string | null>(null);
  private editId = 0;
  // UpdateTaskDto requires loggedHours/status, which this form has no fields for (preserves
  // the existing UI exactly) — captured from the loaded record, same pattern used in
  // EmployeeFormComponent/ProjectFormComponent.
  private current: { loggedHours: number; status: TaskStatus } = { loggedHours: 0, status: 'Todo' };

  protected readonly priorities: TaskPriority[] = ['Low', 'Medium', 'High', 'Critical'];

  // Real lookups, replacing the previous hardcoded 4-item mock arrays.
  protected readonly projects  = signal<{ id: number; name: string }[]>([]);
  protected readonly assignees = signal<{ id: number; name: string }[]>([]);

  protected readonly form = this.fb.group({
    title:          ['', [Validators.required, Validators.maxLength(200)]],
    description:    ['', Validators.maxLength(1000)],
    priority:       ['Medium' as TaskPriority, Validators.required],
    projectId:      [0, [Validators.required, Validators.min(1)]],
    assigneeId:     [0, [Validators.required, Validators.min(1)]],
    dueDate:        ['', Validators.required],
    estimatedHours: [0, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void {
    this.projectService.getAll().subscribe({
      next: projects => this.projects.set(projects.map(p => ({ id: p.id, name: p.name })))
    });
    this.employeeService.getAll({ page: 1, pageSize: 100, isActive: true }).subscribe({
      next: res => this.assignees.set(res.data.map(e => ({ id: e.id, name: `${e.firstName} ${e.lastName}` })))
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.editId = Number(id);
      this.loadTask();
    }
  }

  private loadTask(): void {
    this.loading.set(true);
    this.taskService.getById(this.editId).subscribe({
      next: task => {
        this.current = { loggedHours: task.loggedHours, status: task.status };
        this.form.patchValue({
          title:          task.title,
          description:    task.description ?? '',
          priority:       task.priority,
          projectId:      task.projectId,
          assigneeId:     task.assigneeId,
          dueDate:        task.dueDate,
          estimatedHours: task.estimatedHours
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
    if (ctrl.errors['min']) return `${name} must be greater than 0`;
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
    const dto: CreateTaskDto = {
      title:          raw.title          ?? '',
      description:    raw.description    ?? '',
      priority:       raw.priority       ?? 'Medium',
      projectId:      raw.projectId      ?? 0,
      assigneeId:     raw.assigneeId     ?? 0,
      dueDate:        raw.dueDate        ?? '',
      estimatedHours: raw.estimatedHours ?? 0
    };

    const request$ = this.isEditMode()
      ? this.taskService.update(this.editId, { ...dto, ...this.current } satisfies UpdateTaskDto)
      : this.taskService.create(dto);

    request$.subscribe({
      next: task => {
        if (this.isEditMode()) {
          this.store.updateTask(task);
        } else {
          this.store.addTask(task);
        }
        this.router.navigate(['/tasks']);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/tasks']);
  }
}
