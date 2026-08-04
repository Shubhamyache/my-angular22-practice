import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

export type ToastType = 'success' | 'danger' | 'warning' | 'info';

@Component({
  selector: 'app-toast',
  standalone: true,
  templateUrl: './toast.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
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
