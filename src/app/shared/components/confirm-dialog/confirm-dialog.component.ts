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

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

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
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
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
