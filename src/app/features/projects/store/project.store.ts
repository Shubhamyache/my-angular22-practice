/**
 * ═══════════════════════════════════════════════════════════════════
 * PROJECT STORE — Client-Side State Management with Signals
 * ═══════════════════════════════════════════════════════════════════
 *
 * WHAT IS A STORE?
 * ─────────────────
 * A store is a centralized container for application state. Think of it
 * as an in-memory database on the client side.
 *
 * WHY USE A STORE PATTERN?
 * ─────────────────────────
 * 1. **Single Source of Truth**: All components read from the same state
 * 2. **Predictable Updates**: State changes flow through defined actions
 * 3. **Reactivity**: Components auto-update when state changes
 * 4. **Debugging**: Easier to track state changes in one place
 * 5. **Performance**: Avoid redundant API calls; cache data
 *
 * SIGNALS vs RxJS:
 * ─────────────────
 * Angular 16+ introduced Signals as a simpler alternative to RxJS
 * for state management.
 *
 * OLD (RxJS BehaviorSubject):
 *   private projectsSubject = new BehaviorSubject<Project[]>([]);
 *   readonly projects$ = this.projectsSubject.asObservable();
 *
 *   // In template:
 *   projects$ | async
 *
 * NEW (Signals):
 *   private _projects = signal<Project[]>([]);
 *   readonly projects = this._projects.asReadonly();
 *
 *   // In template:
 *   projects()
 *
 * Benefits of Signals:
 * - Simpler syntax (no async pipe)
 * - Better performance (fine-grained reactivity)
 * - Easier to compose with computed()
 * - No subscription cleanup needed
 * - Zone-less compatible
 *
 * INTERVIEW QUESTION:
 * ────────────────────
 * Q: "When would you use RxJS instead of Signals?"
 * A: "RxJS is still better for:
 *     - Complex async operations (debounce, retry, etc.)
 *     - HTTP requests (HttpClient returns Observables)
 *     - Event streams
 *     - WebSocket data
 *     However, for simple state management, Signals are preferred."
 *
 * READONLY SIGNALS:
 * ──────────────────
 * We expose signals as readonly to prevent external mutation:
 *
 *   readonly projects = this._projects.asReadonly();
 *
 * Components can READ but not WRITE. Only the store can update via actions.
 * This enforces unidirectional data flow (like Redux).
 *
 * COMPUTED SIGNALS:
 * ──────────────────
 * Derived state automatically recomputes when dependencies change:
 *
 *   readonly activeProjects = computed(() =>
 *     this._projects().filter(p => p.status === 'Active')
 *   );
 *
 * If _projects changes, activeProjects automatically recalculates.
 * Only re-runs if input actually changed (memoized).
 *
 * PROVIDEDLEVEL IN: 'ROOT':
 * ───────────────────────────
 * Store is a singleton shared across the entire app.
 * All components get the same instance.
 */

import { Injectable, computed, inject, signal } from '@angular/core';
import { Project, ProjectStatus } from '../models/project.model';
import { ProjectService } from '../services/project.service';

@Injectable({ providedIn: 'root' })
export class ProjectStore {
  private readonly projectService = inject(ProjectService);

  // ═══════════════════════════════════════════════════════════════════
  // PRIVATE WRITABLE STATE
  // ═══════════════════════════════════════════════════════════════════
  private readonly _projects         = signal<Project[]>([]);
  private readonly _loading          = signal(false);
  private readonly _error            = signal<string | null>(null);
  private readonly _selectedProject  = signal<Project | null>(null);
  private readonly _searchQuery      = signal('');
  private readonly _statusFilter     = signal<ProjectStatus | 'All'>('All');
  private readonly _sortBy           = signal<'name' | 'startDate' | 'budget' | 'progress'>('name');
  private readonly _sortDirection    = signal<'asc' | 'desc'>('asc');

  // ═══════════════════════════════════════════════════════════════════
  // PUBLIC READONLY STATE
  // ═══════════════════════════════════════════════════════════════════
  readonly projects        = this._projects.asReadonly();
  readonly loading         = this._loading.asReadonly();
  readonly error           = this._error.asReadonly();
  readonly selectedProject = this._selectedProject.asReadonly();
  readonly searchQuery     = this._searchQuery.asReadonly();
  readonly statusFilter    = this._statusFilter.asReadonly();
  readonly sortBy          = this._sortBy.asReadonly();
  readonly sortDirection   = this._sortDirection.asReadonly();

