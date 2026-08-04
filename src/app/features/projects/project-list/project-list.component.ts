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
import { ProjectStatus } from '../models/project.model';
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

  // Local UI state
  protected searchTerm = '';

  // Status filter options
  protected readonly statusFilters: Array<ProjectStatus | 'All'> = [
    'All', 'Active', 'OnHold', 'Completed', 'Cancelled'
  ];

  // Status badge configuration
  protected readonly statusConfig: Record<ProjectStatus, { badge: string; label: string }> = {
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
   * Handle project deletion with confirmation
   */
  confirmDelete(id: number, name: string): void {
    if (confirm(`Are you sure you want to delete project "${name}"?`)) {
      this.store.removeProject(id);
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
