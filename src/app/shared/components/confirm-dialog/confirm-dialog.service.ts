/**
 * ═══════════════════════════════════════════════════════════════════
 * CONFIRM DIALOG SERVICE
 * ═══════════════════════════════════════════════════════════════════
 *
 * ENTERPRISE PATTERN: Singleton Service with Component Registry
 * ──────────────────────────────────────────────────────────────────
 * This service provides a global API to show confirmation dialogs
 * from anywhere in the application without importing components.
 *
 * DEPENDENCY INJECTION:
 * ─────────────────────
 * providedIn: 'root' creates a singleton instance
 * - Single instance shared across entire application
 * - Lazy-loaded (created only when first injected)
 * - Automatically cleaned up when app destroys
 *
 * WHY SERVICE PATTERN?
 * ────────────────────
 * - Decouples component from usage locations
 * - Type-safe API with TypeScript
 * - Promise-based for async/await
 * - Testable (can mock the service)
 * - Centralized dialog management
 */

import { Injectable, ApplicationRef, createComponent, EnvironmentInjector } from '@angular/core';
import { ConfirmDialogComponent, ConfirmDialogConfig } from './confirm-dialog.component';

@Injectable({
  providedIn: 'root' // Singleton across entire app
})
export class ConfirmDialogService {
  private componentRef?: any;

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) {}

  /**
   * SHOW CONFIRMATION DIALOG
   * ────────────────────────
   * Usage:
   * const confirmed = await this.confirmDialog.confirm({
   *   title: 'Delete Item',
   *   message: 'This action cannot be undone.',
   *   confirmText: 'Delete',
   *   confirmClass: 'btn-danger',
   *   icon: 'bi-trash',
   *   iconColor: 'text-danger'
   * });
   */
  async confirm(config: ConfirmDialogConfig): Promise<boolean> {
    // Create component if not exists
    if (!this.componentRef) {
      this.createComponent();
    }

    // Show dialog and wait for user response
    return this.componentRef.instance.show(config);
  }

  /**
   * QUICK METHODS: Pre-configured dialogs
   */
  async confirmDelete(itemName: string): Promise<boolean> {
    return this.confirm({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmClass: 'btn-danger',
      icon: 'bi-trash3',
      iconColor: 'text-danger'
    });
  }

  async confirmLeave(): Promise<boolean> {
    return this.confirm({
      title: 'Unsaved Changes',
      message: 'You have unsaved changes. Do you want to leave without saving?',
      confirmText: 'Leave',
      cancelText: 'Stay',
      confirmClass: 'btn-warning',
      icon: 'bi-exclamation-triangle',
      iconColor: 'text-warning'
    });
  }

  /**
   * DYNAMIC COMPONENT CREATION
   * ───────────────────────────
   * Creates component programmatically and attaches to DOM
   */
  private createComponent(): void {
    // Create component dynamically
    this.componentRef = createComponent(ConfirmDialogComponent, {
      environmentInjector: this.injector
    });

    // Attach to Angular's change detection
    this.appRef.attachView(this.componentRef.hostView);

    // Append to DOM
    const domElem = (this.componentRef.hostView as any).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);
  }

  /**
   * CLEANUP
   * ───────
   * Called automatically when service is destroyed
   */
  ngOnDestroy(): void {
    if (this.componentRef) {
      this.appRef.detachView(this.componentRef.hostView);
      this.componentRef.destroy();
    }
  }
}
