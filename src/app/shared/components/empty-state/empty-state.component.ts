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
 * WHY EMPTY STATES MATTER:
 * ────────────────────────
 * - Reduces user confusion ("Is it broken?")
 * - Guides users to first action
 * - Improves onboarding experience
 * - Provides context for filtered/searched results
 * - Makes app feel polished and intentional
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

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state text-center" [class]="'py-' + padding">
      
      <!-- Icon/Illustration -->
      @if (icon) {
        <div class="empty-state-icon mb-3">
          <i [class]="'bi ' + icon + ' ' + iconColor" [class]="'display-' + iconSize"></i>
        </div>
      }

      @if (illustration) {
        <div class="empty-state-illustration mb-4">
          <img [src]="illustration" [alt]="title" class="img-fluid" style="max-width: 200px;" />
        </div>
      }

      <!-- Title -->
      <h4 class="fw-bold mb-2" [class]="titleColor">{{ title }}</h4>

      <!-- Message -->
      <p class="text-muted mb-4" [style.max-width.px]="maxMessageWidth">
        {{ message }}
      </p>

      <!-- Actions -->
      @if (actionText) {
        <button
          type="button"
          [class]="'btn btn-' + actionStyle"
          (click)="onAction()">
          @if (actionIcon) {
            <i [class]="'bi ' + actionIcon + ' me-2'"></i>
          }
          {{ actionText }}
        </button>
      }

      @if (secondaryActionText) {
        <button
          type="button"
          class="btn btn-outline-secondary ms-2"
          (click)="onSecondaryAction()">
          {{ secondaryActionText }}
        </button>
      }

      <!-- Help link -->
      @if (helpText && helpLink) {
        <div class="mt-4">
          <a [href]="helpLink" class="text-muted small text-decoration-none" target="_blank">
            <i class="bi bi-question-circle me-1"></i>
            {{ helpText }}
          </a>
        </div>
      }

      <!-- Content Projection: Custom content -->
      <div class="mt-4">
        <ng-content />
      </div>

    </div>
  `,
  styles: [`
    .empty-state {
      min-height: 300px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .empty-state-icon {
      opacity: 0.5;
    }

    .empty-state-illustration {
      opacity: 0.7;
    }

    p {
      margin: 0 auto;
    }
  `]
})
export class EmptyStateComponent {
  // ════════════════════════════════════════════════════════════════
  // CONFIGURATION INPUTS
  // ════════════════════════════════════════════════════════════════
  
  @Input() icon = 'bi-inbox'; // Bootstrap icon class
  @Input() iconSize: 1 | 2 | 3 | 4 = 1;
  @Input() iconColor = 'text-muted';
  @Input() illustration?: string; // Image URL
  
  @Input() title = 'No items found';
  @Input() titleColor = 'text-dark';
  @Input() message = 'Get started by creating a new item';
  @Input() maxMessageWidth = 500;
  
  @Input() actionText?: string;
  @Input() actionIcon?: string;
  @Input() actionStyle: 'primary' | 'success' | 'info' = 'primary';
  
  @Input() secondaryActionText?: string;
  
  @Input() helpText?: string;
  @Input() helpLink?: string;
  
  @Input() padding: 3 | 4 | 5 = 5;

  // ════════════════════════════════════════════════════════════════
  // OUTPUTS: Events
  // ════════════════════════════════════════════════════════════════
  
  @Output() action = new EventEmitter<void>();
  @Output() secondaryAction = new EventEmitter<void>();

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
