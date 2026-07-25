import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RecentProject, ProjectStatus, Priority } from '../../models/dashboard.model';

/**
 * RECENT PROJECTS WIDGET — Presentational Component
 */
@Component({
  selector: 'app-recent-projects',
  standalone: true,
  imports: [RouterLink],
  styles: [`
    .project-card {
      transition: box-shadow 0.2s ease, transform 0.15s ease;
      cursor: default;
    }
    .project-card:hover {
      box-shadow: 0 4px 16px rgba(0,0,0,0.10) !important;
      transform: translateY(-1px);
    }
  `],
  template: `
    <div class="card border-0 shadow-sm">

      <!-- ── Card Header ──────────────────────────────────────────── -->
      <div class="card-header bg-white border-bottom d-flex align-items-center justify-content-between py-3 px-4">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-kanban-fill text-success fs-5"></i>
          <span class="fw-semibold">Recent Projects</span>
          <span class="badge bg-success bg-opacity-10 text-success rounded-pill">
            {{ projects().length }}
          </span>
        </div>
        <a routerLink="/projects" class="btn btn-sm btn-outline-success">
          View All <i class="bi bi-arrow-right ms-1"></i>
        </a>
      </div>

      <!-- ── Project Cards Grid ────────────────────────────────────── -->
      <div class="card-body p-3 p-md-4">
        <div class="row g-3">

          @for (project of projects(); track project.id) {
            <div class="col-12 col-md-6 col-xl-3">
              <div class="border rounded-3 p-3 h-100 position-relative project-card">

                <!-- Priority indicator bar (colored top strip) -->
                <div
                  class="rounded-top position-absolute top-0 start-0 end-0"
                  style="height:3px;"
                  [style.background]="'var(--bs-' + priorityColor(project.priority) + ')'">
                </div>

                <!-- Status + Priority badges -->
                <div class="d-flex align-items-center gap-2 mb-3 pt-1 flex-wrap">
                  <span [class]="'badge rounded-pill ' + statusClass(project.status)">
                    {{ statusLabel(project.status) }}
                  </span>
                  <span [class]="'badge rounded-pill bg-' + priorityColor(project.priority) + ' bg-opacity-15 text-' + priorityColor(project.priority)">
                    <i class="bi bi-flag-fill me-1" style="font-size:0.6rem;"></i>{{ project.priority }}
                  </span>
                </div>

                <!-- Project Name -->
                <h6 class="fw-semibold mb-1 lh-sm" style="font-size:0.9rem;">
                  {{ project.name }}
                </h6>

                <!-- Progress Bar -->
                <div class="mb-3">
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="text-muted" style="font-size:0.7rem;">Progress</span>
                    <span class="fw-semibold text-primary" style="font-size:0.75rem;">
                      {{ project.progress }}%
                    </span>
                  </div>
                  <div class="progress rounded-pill" style="height:6px;">
                    <div
                      class="progress-bar rounded-pill"
                      role="progressbar"
                      [style.width.%]="project.progress"
                      [attr.aria-valuenow]="project.progress"
                      aria-valuemin="0"
                      aria-valuemax="100"
                      [class]="progressBarClass(project.progress)">
                    </div>
                  </div>
                </div>

                <!-- Meta: Team + Budget + Due Date -->
                <div class="d-flex flex-column gap-1" style="font-size:0.75rem;">
                  <div class="d-flex align-items-center gap-2 text-secondary">
                    <i class="bi bi-people"></i>
                    <span>{{ project.teamSize }} team members</span>
                  </div>
                  <div class="d-flex align-items-center gap-2 text-secondary">
                    <i class="bi bi-cash"></i>
                    <span>{{ formatBudget(project.budget) }}</span>
                  </div>
                  <div class="d-flex align-items-center gap-2"
                       [class.text-danger]="isOverdue(project.dueDate)"
                       [class.text-secondary]="!isOverdue(project.dueDate)">
                    <i class="bi bi-calendar-event"></i>
                    <span>Due {{ formatDate(project.dueDate) }}</span>
                    @if (isOverdue(project.dueDate)) {
                      <span class="badge bg-danger rounded-pill ms-auto" style="font-size:0.6rem;">Overdue</span>
                    }
                  </div>
                </div>

              </div>
            </div>
          } @empty {
            <div class="col-12 text-center text-muted py-5">
              <i class="bi bi-kanban d-block fs-1 mb-2 opacity-25"></i>
              No recent projects
            </div>
          }

        </div>
      </div>
    </div>
  `
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
