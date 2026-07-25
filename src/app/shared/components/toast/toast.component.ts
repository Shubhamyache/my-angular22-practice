import { Component, input, signal } from '@angular/core';

export type ToastType = 'success' | 'danger' | 'warning' | 'info';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    @if (visible()) {
      <div
        class="toast show position-fixed bottom-0 end-0 m-3"
        style="z-index:1100; min-width:280px;"
        role="alert">
        <div class="toast-header">
          <i [class]="'bi bi-' + iconMap[type()] + ' me-2 text-' + type()"></i>
          <strong class="me-auto text-capitalize">{{ type() }}</strong>
          <button type="button" class="btn-close" (click)="hide()"></button>
        </div>
        <div class="toast-body">{{ message() }}</div>
      </div>
    }
  `
})
export class ToastComponent {
  readonly message = input<string>('');
  readonly type = input<ToastType>('info');

  protected readonly visible = signal(true);

  protected readonly iconMap: Record<ToastType, string> = {
    success: 'check-circle-fill',
    danger:  'exclamation-triangle-fill',
    warning: 'exclamation-circle-fill',
    info:    'info-circle-fill'
  };

  hide(): void {
    this.visible.set(false);
  }
}
