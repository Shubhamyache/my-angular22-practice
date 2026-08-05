/**
 * ═══════════════════════════════════════════════════════════════════
 * PROJECT LIST COMPONENT — Smart Component with Store Integration
 * ═══════════════════════════════════════════════════════════════════
 *
 * COMPONENT COMMUNICATION PATTERN:
 * ─────────────────────────────────
 * This is a "Smart" or "Container" component. It:
 * - Injects services/stores
 * - Manages state
 * - Handles user actions
 * - Passes data to dumb components
 *
 * REACTIVE PATTERNS:
 * ───────────────────
 * Uses Signals for reactivity instead of RxJS. The template
 * reads signal values by calling them: projects()
 *
 * SEARCH/FILTER/SORT:
 * ────────────────────
 * All logic is in the store's computed signals. This component
 * just triggers the actions. Separation of concerns!
 */

import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectStore } from '../store/project.store';
import { ProjectService } from '../services/project.service';
import { ProjectStatus } from '../models/project.model';
import { AuthService } from '../../../core/services/auth.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-project-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterModule,
    FormsModule,
    LoaderComponent,
    CurrencyFormatPipe,
    DateFormatPipe
  ],
  templateUrl: './project-list.component.html'
})
export class ProjectListComponent implements OnInit {
  protected readonly store = inject(ProjectStore);
  private readonly projectService = inject(ProjectService);
  private readonly authService = inject(AuthService);

  /** Create/edit/delete — Admin, Manager per §13 (HR is read-only on Projects; ownership of
   *  an individual project for a Manager is enforced by the backend via 403, not precomputed
   *  here — see UIIntegrationInfo.md §13's guidance on why route/coarse checks can't fully
   *  express per-record ownership). */
  protected readonly canManageProjects = ['Admin', 'Manager'].includes(this.authService.getUserRole());

  // Local UI state
  protected searchTerm = '';

  // Status filter options
  protected readonly statusFilters: Array<ProjectStatus | 'All'> = [
    'All', 'Planning', 'Active', 'OnHold', 'Completed', 'Cancelled'
  ];

  // Status badge configuration — 'Planning' added to match the real ProjectStatus enum
  // (UIIntegrationInfo.md §5), which this app's mock data never produced.
  protected readonly statusConfig: Record<ProjectStatus, { badge: string; label: string }> = {
    Planning:  { badge: 'bg-info text-dark',       label: 'Planning' },
    Active:    { badge: 'bg-success',              label: 'Active' },
    OnHold:    { badge: 'bg-warning text-dark',    label: 'On Hold' },
    Completed: { badge: 'bg-primary',              label: 'Completed' },
    Cancelled: { badge: 'bg-secondary',            label: 'Cancelled' }
  };

  // Priority badge configuration
  protected readonly priorityConfig = {
    Low:      { badge: 'bg-secondary', dot: 'bg-secondary' },
    Medium:   { badge: 'bg-info text-dark', dot: 'bg-info' },
    High:     { badge: 'bg-warning text-dark', dot: 'bg-warning' },
    Critical: { badge: 'bg-danger',    dot: 'bg-danger' }
  };

  ngOnInit(): void {
    this.store.loadProjects();
  }

  /**
   * Handle search input with debouncing would be nice here,
   * but for simplicity we update on every keystroke
   */
  onSearch(query: string): void {
    this.store.setSearchQuery(query);
  }

  /**
   * Handle status filter change
   */
  onStatusFilterChange(status: ProjectStatus | 'All'): void {
    this.store.setStatusFilter(status);
  }

  /**
   * Handle sort change
   */
  onSort(field: 'name' | 'startDate' | 'budget' | 'progress'): void {
    this.store.setSorting(field);
  }

  /**
   * Get sort icon for a field
   */
  getSortIcon(field: string): string {
    if (this.store.sortBy() !== field) {
      return 'bi-arrow-down-up text-muted';
    }
    return this.store.sortDirection() === 'asc'
      ? 'bi-sort-up'
      : 'bi-sort-down';
  }

  /**
   * Handle project deletion with confirmation. Previously called store.removeProject(id)
   * directly without ever calling DELETE /projects/{id} — fixed to call the real endpoint
   * first (see EmployeeListComponent.confirmDelete for the same fix + rationale).
   */
  confirmDelete(id: number, name: string): void {
    if (confirm(`Are you sure you want to delete project "${name}"?`)) {
      this.projectService.delete(id).subscribe({
        next: () => this.store.removeProject(id)
      });
    }
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.store.clearFilters();
  }
}
