/**
 * ═══════════════════════════════════════════════════════════════════
 * TASK DETAIL COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 * `task`/`loading`/`error` are `computed()` signals reading directly from the store — see the
 * matching note in project-detail.component.ts for why (the previous version's synchronous
 * local-signal copy immediately after an async `loadTaskById()` call never actually reflected
 * the loaded data; same latent bug, same minimal fix, not a UI redesign).
 */

import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TaskStore } from '../store/task.store';
import { TaskService } from '../services/task.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { AuthService } from '../../../core/services/auth.service';
import { TaskCommentsComponent } from '../task-comments/task-comments.component';
import { TaskAttachmentsComponent } from '../task-attachments/task-attachments.component';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, LoaderComponent, DateFormatPipe, TaskCommentsComponent, TaskAttachmentsComponent],
  templateUrl: './task-detail.component.html'
})
export class TaskDetailComponent implements OnInit {
  private readonly store       = inject(TaskStore);
  private readonly taskService = inject(TaskService);
  private readonly authService = inject(AuthService);
  private readonly route       = inject(ActivatedRoute);
  private readonly router      = inject(Router);

  /** Admin/Manager per §13 — see task-list.component.ts for why this is role-only, not
   *  per-record ownership (TaskDto has no project.managerId to check against). */
  protected readonly canManageTasks = ['Admin', 'Manager'].includes(this.authService.getUserRole());

  private readonly invalidId = signal(false);
  private readonly deleting  = signal(false);

  protected readonly task    = computed(() => this.store.selectedTask());
  protected readonly loading = computed(() => this.store.loading());
  protected readonly error   = computed(() =>
    this.invalidId() ? 'Invalid task ID' : this.store.error()
  );

  private taskId = 0;
  protected readonly loggingTime = signal(false);

  protected readonly statusConfig = {
    Todo:       { badge: 'bg-secondary',        label: 'To Do',       icon: 'bi-circle' },
    InProgress: { badge: 'bg-primary',          label: 'In Progress', icon: 'bi-arrow-repeat' },
    InReview:   { badge: 'bg-warning text-dark', label: 'In Review',   icon: 'bi-eye' },
    Done:       { badge: 'bg-success',          label: 'Done',        icon: 'bi-check-circle-fill' }
  };

  protected readonly priorityConfig = {
    Low:      { badge: 'bg-secondary', label: 'Low' },
    Medium:   { badge: 'bg-info',      label: 'Medium' },
    High:     { badge: 'bg-warning',   label: 'High' },
    Critical: { badge: 'bg-danger',    label: 'Critical' }
  };

  protected readonly Math = Math;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.taskId = Number(id);
      this.store.loadTaskById(this.taskId);
    } else {
      this.invalidId.set(true);
    }
  }

  onEdit(): void {
    this.router.navigate(['/tasks', this.taskId, 'edit']);
  }

  onDelete(): void {
    const t = this.task();
    if (!t || this.deleting()) return;

    if (confirm(`Are you sure you want to delete "${t.title}"?`)) {
      this.deleting.set(true);
      this.taskService.delete(t.id).subscribe({
        next: () => {
          this.store.removeTask(t.id);
          this.router.navigate(['/tasks']);
        },
        error: () => {
          this.deleting.set(false);
        }
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/tasks']);
  }

  /**
   * Logs additional hours against the task via PUT /tasks/{id} (UpdateTaskDto is the only
   * endpoint that accepts loggedHours — there's no dedicated "log time" endpoint per
   * UIIntegrationInfo.md §4, so this sends a full update built from the currently-loaded task
   * plus the incremented value).
   */
  logTime(): void {
    const t = this.task();
    if (!t || this.loggingTime()) return;

    const input = prompt('How many hours would you like to log?', '1');
    if (input === null) return;

    const hours = Number(input);
    if (!Number.isFinite(hours) || hours <= 0) {
      alert('Enter a positive number of hours.');
      return;
    }

    this.loggingTime.set(true);
    this.taskService.update(t.id, {
      title: t.title,
      description: t.description ?? undefined,
      priority: t.priority,
      projectId: t.projectId,
      assigneeId: t.assigneeId,
      dueDate: t.dueDate,
      estimatedHours: t.estimatedHours,
      tags: t.tags,
      loggedHours: t.loggedHours + hours,
      status: t.status
    }).subscribe({
      next: updated => {
        this.store.updateTask(updated);
        this.loggingTime.set(false);
      },
      error: () => this.loggingTime.set(false)
    });
  }
}
