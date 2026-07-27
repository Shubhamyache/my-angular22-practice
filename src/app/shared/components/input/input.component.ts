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
 * 2. @Input() for configuration (type, placeholder, label, etc.)
 * 3. @Output() for events (value changes)
 * 4. Content Projection: <ng-content> for icons/addons
 * 5. Accessibility: ARIA labels, role attributes
 *
 * WHY REUSABLE INPUTS?
 * ────────────────────
 * - Consistent styling across application
 * - Centralized validation display logic
 * - Easier to maintain (change once, update everywhere)
 * - Built-in accessibility features
 * - Reduces code duplication
 * - Type-safe with generics
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

import { Component, Input, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="form-group" [class.mb-3]="!noMargin">
      @if (label) {
        <label class="form-label fw-semibold small">
          {{ label }}
          @if (required) {
            <span class="text-danger ms-1">*</span>
          }
        </label>
      }

      <div class="input-group" [class.is-invalid]="showError()">
        <!-- PREFIX: Content projection for icons/text before input -->
        <ng-content select="[prefix]" />

        <input
          [type]="type"
          class="form-control"
          [class.is-invalid]="showError()"
          [placeholder]="placeholder"
          [disabled]="disabled()"
          [readonly]="readonly"
          [attr.min]="min ?? null"
          [attr.max]="max ?? null"
          [attr.maxlength]="maxlength ?? null"
          [attr.aria-label]="ariaLabel || label"
          [attr.aria-describedby]="errorId"
          [(ngModel)]="value"
          (ngModelChange)="onValueChange($event)"
          (blur)="onTouched()" />

        <!-- SUFFIX: Content projection for icons/buttons after input -->
        <ng-content select="[suffix]" />

        @if (clearable && value) {
          <button
            type="button"
            class="btn btn-outline-secondary"
            (click)="clear()"
            [attr.aria-label]="'Clear ' + (label || 'input')">
            <i class="bi bi-x-lg"></i>
          </button>
        }
      </div>

      <!-- ERROR MESSAGE -->
      @if (showError() && errorMessage) {
        <div [id]="errorId" class="invalid-feedback d-block">
          <i class="bi bi-exclamation-circle me-1"></i>
          {{ errorMessage }}
        </div>
      }

      <!-- HINT TEXT -->
      @if (hint && !showError()) {
        <small class="form-text text-muted">{{ hint }}</small>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    .input-group:focus-within {
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
      border-radius: 0.375rem;
    }
  `]
})
export class InputComponent implements ControlValueAccessor {
  // ════════════════════════════════════════════════════════════════
  // CONFIGURATION INPUTS
  // ════════════════════════════════════════════════════════════════
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' = 'text';
  @Input() errorMessage = '';
  @Input() hint = '';
  @Input() required = false;
  @Input() readonly = false;
  @Input() clearable = false;
  @Input() noMargin = false;
  
  // HTML5 validation attributes
  @Input() min?: number | null = null;
  @Input() max?: number | null = null;
  @Input() maxlength?: number | null = null;
  
  // Accessibility
  @Input() ariaLabel = '';

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
