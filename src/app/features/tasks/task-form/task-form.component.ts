/**
 * ═══════════════════════════════════════════════════════════════════
 * TASK FORM COMPONENT — Create & Edit Tasks
 * ═══════════════════════════════════════════════════════════════════
 */

import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TaskService } from '../services/task.service';
import { TaskStore } from '../store/task.store';
import { CreateTaskDto, TaskPriority } from '../models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './task-form.component.html'
})
export class TaskFormComponent implements OnInit {
  private readonly fb          = inject(FormBuilder);
  private readonly taskService = inject(TaskService);
  private readonly store       = inject(TaskStore);
  private readonly route       = inject(ActivatedRoute);
  private readonly router      = inject(Router);

  protected readonly isEditMode = signal(false);
  protected readonly loading    = signal(false);
  protected readonly error      = signal<string | null>(null);
  private editId = 0;

  protected readonly priorities: TaskPriority[] = ['Low', 'Medium', 'High', 'Critical'];

  // Mock data - would come from APIs in real app
  protected readonly projects = [
    { id: 1, name: 'Mobile App Redesign' },
    { id: 2, name: 'Customer Portal' },
    { id: 3, name: 'Data Analytics Platform' },
    { id: 8, name: 'E-commerce Platform' }
  ];

  protected readonly assignees = [
    { id: 1, name: 'Sarah Johnson' },
    { id: 2, name: 'Michael Chen' },
    { id: 3, name: 'Emily Rodriguez' },
    { id: 4, name: 'David Kim' },
    { id: 6, name: 'Robert Taylor' }
  ];

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
        this.form.patchValue({
          title:          task.title,
          description:    task.description,
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
      ? this.taskService.update(this.editId, dto)
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