  // ═══════════════════════════════════════════════════════════════════
  // COMPUTED (DERIVED) STATE
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Filtered, searched, and sorted projects
   * This automatically recalculates when any dependency changes
   */
  readonly filteredProjects = computed(() => {
    let result = this._projects();

    // 1. Apply status filter
    const status = this._statusFilter();
    if (status !== 'All') {
      result = result.filter(p => p.status === status);
    }

    // 2. Apply search
    const query = this._searchQuery().toLowerCase().trim();
    if (query) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.code.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.managerName.toLowerCase().includes(query)
      );
    }

    // 3. Apply sorting
    const sortBy = this._sortBy();
    const direction = this._sortDirection() === 'asc' ? 1 : -1;

    result = [...result].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'startDate':
          comparison = a.startDate.localeCompare(b.startDate);
          break;
        case 'budget':
          comparison = a.budget - b.budget;
          break;
        case 'progress':
          comparison = a.progress - b.progress;
          break;
      }
      return comparison * direction;
    });

    return result;
  });

  /**
   * Project statistics
   */
  readonly stats = computed(() => {
    const all = this._projects();
    return {
      total: all.length,
      active: all.filter(p => p.status === 'Active').length,
      completed: all.filter(p => p.status === 'Completed').length,
      onHold: all.filter(p => p.status === 'OnHold').length,
      cancelled: all.filter(p => p.status === 'Cancelled').length,
      totalBudget: all.reduce((sum, p) => sum + p.budget, 0),
      totalSpent: all.reduce((sum, p) => sum + p.spent, 0)
    };
  });

  // ═══════════════════════════════════════════════════════════════════
  // ACTIONS — Methods that modify state
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Load all projects from service
   */
  loadProjects(): void {
    this._loading.set(true);
    this._error.set(null);

    this.projectService.getAll().subscribe({
      next: data => {
        this._projects.set(data);
        this._loading.set(false);
      },
      error: (err: Error) => {
        this._error.set(err.message);
        this._loading.set(false);
      }
    });
  }

  /**
   * Select a project for detail view
   */
  selectProject(project: Project | null): void {
    this._selectedProject.set(project);
  }

  /**
   * Load single project by ID
   */
  loadProjectById(id: number): void {
    this._loading.set(true);
    this.projectService.getById(id).subscribe({
      next: proj => {
        this._selectedProject.set(proj);
        this._loading.set(false);
      },
      error: (err: Error) => {
        this._error.set(err.message);
        this._loading.set(false);
      }
    });
  }

  /**
   * Add new project to store
   */
  addProject(project: Project): void {
    this._projects.update(list => [project, ...list]);
  }

  /**
   * Update existing project
   */
  updateProject(updated: Project): void {
    this._projects.update(list =>
      list.map(p => (p.id === updated.id ? updated : p))
    );
    if (this._selectedProject()?.id === updated.id) {
      this._selectedProject.set(updated);
    }
  }

  /**
   * Remove project from store
   */
  removeProject(id: number): void {
    this._projects.update(list => list.filter(p => p.id !== id));
    if (this._selectedProject()?.id === id) {
      this._selectedProject.set(null);
    }
  }

  /**
   * Set search query
   */
  setSearchQuery(query: string): void {
    this._searchQuery.set(query);
  }

  /**
   * Set status filter
   */
  setStatusFilter(status: ProjectStatus | 'All'): void {
    this._statusFilter.set(status);
  }

  /**
   * Toggle sort direction or change sort field
   */
  setSorting(field: 'name' | 'startDate' | 'budget' | 'progress'): void {
    if (this._sortBy() === field) {
      // Toggle direction if same field
      this._sortDirection.update(dir => dir === 'asc' ? 'desc' : 'asc');
    } else {
      // Change field and reset to ascending
      this._sortBy.set(field);
      this._sortDirection.set('asc');
    }
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this._searchQuery.set('');
    this._statusFilter.set('All');
    this._sortBy.set('name');
    this._sortDirection.set('asc');
  }
}
