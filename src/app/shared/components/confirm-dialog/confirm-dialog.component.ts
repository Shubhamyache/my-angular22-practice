/**
 * ═══════════════════════════════════════════════════════════════════
 * REUSABLE CONFIRM DIALOG COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 * ENTERPRISE PATTERN: Programmatic Dialog Service
 * ────────────────────────────────────────────────
 * Instead of using browser's confirm(), this provides a branded,
 * accessible, customizable confirmation dialog.
 *
 * WHY CUSTOM DIALOGS?
 * ───────────────────
 * - Browser confirm() blocks JavaScript execution
 * - Cannot style native dialogs
 * - Better UX with animations, icons, colors
 * - Accessibility features (ARIA, focus management)
 * - Consistent branding across application
 * - Support for async operations (Promise-based API)
 *
 * USAGE WITH SERVICE:
 * ───────────────────
 * // Inject service
 * private confirmDialog = inject(ConfirmDialogService);
 *
 * // Show dialog
 * const confirmed = await this.confirmDialog.confirm({
 *   title: 'Delete Task',
 *   message: 'Are you sure you want to delete this task?',
 *   confirmText: 'Delete',
 *   confirmClass: 'btn-danger'
 * });
 *
 * if (confirmed) {
 *   // User clicked confirm
 *   this.deleteTask();
 * }
 */

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ConfirmDialogConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmClass?: string; // btn-danger, btn-warning, btn-success
  icon?: string; // bi-trash, bi-exclamation-triangle, etc.
  iconColor?: string; // text-danger, text-warning, etc.
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible()) {
      <!-- Backdrop -->
      <div class="modal-backdrop fade show" (click)="onCancel()"></div>

      <!-- Dialog -->
      <div
        class="modal fade show d-block"
        tabindex="-1"
        role="dialog"
        [attr.aria-labelledby]="dialogId + '-title'"
        [attr.aria-describedby]="dialogId + '-message'">
        
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content border-0 shadow-lg">
            
            <!-- Header -->
            <div class="modal-header border-0 pb-0">
              @if (config().icon) {
                <div class="me-3">
                  <i
                    [class]="'bi ' + config().icon + ' fs-2 ' + (config().iconColor || 'text-warning')"
                    aria-hidden="true"></i>
                </div>
              }
              <h5 class="modal-title fw-bold flex-grow-1" [id]="dialogId + '-title'">
                {{ config().title }}
              </h5>
              <button
                type="button"
                class="btn-close"
                (click)="onCancel()"
                [attr.aria-label]="'Close'"></button>
            </div>

            <!-- Body -->
            <div class="modal-body">
              <p [id]="dialogId + '-message'" class="mb-0">
                {{ config().message }}
              </p>
            </div>

            <!-- Footer -->
            <div class="modal-footer border-0 pt-0">
              <button
                type="button"
                class="btn btn-outline-secondary"
                (click)="onCancel()"
                [disabled]="processing()">
                {{ config().cancelText || 'Cancel' }}
              </button>
              <button
                type="button"
                [class]="'btn ' + (config().confirmClass || 'btn-primary')"
                (click)="onConfirm()"
                [disabled]="processing()"
                autofocus>
                @if (processing()) {
                  <span class="spinner-border spinner-border-sm me-2"></span>
                  Processing...
                } @else {
                  {{ config().confirmText || 'Confirm' }}
                }
              </button>
            </div>

          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal {
      background-color: rgba(0, 0, 0, 0.5);
    }

    .modal-backdrop {
      opacity: 0.5;
    }

    .modal-dialog {
      animation: slideDown 0.3s ease-out;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-50px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .btn-close:focus {
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }
  `]
})
export class ConfirmDialogComponent {
  // ════════════════════════════════════════════════════════════════
  // SIGNALS: Reactive state management
  // ════════════════════════════════════════════════════════════════
  protected readonly visible = signal(false);
  protected readonly processing = signal(false);
  protected readonly config = signal<ConfirmDialogConfig>({
    title: 'Confirm',
    message: 'Are you sure?'
  });

  protected readonly dialogId = `confirm-dialog-${Math.random().toString(36).substr(2, 9)}`;

  // ════════════════════════════════════════════════════════════════
  // PROMISE RESOLVER: Makes API async/await compatible
  // ════════════════════════════════════════════════════════════════
  private resolver?: (value: boolean) => void;

  /**
   * PUBLIC API: Show dialog
   * Returns Promise<boolean> for async/await usage
   */
  show(config: ConfirmDialogConfig): Promise<boolean> {
    this.config.set({
      ...config,
      confirmText: config.confirmText || 'Confirm',
      cancelText: config.cancelText || 'Cancel'
    });
    this.visible.set(true);
    this.processing.set(false);

    // Focus management: trap focus in dialog
    setTimeout(() => this.trapFocus(), 0);

    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }

  /**
   * USER ACTIONS
   */
  onConfirm(): void {
    this.processing.set(true);
    // Small delay for UX (show processing state)
    setTimeout(() => {
      this.close(true);
    }, 200);
  }

  onCancel(): void {
    this.close(false);
  }

  private close(result: boolean): void {
    this.visible.set(false);
    this.processing.set(false);
    if (this.resolver) {
      this.resolver(result);
      this.resolver = undefined;
    }
  }

  /**
   * ACCESSIBILITY: Focus trap
   * Keeps focus within dialog for keyboard navigation
   */
  private trapFocus(): void {
    // Implementation would add event listeners for Tab key
    // to cycle focus within dialog elements only
    // Simplified for this example
  }
}
