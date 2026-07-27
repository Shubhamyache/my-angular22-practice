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

import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
      
      <!-- Page size selector -->
      <div class="d-flex align-items-center gap-2">
        <label for="pageSize" class="form-label mb-0 small text-muted">
          Items per page:
        </label>
        <select
          id="pageSize"
          class="form-select form-select-sm"
          style="width: auto;"
          [ngModel]="pageSize"
          (ngModelChange)="onPageSizeChange($event)">
          @for (size of pageSizeOptions; track size) {
            <option [value]="size">{{ size }}</option>
          }
        </select>
      </div>

      <!-- Pagination info -->
      <div class="text-muted small">
        Showing {{ startItem() }} to {{ endItem() }} of {{ totalItems }} items
      </div>

      <!-- Page navigation -->
      <nav aria-label="Pagination">
        <ul class="pagination pagination-sm mb-0">
          
          <!-- Previous button -->
          <li class="page-item" [class.disabled]="currentPage === 1">
            <button
              class="page-link"
              (click)="goToPage(currentPage - 1)"
              [disabled]="currentPage === 1"
              [attr.aria-label]="'Previous page'">
              <i class="bi bi-chevron-left"></i>
            </button>
          </li>

          <!-- First page -->
          @if (shouldShowFirst()) {
            <li class="page-item">
              <button class="page-link" (click)="goToPage(1)">1</button>
            </li>
            @if (shouldShowFirstEllipsis()) {
              <li class="page-item disabled">
                <span class="page-link">...</span>
              </li>
            }
          }

          <!-- Page numbers -->
          @for (page of visiblePages(); track page) {
            <li class="page-item" [class.active]="page === currentPage">
              <button
                class="page-link"
                (click)="goToPage(page)"
                [attr.aria-label]="'Page ' + page"
                [attr.aria-current]="page === currentPage ? 'page' : null">
                {{ page }}
              </button>
            </li>
          }

          <!-- Last page -->
          @if (shouldShowLast()) {
            @if (shouldShowLastEllipsis()) {
              <li class="page-item disabled">
                <span class="page-link">...</span>
              </li>
            }
            <li class="page-item">
              <button class="page-link" (click)="goToPage(totalPages())">
                {{ totalPages() }}
              </button>
            </li>
          }

          <!-- Next button -->
          <li class="page-item" [class.disabled]="currentPage === totalPages()">
            <button
              class="page-link"
              (click)="goToPage(currentPage + 1)"
              [disabled]="currentPage === totalPages()"
              [attr.aria-label]="'Next page'">
              <i class="bi bi-chevron-right"></i>
            </button>
          </li>

        </ul>
      </nav>

    </div>
  `,
  styles: [`
    :host {
      display: block;
      padding: 1rem 0;
    }

    .page-link {
      min-width: 32px;
      text-align: center;
    }

    .page-item.active .page-link {
      background-color: #0d6efd;
      border-color: #0d6efd;
    }
  `]
})
export class PaginationComponent {
  // ════════════════════════════════════════════════════════════════
  // INPUTS: Configuration from parent
  // ════════════════════════════════════════════════════════════════
  @Input() currentPage = 1;
  @Input() totalItems = 0;
  @Input() pageSize = 20;
  @Input() maxPages = 7; // Maximum page buttons to show
  @Input() pageSizeOptions = [10, 20, 50, 100];

  // ════════════════════════════════════════════════════════════════
  // OUTPUTS: Events emitted to parent
  // ════════════════════════════════════════════════════════════════
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  // ════════════════════════════════════════════════════════════════
  // COMPUTED SIGNALS: Derived reactive state
  // ════════════════════════════════════════════════════════════════
  
  /**
   * COMPUTED: Total number of pages
   */
  protected readonly totalPages = computed(() => {
    return Math.ceil(this.totalItems / this.pageSize) || 1;
  });

  /**
   * COMPUTED: Start item number
   */
  protected readonly startItem = computed(() => {
    return ((this.currentPage - 1) * this.pageSize) + 1;
  });

  /**
   * COMPUTED: End item number
   */
  protected readonly endItem = computed(() => {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  });

  /**
   * COMPUTED: Visible page numbers
   * Smart algorithm to show relevant pages with ellipsis
   */
  protected readonly visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage;
    const max = this.maxPages;

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
    if (page < 1 || page > this.totalPages() || page === this.currentPage) {
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
