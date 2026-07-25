import { Component, input, output } from '@angular/core';

export type ButtonVariant =
  | 'primary' | 'secondary' | 'success' | 'danger'
  | 'warning' | 'info' | 'outline-primary' | 'outline-secondary'
  | 'outline-danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  templateUrl: './button.component.html'
})
export class ButtonComponent {
  readonly label    = input<string>('');
  readonly variant  = input<ButtonVariant>('primary');
  readonly size     = input<ButtonSize>('md');
  readonly disabled = input<boolean>(false);
  readonly loading  = input<boolean>(false);
  readonly icon     = input<string>('');
  readonly type     = input<'button' | 'submit'>('button');
  readonly clicked  = output<void>();

  get sizeClass(): string {
    return this.size() === 'md' ? '' : `btn-${this.size()}`;
  }

  onClick(): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit();
    }
  }
}
