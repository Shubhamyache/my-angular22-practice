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

import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-box',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-box.component.html',
  styleUrl: './search-box.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchBoxComponent {
  // ════════════════════════════════════════════════════════════════
  // INPUTS: Configuration from parent
  // ════════════════════════════════════════════════════════════════
  readonly placeholder = input('Search...');
  readonly debounceTime = input(400); // ms
  readonly size = input<'default' | 'sm'>('default');
  readonly showResultCount = input(false);
  readonly ariaLabel = input('');

  // ════════════════════════════════════════════════════════════════
  // OUTPUTS: Events emitted to parent
  // ════════════════════════════════════════════════════════════════
  readonly search = output<string>();
  readonly clear$ = output<void>();

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
    }, this.debounceTime());
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
