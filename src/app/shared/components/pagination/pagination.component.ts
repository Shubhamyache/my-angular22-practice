/**
 * ═══════════════════════════════════════════════════════════════════
 * REUSABLE PAGINATION COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 * ENTERPRISE PATTERN: Smart Pagination with Signals
 * ──────────────────────────────────────────────────
 * This component handles pagination logic and UI for any list.
 *
 * WHY REUSABLE PAGINATION?
 * ────────────────────────
 * - Consistent pagination UX across all features
 * - Handles edge cases (first/last page, page boundaries)
 * - Responsive design (collapses on mobile)
 * - Accessibility (ARIA labels, keyboard navigation)
 * - Smart ellipsis for large page counts
 *
 * USAGE:
 * ──────
 * <app-pagination
 *   [currentPage]="page"
 *   [totalItems]="1000"
 *   [pageSize]="20"
 *   [maxPages]="7"
 *   (pageChange)="onPageChange($event)"
 *   (pageSizeChange)="onPageSizeChange($event)" />
 */

import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginationComponent {
  // ════════════════════════════════════════════════════════════════
  // INPUTS: Configuration from parent
  // ════════════════════════════════════════════════════════════════
  readonly currentPage = input(1);
  readonly totalItems = input(0);
  readonly pageSize = input(20);
  readonly maxPages = input(7); // Maximum page buttons to show
  readonly pageSizeOptions = input([10, 20, 50, 100]);

  // ════════════════════════════════════════════════════════════════
  // OUTPUTS: Events emitted to parent
  // ════════════════════════════════════════════════════════════════
  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();

  // ════════════════════════════════════════════════════════════════
  // COMPUTED SIGNALS: Derived reactive state
  // ════════════════════════════════════════════════════════════════

  /**
   * COMPUTED: Total number of pages
   */
  protected readonly totalPages = computed(() => {
    return Math.ceil(this.totalItems() / this.pageSize()) || 1;
  });

  /**
   * COMPUTED: Start item number
   */
  protected readonly startItem = computed(() => {
    return ((this.currentPage() - 1) * this.pageSize()) + 1;
  });

  /**
   * COMPUTED: End item number
   */
  protected readonly endItem = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.totalItems());
  });

  /**
   * COMPUTED: Visible page numbers
   * Smart algorithm to show relevant pages with ellipsis
   */
  protected readonly visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const max = this.maxPages();

    // If total pages fit in max, show all
    if (total <= max) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    // Calculate range around current page
    const halfMax = Math.floor(max / 2);
    let start = Math.max(2, current - halfMax);
    let end = Math.min(total - 1, current + halfMax);

    // Adjust if at boundaries
    if (current <= halfMax) {
      end = max - 1;
    }
    if (current >= total - halfMax) {
      start = total - max + 2;
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  });

  // ════════════════════════════════════════════════════════════════
  // HELPER METHODS: UI logic
  // ════════════════════════════════════════════════════════════════

  protected shouldShowFirst(): boolean {
    return !this.visiblePages().includes(1);
  }

  protected shouldShowLast(): boolean {
    return !this.visiblePages().includes(this.totalPages());
  }

  protected shouldShowFirstEllipsis(): boolean {
    return this.visiblePages()[0] > 2;
  }

  protected shouldShowLastEllipsis(): boolean {
    const visible = this.visiblePages();
    return visible[visible.length - 1] < this.totalPages() - 1;
  }

  // ════════════════════════════════════════════════════════════════
  // USER ACTIONS
  // ════════════════════════════════════════════════════════════════

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) {
      return;
    }
    this.pageChange.emit(page);
  }

  onPageSizeChange(newSize: number): void {
    // Reset to page 1 when page size changes
    this.pageSizeChange.emit(newSize);
    this.pageChange.emit(1);
  }
}
