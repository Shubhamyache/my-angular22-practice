/**
 * ═══════════════════════════════════════════════════════════════════
 * REUSABLE INPUT COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 * ENTERPRISE PATTERN: Controlled Component
 * ──────────────────────────────────────────
 * This component demonstrates Angular's ControlValueAccessor pattern
 * for creating custom form controls that integrate with Reactive Forms.
 *
 * KEY CONCEPTS:
 * ─────────────
 * 1. ControlValueAccessor: Makes component work with Angular Forms
 * 2. Signal input() for configuration (type, placeholder, label, etc.)
 * 3. Content Projection: <ng-content> for icons/addons
 * 4. Accessibility: ARIA labels, role attributes
 *
 * USAGE EXAMPLES:
 * ───────────────
 * // Basic
 * <app-input
 *   [formControl]="nameControl"
 *   label="Full Name"
 *   placeholder="Enter your name" />
 *
 * // With icon (Content Projection)
 * <app-input [formControl]="emailControl" label="Email">
 *   <i class="bi bi-envelope" prefix></i>
 * </app-input>
 *
 * // Number input with validation
 * <app-input
 *   type="number"
 *   [formControl]="ageControl"
 *   label="Age"
 *   [min]="18"
 *   [max]="100"
 *   errorMessage="Age must be between 18 and 100" />
 */

import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputComponent implements ControlValueAccessor {
  // ════════════════════════════════════════════════════════════════
  // CONFIGURATION INPUTS
  // ════════════════════════════════════════════════════════════════
  readonly label = input('');
  readonly placeholder = input('');
  readonly type = input<'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'>('text');
  readonly errorMessage = input('');
  readonly hint = input('');
  readonly required = input(false);
  readonly readonlyInput = input(false, { alias: 'readonly' });
  readonly clearable = input(false);
  readonly noMargin = input(false);

  // HTML5 validation attributes
  readonly min = input<number | null>(null);
  readonly max = input<number | null>(null);
  readonly maxlength = input<number | null>(null);

  // Accessibility
  readonly ariaLabel = input('');

  // ════════════════════════════════════════════════════════════════
  // SIGNALS FOR REACTIVE STATE
  // ════════════════════════════════════════════════════════════════
  protected readonly disabled = signal(false);
  protected readonly showError = signal(false);

  protected readonly errorId = `input-error-${Math.random().toString(36).substr(2, 9)}`;

  // ════════════════════════════════════════════════════════════════
  // CONTROL VALUE ACCESSOR IMPLEMENTATION
  // ════════════════════════════════════════════════════════════════
  value = '';

  private onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  // ════════════════════════════════════════════════════════════════
  // USER INTERACTIONS
  // ════════════════════════════════════════════════════════════════
  onValueChange(value: string): void {
    this.value = value;
    this.onChange(value);
    this.showError.set(false);
  }

  clear(): void {
    this.value = '';
    this.onChange('');
  }

  /**
   * PUBLIC API: Show validation error
   * Called by parent component when form is submitted
   */
  markAsInvalid(): void {
    this.showError.set(true);
  }
}
