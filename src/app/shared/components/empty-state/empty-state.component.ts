/**
 * ═══════════════════════════════════════════════════════════════════
 * REUSABLE EMPTY STATE COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 * ENTERPRISE PATTERN: Contextual Empty States
 * ────────────────────────────────────────────
 * Empty states are critical for UX. Instead of showing a blank screen,
 * guide users toward the next action.
 *
 * DESIGN PRINCIPLES:
 * ──────────────────
 * 1. Visual clarity (icon, illustration)
 * 2. Clear message (what's empty and why)
 * 3. Call-to-action (what to do next)
 * 4. Contextual help (link to docs, support)
 *
 * USAGE:
 * ──────
 * // No results
 * <app-empty-state
 *   icon="bi-inbox"
 *   title="No tasks found"
 *   message="Get started by creating your first task"
 *   [actionText]="'Create Task'"
 *   (action)="createTask()" />
 *
 * // Filtered results
 * <app-empty-state
 *   icon="bi-search"
 *   title="No results"
 *   message="Try adjusting your filters"
 *   [actionText]="'Clear Filters'"
 *   (action)="clearFilters()" />
 */

import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent {
  // ════════════════════════════════════════════════════════════════
  // CONFIGURATION INPUTS
  // ════════════════════════════════════════════════════════════════
  readonly icon = input('bi-inbox'); // Bootstrap icon class
  readonly iconSize = input<1 | 2 | 3 | 4>(1);
  readonly iconColor = input('text-muted');
  readonly illustration = input<string>(); // Image URL

  readonly title = input('No items found');
  readonly titleColor = input('text-dark');
  readonly message = input('Get started by creating a new item');
  readonly maxMessageWidth = input(500);

  readonly actionText = input<string>();
  readonly actionIcon = input<string>();
  readonly actionStyle = input<'primary' | 'success' | 'info'>('primary');

  readonly secondaryActionText = input<string>();

  readonly helpText = input<string>();
  readonly helpLink = input<string>();

  readonly padding = input<3 | 4 | 5>(5);

  // ════════════════════════════════════════════════════════════════
  // OUTPUTS: Events
  // ════════════════════════════════════════════════════════════════
  readonly action = output<void>();
  readonly secondaryAction = output<void>();

  // ════════════════════════════════════════════════════════════════
  // DERIVED STATE
  // ════════════════════════════════════════════════════════════════
  protected readonly iconClass = computed(() => `bi ${this.icon()} ${this.iconColor()} display-${this.iconSize()}`);

  // ════════════════════════════════════════════════════════════════
  // METHODS
  // ════════════════════════════════════════════════════════════════

  onAction(): void {
    this.action.emit();
  }

  onSecondaryAction(): void {
    this.secondaryAction.emit();
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * USAGE PATTERNS
 * ═══════════════════════════════════════════════════════════════════
 *
 * 1. NO DATA (First-time user):
 * ──────────────────────────────
 * <app-empty-state
 *   icon="bi-inbox"
 *   title="No tasks yet"
 *   message="Create your first task to get started"
 *   actionText="Create Task"
 *   actionIcon="bi-plus-lg"
 *   (action)="createFirstTask()" />
 *
 * 2. FILTERED RESULTS (No matches):
 * ──────────────────────────────────
 * <app-empty-state
 *   icon="bi-search"
 *   title="No results found"
 *   message="Try adjusting your search or filters"
 *   actionText="Clear Filters"
 *   (action)="clearAllFilters()" />
 *
 * 3. ERROR STATE:
 * ───────────────
 * <app-empty-state
 *   icon="bi-exclamation-triangle"
 *   iconColor="text-warning"
 *   title="Failed to load"
 *   message="We couldn't fetch your data. Please try again."
 *   actionText="Retry"
 *   actionIcon="bi-arrow-clockwise"
 *   (action)="retryLoad()" />
 *
 * 4. PERMISSION DENIED:
 * ─────────────────────
 * <app-empty-state
 *   icon="bi-shield-lock"
 *   iconColor="text-danger"
 *   title="Access Denied"
 *   message="You don't have permission to view this resource"
 *   helpText="Learn about permissions"
 *   helpLink="/docs/permissions" />
 */
