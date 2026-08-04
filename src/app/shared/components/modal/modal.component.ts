import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './modal.component.html'
})
export class ModalComponent {
  readonly title = input<string>('');
  readonly size  = input<'sm' | 'lg' | 'xl'>('lg');
  readonly closed = output<void>();

  close(): void {
    this.closed.emit();
  }
}
