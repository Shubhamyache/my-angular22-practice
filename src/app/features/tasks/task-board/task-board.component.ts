import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TaskService } from '../services/task.service';
import { Task, TaskStatus } from '../models/task.model';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { AuthService } from '../../../core/services/auth.service';

const COLUMNS: Array<{ status: TaskStatus; label: string; icon: string; color: string }> = [
  { status: 'Todo',       label: 'To Do',       icon: 'bi-circle',            color: 'border-secondary' },
  { status: 'InProgress', label: 'In Progress', icon: 'bi-arrow-repeat',      color: 'border-primary' },
  { status: 'InReview',   label: 'In Review',   icon: 'bi-eye',               color: 'border-warning' },
  { status: 'Done',       label: 'Done',        icon: 'bi-check-circle-fill', color: 'border-success' }
];

@Component({
  selector: 'app-task-board',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, LoaderComponent],
  templateUrl: './task-board.component.html'
})
export class TaskBoardComponent implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly authService = inject(AuthService);

  /** Admin/Manager per §13 — same role-only gate as the task list/detail screens. */
  protected readonly canManageTasks = ['Admin', 'Manager'].includes(this.authService.getUserRole());

  protected readonly allTasks = signal<Task[]>([]);
  protected readonly loading  = signal(true);
  protected readonly error    = signal<string | null>(null);

  protected readonly columns = COLUMNS;

  /** Returns tasks filtered to a given status */
  protected tasksFor(status: TaskStatus): Task[] {
    return this.allTasks().filter(t => t.status === status);
  }

  protected readonly movingId = signal<number | null>(null);

  ngOnInit(): void {
    this.taskService.getAll().subscribe({
      next: data => { this.allTasks.set(data); this.loading.set(false); },
      error: (err: Error) => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  /** The column immediately after `status`, or null for the last column ('Done'). */
  protected nextStatus(status: TaskStatus): TaskStatus | null {
    const index = COLUMNS.findIndex(c => c.status === status);
    return index >= 0 && index < COLUMNS.length - 1 ? COLUMNS[index + 1].status : null;
  }

  /** The column immediately before `status`, or null for the first column ('Todo'). */
  protected prevStatus(status: TaskStatus): TaskStatus | null {
    const index = COLUMNS.findIndex(c => c.status === status);
    return index > 0 ? COLUMNS[index - 1].status : null;
  }

  /**
   * Moves a card to an adjacent column via PATCH /tasks/{id}/status (UIIntegrationInfo.md §4 —
   * "the endpoint that backs Kanban drag-and-drop"). This board doesn't implement HTML5
   * drag-and-drop (that's a bigger, separate UI addition — see FeaturesToImplement.md); these
   * prev/next buttons drive the same lightweight endpoint. Optimistic update with rollback on
   * error, same pattern the backend doc recommends for the drag-and-drop version.
   */
  moveTask(task: Task, newStatus: TaskStatus): void {
    if (this.movingId() !== null) return;

    const previousStatus = task.status;
    this.movingId.set(task.id);
    this.allTasks.update(list =>
      list.map(t => t.id === task.id ? { ...t, status: newStatus } : t)
    );

    this.taskService.patchStatus(task.id, { status: newStatus }).subscribe({
      next: updated => {
        this.allTasks.update(list => list.map(t => t.id === updated.id ? updated : t));
        this.movingId.set(null);
      },
      error: () => {
        this.allTasks.update(list =>
          list.map(t => t.id === task.id ? { ...t, status: previousStatus } : t)
        );
        this.movingId.set(null);
      }
    });
  }
}
