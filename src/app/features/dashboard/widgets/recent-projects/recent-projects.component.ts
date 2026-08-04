import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RecentProject, ProjectStatus, Priority } from '../../models/dashboard.model';

/**
 * RECENT PROJECTS WIDGET — Presentational Component
 */
@Component({
  selector: 'app-recent-projects',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './recent-projects.component.html',
  styleUrl: './recent-projects.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecentProjectsComponent {
  readonly projects = input<RecentProject[]>([]);

  statusClass(status: ProjectStatus): string {
    const map: Record<ProjectStatus, string> = {
      'Planning':  'bg-secondary',
      'Active':    'bg-success',
      'OnHold':    'bg-warning text-dark',
      'Completed': 'bg-info',
      'Cancelled': 'bg-danger',
    };
    return map[status];
  }

  statusLabel(status: ProjectStatus): string {
    const map: Record<ProjectStatus, string> = {
      'Planning':  'Planning',
      'Active':    'Active',
      'OnHold':    'On Hold',
      'Completed': 'Completed',
      'Cancelled': 'Cancelled',
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

  progressBarClass(progress: number): string {
    if (progress >= 75) return 'bg-success';
    if (progress >= 40) return 'bg-primary';
    if (progress >= 20) return 'bg-warning';
    return 'bg-danger';
  }

  isOverdue(dueDate: Date): boolean {
    return new Date(dueDate) < new Date();
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    }).format(new Date(date));
  }

  formatBudget(amount: number): string {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000)     return `$${(amount / 1_000).toFixed(0)}K`;
    return `$${amount}`;
  }
}
