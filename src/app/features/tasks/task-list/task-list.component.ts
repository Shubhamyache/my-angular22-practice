/**
 * ═══════════════════════════════════════════════════════════════════
 * TASK LIST COMPONENT — with Search, Filter, Sort
 * ═══════════════════════════════════════════════════════════════════
 */

import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskStore } from '../store/task.store';
import { TaskService } from '../services/task.service';
import { TaskStatus, TaskPriority } from '../models/task.model';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterModule,
    FormsModule,
    LoaderComponent,
    DateFormatPipe
  ],
  templateUrl: './task-list.component.html'
})
export class TaskListComponent implements OnInit {
  protected readonly store = inject(TaskStore);
  private readonly taskService = inject(TaskService);
  private readonly authService = inject(AuthService);

  /** Create/edit/delete — Admin, Manager per §13 (HR is read-only on Tasks). Per-record
   *  "is this Manager's own project" ownership is enforced by the backend via 403, not
   *  precomputed here (TaskDto carries no project.managerId to check against). */
  protected readonly canManageTasks = ['Admin', 'Manager'].includes(this.authService.getUserRole());

  protected searchTerm = '';

  protected readonly statuses: Array<TaskStatus | 'All'> = [
    'All', 'Todo', 'InProgress', 'InReview', 'Done'
  ];

  protected readonly priorities: Array<TaskPriority | 'All'> = [
    'All', 'Low', 'Medium', 'High', 'Critical'
  ];

  protected readonly statusConfig: Record<TaskStatus, { badge: string; label: string; icon: string }> = {
    Todo:       { badge: 'bg-secondary',        label: 'To Do',       icon: 'bi-circle' },
    InProgress: { badge: 'bg-primary',          label: 'In Progress', icon: 'bi-arrow-repeat' },
    InReview:   { badge: 'bg-warning text-dark', label: 'In Review',   icon: 'bi-eye' },
    Done:       { badge: 'bg-success',          label: 'Done',        icon: 'bi-check-circle-fill' }
  };

  protected readonly priorityConfig: Record<TaskPriority, { badge: string; label: string }> = {
    Low:      { badge: 'text-secondary border border-secondary', label: 'Low' },
    Medium:   { badge: 'text-info border border-info',           label: 'Medium' },
    High:     { badge: 'text-warning border border-warning',     label: 'High' },
    Critical: { badge: 'text-danger border border-danger',       label: 'Critical' }
  };

  ngOnInit(): void {
    this.store.loadTasks();
  }

  onSearch(query: string): void {
    this.store.setSearchQuery(query);
  }

  onStatusFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value as TaskStatus | '' | 'All';
    this.store.setStatusFilter((value || 'All') as TaskStatus | 'All');
  }

  onPriorityFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value as TaskPriority | '' | 'All';
    this.store.setPriorityFilter((value || 'All') as TaskPriority | 'All');
  }

  onSort(field: 'title' | 'dueDate' | 'priority' | 'status'): void {
    this.store.setSorting(field);
  }

  getSortIcon(field: string): string {
    if (this.store.sortBy() !== field) {
      return '↕️';
    }
    return this.store.sortDirection() === 'asc' ? '↑' : '↓';
  }

  /**
   * Previously called store.removeTask(id) directly without ever calling DELETE
   * /tasks/{id} — fixed to call the real endpoint first (same fix as EmployeeListComponent
   * / ProjectListComponent).
   */
  confirmDelete(task: { id: number; title: string }): void {
    if (confirm(`Are you sure you want to delete task "${task.title}"?`)) {
      this.taskService.delete(task.id).subscribe({
        next: () => this.store.removeTask(task.id)
      });
    }
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.store.clearFilters();
  }

  /**
   * Check if task is overdue
   */
  isOverdue(task: { dueDate: string; status: TaskStatus }): boolean {
    return task.status !== 'Done' && new Date(task.dueDate) < new Date();
  }
}

