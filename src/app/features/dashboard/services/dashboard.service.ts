import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Employee } from '../../employees/models/employee.model';
import { Project } from '../../projects/models/project.model';
import { Task } from '../../tasks/models/task.model';
import { getInitials } from '../../../utils/functions.util';
import {
  DashboardStats, DashboardStatsDto, DashboardSummary, DashboardSummaryDto,
  RecentEmployee, RecentProject, RecentTask
} from '../models/dashboard.model';

/**
 * ═══════════════════════════════════════════════════════════════════
 * DASHBOARD SERVICE — real backend integration
 * ═══════════════════════════════════════════════════════════════════
 * GET /api/v1/dashboard returns full EmployeeDto[]/ProjectDto[]/TaskDto[] for the "recent"
 * lists and a differently-shaped stats object (`{ headcount: {value, changePercent}, ... }`) —
 * see dashboard.model.ts's header comment for the full explanation. This service is the ONLY
 * place that reshapes that raw response into the `DashboardSummary` shape every widget
 * component already expects; the widgets themselves are unchanged.
 *
 * Public API (summary/loading/error/hasData signals, loadDashboard(), refresh()) is
 * unchanged from the mock version, per this file's own prior comments anticipating exactly
 * this swap — DashboardComponent's template needs zero changes.
 */

const AVATAR_COLORS = ['primary', 'success', 'warning', 'info', 'danger', 'secondary'] as const;

function colorForId(id: number): string {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function toRecentEmployee(e: Employee): RecentEmployee {
  return {
    id: String(e.id),
    name: `${e.firstName} ${e.lastName}`,
    jobTitle: e.jobTitle,
    department: e.departmentName,
    initials: getInitials(`${e.firstName} ${e.lastName}`),
    color: colorForId(e.id),
    joinDate: new Date(e.hireDate),
    status: e.isActive ? 'Active' : 'Inactive'
  };
}

function toRecentProject(p: Project): RecentProject {
  return {
    id: String(p.id),
    name: p.name,
    status: p.status,
    priority: p.priority,
    progress: p.progress,
    dueDate: new Date(p.endDate),
    teamSize: p.teamSize,
    budget: p.budget
  };
}

function toRecentTask(t: Task): RecentTask {
  return {
    id: String(t.id),
    title: t.title,
    status: t.status,
    priority: t.priority,
    assignee: t.assigneeName,
    assigneeInitials: t.assigneeInitial,
    assigneeColor: colorForId(t.assigneeId),
    dueDate: new Date(t.dueDate),
    projectName: t.projectName
  };
}

function toDashboardStats(dto: DashboardStatsDto): DashboardStats {
  return {
    totalEmployees:   dto.headcount.value,
    employeeChange:   dto.headcount.changePercent,
    activeProjects:   dto.activeProjects.value,
    projectChange:    dto.activeProjects.changePercent,
    pendingTasks:     dto.pendingTasks.value,
    taskChange:       dto.pendingTasks.changePercent,
    totalDepartments: dto.departments.value,
    departmentChange: dto.departments.changePercent
  };
}

function toDashboardSummary(dto: DashboardSummaryDto): DashboardSummary {
  return {
    stats: toDashboardStats(dto.stats),
    recentEmployees: dto.recentEmployees.map(toRecentEmployee),
    recentProjects: dto.recentProjects.map(toRecentProject),
    recentTasks: dto.recentTasks.map(toRecentTask),
    lastUpdated: new Date(dto.lastUpdated)
  };
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly baseUrl = `${environment.apiUrl}/dashboard`;

  private readonly _summary = signal<DashboardSummary | null>(null);
  private readonly _loading = signal(false);
  private readonly _error   = signal<string | null>(null);

  readonly summary = this._summary.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error   = this._error.asReadonly();

  readonly hasData = computed(() => this._summary() !== null);

  /**
   * Trigger a dashboard data load. Guard prevents concurrent fetches if called multiple times.
   * Server-side cached for 45s (UIIntegrationInfo.md §4) — repeated calls within that window
   * return the same lastUpdated timestamp; that's expected, not a bug.
   */
  loadDashboard(): void {
    if (this._loading()) return;
    this._loading.set(true);
    this._error.set(null);

    this.http
      .get<ApiResponse<DashboardSummaryDto>>(this.baseUrl)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          this._summary.set(toDashboardSummary(res.data));
          this._loading.set(false);
        },
        error: (err: Error) => {
          this._error.set(err.message || 'Failed to load dashboard. Please try again.');
          this._loading.set(false);
        }
      });
  }

  /** Clear cached data and reload — shows skeleton during refresh. */
  refresh(): void {
    this._summary.set(null);
    this.loadDashboard();
  }
}
