import { ChangeDetectionStrategy, Component, input } from '@angular/core';
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
  templateUrl: './recent-tasks.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
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
