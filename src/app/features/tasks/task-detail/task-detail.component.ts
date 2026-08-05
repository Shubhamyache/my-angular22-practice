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

@Component({
  selector: 'app-task-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, LoaderComponent, DateFormatPipe],
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
}
