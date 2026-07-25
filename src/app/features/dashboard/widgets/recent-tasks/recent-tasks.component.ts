import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RecentTask, TaskStatus, Priority } from '../../models/dashboard.model';

/**
 * RECENT TASKS WIDGET — Presentational Component
 *
 * Shows up to 6 tasks in a scrollable list-group card.
 * Each row contains: priority indicator, title, status badge,
 * assignee avatar, and due date.
 *
 * STACKED LAYOUT (col-12 col-lg-4 in parent):
 * The parent places this component in a 4-column slot beside the
 * employees table on large screens. On mobile it stacks below.
 * This component adapts automatically via flex layout.
 */
@Component({
  selector: 'app-recent-tasks',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="card border-0 shadow-sm h-100">

      <!-- ── Card Header ──────────────────────────────────────────── -->
      <div class="card-header bg-white border-bottom d-flex align-items-center justify-content-between py-3 px-4">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-check2-square text-warning fs-5"></i>
          <span class="fw-semibold">Recent Tasks</span>
          <span class="badge bg-warning bg-opacity-15 text-warning rounded-pill">
            {{ tasks().length }}
          </span>
        </div>
        <a routerLink="/tasks" class="btn btn-sm btn-outline-warning text-dark">
          View All <i class="bi bi-arrow-right ms-1"></i>
        </a>
      </div>

      <!-- ── Task List ─────────────────────────────────────────────── -->
      <div class="card-body p-0" style="overflow-y:auto;max-height:420px;">
        <ul class="list-group list-group-flush">

          @for (task of tasks(); track task.id) {
            <li class="list-group-item px-4 py-3 border-bottom">
              <div class="d-flex align-items-start gap-3">

                <!--
                  Priority dot indicator.
                  A small colored circle (8px) acts as a visual cue.
                  Screen readers get the text in the status badge below.
                -->
                <div
                  class="rounded-circle flex-shrink-0 mt-1"
                  style="width:8px;height:8px;"
                  [style.background]="'var(--bs-' + priorityColor(task.priority) + ')'">
                </div>

                <div class="flex-grow-1 min-w-0">

                  <!-- Title + Status badge -->
                  <div class="d-flex align-items-start justify-content-between gap-2 mb-1">
                    <span class="fw-semibold text-truncate" style="font-size:0.875rem;">
                      {{ task.title }}
                    </span>
                    <span
                      [class]="'badge rounded-pill flex-shrink-0 ' + statusClass(task.status)"
                      style="font-size:0.65rem;">
                      {{ statusLabel(task.status) }}
                    </span>
                  </div>

                  <!-- Project name (subtitle) -->
                  <div class="text-muted text-truncate mb-2" style="font-size:0.75rem;">
                    <i class="bi bi-folder me-1"></i>{{ task.projectName }}
                  </div>

                  <!-- Assignee + Due date -->
                  <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center gap-2">
                      <!--
                        Assignee avatar: small circle with initials.
                        Same pattern as the employees table, but smaller (28px).
                      -->
                      <div
                        class="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                        [style]="'width:24px;height:24px;background:var(--bs-' + task.assigneeColor + ');font-size:0.6rem;'">
                        {{ task.assigneeInitials }}
                      </div>
                      <span class="text-secondary" style="font-size:0.75rem;">{{ task.assignee }}</span>
                    </div>
                    <span
                      style="font-size:0.7rem;"
                      [class.text-danger]="isOverdue(task.dueDate) && task.status !== 'Done'"
                      [class.text-muted]="!isOverdue(task.dueDate) || task.status === 'Done'">
                      <i class="bi bi-calendar2 me-1"></i>{{ formatDate(task.dueDate) }}
                    </span>
                  </div>

                </div>
              </div>
            </li>

          } @empty {
            <li class="list-group-item text-center text-muted py-5">
              <i class="bi bi-check2-all d-block fs-1 mb-2 opacity-25"></i>
              All caught up! No tasks.
            </li>
          }

        </ul>
      </div>

    </div>
  `
})
export class RecentTasksComponent {
  readonly tasks = input<RecentTask[]>([]);

  statusClass(status: TaskStatus): string {
    const map: Record<TaskStatus, string> = {
      'Todo':       'bg-secondary',
      'InProgress': 'bg-primary',
      'InReview':   'bg-warning text-dark',
      'Done':       'bg-success',
    };
    return map[status];
  }

  statusLabel(status: TaskStatus): string {
    const map: Record<TaskStatus, string> = {
      'Todo':       'To Do',
      'InProgress': 'In Progress',
      'InReview':   'In Review',
      'Done':       'Done',
    };
    return map[status];
  }

  priorityColor(priority: Priority): string {
    const map: Record<Priority, string> = {
      'Low':      'secondary',
      'Medium':   'info',
      'High':     'warning',
      'Critical': 'danger',
    };
    return map[priority];
  }

  isOverdue(dueDate: Date): boolean {
    return new Date(dueDate) < new Date();
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric'
    }).format(new Date(date));
  }
}
