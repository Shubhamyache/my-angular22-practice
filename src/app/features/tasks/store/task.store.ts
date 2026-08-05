/**
 * ═══════════════════════════════════════════════════════════════════
 * TASK STORE — Client-Side State Management with Signals
 * ═══════════════════════════════════════════════════════════════════
 */

import { Injectable, computed, inject, signal } from '@angular/core';
import { Task, TaskStatus, TaskPriority } from '../models/task.model';
import { TaskService } from '../services/task.service';

@Injectable({ providedIn: 'root' })
export class TaskStore {
  private readonly taskService = inject(TaskService);

  // ═══════════════════════════════════════════════════════════════════
  // PRIVATE WRITABLE STATE
  // ═══════════════════════════════════════════════════════════════════
  private readonly _tasks          = signal<Task[]>([]);
  private readonly _loading        = signal(false);
  private readonly _error          = signal<string | null>(null);
  private readonly _selectedTask   = signal<Task | null>(null);
  private readonly _searchQuery    = signal('');
  private readonly _statusFilter   = signal<TaskStatus | 'All'>('All');
  private readonly _priorityFilter = signal<TaskPriority | 'All'>('All');
  private readonly _sortBy         = signal<'title' | 'dueDate' | 'priority' | 'status'>('dueDate');
  private readonly _sortDirection  = signal<'asc' | 'desc'>('asc');

  // ═══════════════════════════════════════════════════════════════════
  // PUBLIC READONLY STATE
  // ═══════════════════════════════════════════════════════════════════
  readonly tasks          = this._tasks.asReadonly();
  readonly loading        = this._loading.asReadonly();
  readonly error          = this._error.asReadonly();
  readonly selectedTask   = this._selectedTask.asReadonly();
  readonly searchQuery    = this._searchQuery.asReadonly();
  readonly statusFilter   = this._statusFilter.asReadonly();
  readonly priorityFilter = this._priorityFilter.asReadonly();
  readonly sortBy         = this._sortBy.asReadonly();
  readonly sortDirection  = this._sortDirection.asReadonly();

  // ═══════════════════════════════════════════════════════════════════
  // COMPUTED (DERIVED) STATE
  // ═══════════════════════════════════════════════════════════════════

  readonly filteredTasks = computed(() => {
    let result = this._tasks();

    // 1. Apply status filter
    const status = this._statusFilter();
    if (status !== 'All') {
      result = result.filter(t => t.status === status);
    }

    // 2. Apply priority filter
    const priority = this._priorityFilter();
    if (priority !== 'All') {
      result = result.filter(t => t.priority === priority);
    }

    // 3. Apply search
    const query = this._searchQuery().toLowerCase().trim();
    if (query) {
      result = result.filter(t =>
        t.title.toLowerCase().includes(query) ||
        (t.description?.toLowerCase().includes(query) ?? false) ||
        t.projectName.toLowerCase().includes(query) ||
        t.assigneeName.toLowerCase().includes(query)
      );
    }

    // 4. Apply sorting
    const sortBy = this._sortBy();
    const direction = this._sortDirection() === 'asc' ? 1 : -1;

    result = [...result].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'dueDate':
          comparison = a.dueDate.localeCompare(b.dueDate);
          break;
        case 'priority':
          const priorityOrder = { Low: 1, Medium: 2, High: 3, Critical: 4 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'status':
          const statusOrder = { Todo: 1, InProgress: 2, InReview: 3, Done: 4 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
      }
      return comparison * direction;
    });

    return result;
  });

  /**
   * Tasks grouped by status (for Kanban board)
   */
  readonly tasksByStatus = computed(() => {
    const all = this._tasks();
    return {
      todo:       all.filter(t => t.status === 'Todo'),
      inProgress: all.filter(t => t.status === 'InProgress'),
      inReview:   all.filter(t => t.status === 'InReview'),
      done:       all.filter(t => t.status === 'Done')
    };
  });

  /**
   * Task statistics
   */
  readonly stats = computed(() => {
    const all = this._tasks();
    return {
      total:      all.length,
      todo:       all.filter(t => t.status === 'Todo').length,
      inProgress: all.filter(t => t.status === 'InProgress').length,
      inReview:   all.filter(t => t.status === 'InReview').length,
      done:       all.filter(t => t.status === 'Done').length,
      overdue:    all.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Done').length,
      critical:   all.filter(t => t.priority === 'Critical').length
    };
  });

  // ═══════════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════════

  loadTasks(projectId?: number): void {
    this._loading.set(true);
    this._error.set(null);

    this.taskService.getAll(projectId).subscribe({
      next: data => {
        this._tasks.set(data);
        this._loading.set(false);
      },
      error: (err: Error) => {
        this._error.set(err.message);
        this._loading.set(false);
      }
    });
  }

  selectTask(task: Task | null): void {
    this._selectedTask.set(task);
  }

  loadTaskById(id: number): void {
    this._loading.set(true);
    this._error.set(null);
    this.taskService.getById(id).subscribe({
      next: task => {
        this._selectedTask.set(task);
        this._loading.set(false);
      },
      error: (err: Error) => {
        this._error.set(err.message);
        this._loading.set(false);
      }
    });
  }

  addTask(task: Task): void {
    this._tasks.update(list => [task, ...list]);
  }

  updateTask(updated: Task): void {
    this._tasks.update(list =>
      list.map(t => (t.id === updated.id ? updated : t))
    );
    if (this._selectedTask()?.id === updated.id) {
      this._selectedTask.set(updated);
    }
  }

  removeTask(id: number): void {
    this._tasks.update(list => list.filter(t => t.id !== id));
    if (this._selectedTask()?.id === id) {
      this._selectedTask.set(null);
    }
  }

  setSearchQuery(query: string): void {
    this._searchQuery.set(query);
  }

  setStatusFilter(status: TaskStatus | 'All'): void {
    this._statusFilter.set(status);
  }

  setPriorityFilter(priority: TaskPriority | 'All'): void {
    this._priorityFilter.set(priority);
  }

  setSorting(field: 'title' | 'dueDate' | 'priority' | 'status'): void {
    if (this._sortBy() === field) {
      this._sortDirection.update(dir => dir === 'asc' ? 'desc' : 'asc');
    } else {
      this._sortBy.set(field);
      this._sortDirection.set('asc');
    }
  }

  clearFilters(): void {
    this._searchQuery.set('');
    this._statusFilter.set('All');
    this._priorityFilter.set('All');
    this._sortBy.set('dueDate');
    this._sortDirection.set('asc');
  }
}
