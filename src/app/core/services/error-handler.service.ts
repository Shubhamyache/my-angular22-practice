import { Injectable, signal } from '@angular/core';
import { ToastType } from '../../shared/components/toast/toast.component';

export interface ErrorNotice {
  id: number;
  type: ToastType;
  message: string;
}

const AUTO_DISMISS_MS = 6000;

/**
 * Backs the global toast host (mounted once in ShellComponent) that errorInterceptor uses for
 * errors needing an app-wide notice (403 permission-denied, 409 conflict, 500 generic failure —
 * UIIntegrationInfo.md §11). Errors that belong inline on a specific screen (400 field errors,
 * 404 not-found states, 423 login-form lockout) are NOT routed through here — those already
 * flow through the normal `error: (err: Error) => this.error.set(err.message)` pattern used
 * throughout the app's existing components, unchanged.
 */
@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  private readonly _notice = signal<ErrorNotice | null>(null);
  readonly notice = this._notice.asReadonly();

  private counter = 0;
  private dismissTimer?: ReturnType<typeof setTimeout>;

  notify(type: ToastType, message: string): void {
    clearTimeout(this.dismissTimer);
    // Force null -> value on every call (even back-to-back identical-looking errors) so the
    // @if in shell.component.html always sees a false -> true transition and mounts a FRESH
    // <app-toast>, whose own `visible` signal starts true exactly once per instance.
    this._notice.set(null);
    queueMicrotask(() => {
      this._notice.set({ id: ++this.counter, type, message });
      this.dismissTimer = setTimeout(() => this.clear(), AUTO_DISMISS_MS);
    });
  }

  clear(): void {
    this._notice.set(null);
  }
}
