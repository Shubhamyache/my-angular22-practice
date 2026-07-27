/**
 * ═══════════════════════════════════════════════════════════════════
 * REUSABLE SEARCH BOX COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 * ENTERPRISE PATTERN: Debounced Search with Signals
 * ──────────────────────────────────────────────────────────────────
 * This component provides a reusable search input with:
 * - Debounced input (prevents excessive API calls)
 * - Clear button
 * - Loading state indicator
 * - Accessibility features
 *
 * WHY DEBOUNCING?
 * ───────────────
 * Without debouncing, every keystroke triggers a search.
 * For "Angular", that's 7 API calls instead of 1.
 * Debouncing waits for user to stop typing before emitting.
 *
 * USAGE:
 * ──────
 * <app-search-box
 *   placeholder="Search tasks..."
 *   [debounceTime]="400"
 *   (search)="onSearch($event)" />
 */

import { Component, Output, EventEmitter, Input, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-box',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-box" [class.search-box-sm]="size === 'sm'">
      <div class="input-group">
        <span class="input-group-text bg-white border-end-0">
          @if (loading()) {
            <span class="spinner-border spinner-border-sm text-primary"></span>
          } @else {
            <i class="bi bi-search text-muted"></i>
          }
        </span>
        
        <input
          type="search"
          class="form-control border-start-0 ps-0"
          [placeholder]="placeholder"
          [(ngModel)]="searchTerm"
          (ngModelChange)="onInputChange($event)"
          [attr.aria-label]="ariaLabel || 'Search'"
          autocomplete="off" />

        @if (searchTerm) {
          <button
            type="button"
            class="btn btn-link text-secondary px-2"
            (click)="clear()"
            [attr.aria-label]="'Clear search'">
            <i class="bi bi-x-lg"></i>
          </button>
        }
      </div>

      @if (showResultCount && resultCount() !== null) {
        <small class="text-muted mt-1 d-block">
          {{ resultCount() }} {{ resultCount() === 1 ? 'result' : 'results' }}
        </small>
      }
    </div>
  `,
  styles: [`
    .search-box {
      width: 100%;
    }

    .search-box-sm .input-group {
      max-width: 300px;
    }

    .input-group {
      border: 1px solid #dee2e6;
      border-radius: 0.375rem;
      overflow: hidden;
    }

    .input-group:focus-within {
      border-color: #86b7fe;
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }

    .form-control {
      border: none !important;
      box-shadow: none !important;
    }

    .input-group-text {
      border: none;
    }

    .btn-link {
      border: none;
      background: none;
    }

    .btn-link:hover {
      background-color: #f8f9fa;
    }
  `]
})
export class SearchBoxComponent {
  // ════════════════════════════════════════════════════════════════
  // INPUTS: Configuration from parent
  // ════════════════════════════════════════════════════════════════
  @Input() placeholder = 'Search...';
  @Input() debounceTime = 400; // ms
  @Input() size: 'default' | 'sm' = 'default';
  @Input() showResultCount = false;
  @Input() ariaLabel = '';
  
  // ════════════════════════════════════════════════════════════════
  // OUTPUTS: Events emitted to parent
  // ════════════════════════════════════════════════════════════════
  @Output() search = new EventEmitter<string>();
  @Output() clear$ = new EventEmitter<void>();

  // ════════════════════════════════════════════════════════════════
  // SIGNALS: Reactive state
  // ════════════════════════════════════════════════════════════════
  protected readonly loading = signal(false);
  protected readonly resultCount = signal<number | null>(null);
  
  protected searchTerm = '';
  private debounceTimer?: number;

  /**
   * SIGNAL EFFECT: React to loading state changes
   * This demonstrates how effects can be used for side effects
   */
  constructor() {
    effect(() => {
      if (this.loading()) {
        // Could trigger analytics, logging, etc.
        console.debug('Search in progress...');
      }
    });
  }

  /**
   * DEBOUNCED INPUT HANDLER
   * ───────────────────────
   * Waits for user to stop typing before emitting search event
   */
  onInputChange(value: string): void {
    // Clear previous timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set loading state
    this.loading.set(value.length > 0);

    // Create new timer
    this.debounceTimer = window.setTimeout(() => {
      this.search.emit(value);
      this.loading.set(false);
    }, this.debounceTime);
  }

  /**
   * CLEAR SEARCH
   * ────────────
   * Resets search term and notifies parent
   */
  clear(): void {
    this.searchTerm = '';
    this.resultCount.set(null);
    
    // Clear debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.search.emit('');
    this.clear$.emit();
    this.loading.set(false);
  }

  /**
   * PUBLIC API: Update result count
   * Parent component calls this after search completes
   */
  setResultCount(count: number): void {
    this.resultCount.set(count);
  }

  /**
   * PUBLIC API: Set loading state externally
   */
  setLoading(isLoading: boolean): void {
    this.loading.set(isLoading);
  }
}
