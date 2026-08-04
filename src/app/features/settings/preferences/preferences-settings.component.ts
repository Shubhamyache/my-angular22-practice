/**
 * ═══════════════════════════════════════════════════════════════════
 * PREFERENCES SETTINGS COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 * FORM USE CASE:
 * ───────────────
 * Settings forms are typically "save on submit" not "auto-save".
 * User makes multiple changes, then clicks Save.
 *
 * FORM VALIDATION:
 * ─────────────────
 * Even preferences need validation:
 * - Language: required selection
 * - Items per page: min/max range
 * - Email: valid format if provided
 *
 * LOCAL STORAGE:
 * ───────────────
 * Preferences are often stored in localStorage for persistence.
 * In real app, would also sync to backend.
 */

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

interface PreferencesForm {
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  theme: 'light' | 'dark' | 'auto';
  itemsPerPage: number;
  enableNotifications: boolean;
  emailDigest: 'daily' | 'weekly' | 'never';
  compactView: boolean;
  showAvatars: boolean;
}

@Component({
  selector: 'app-preferences-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './preferences-settings.component.html'
})
export class PreferencesSettingsComponent {
  private readonly fb = inject(FormBuilder);

  protected readonly saving = signal(false);
  protected readonly saveSuccess = signal(false);

  /**
   * REACTIVE FORM WITH TYPED CONTROLS
   * ───────────────────────────────────
   * Each control has initial value and validators.
   */
  protected readonly form = this.fb.group<any>({
    language:            ['en-US', Validators.required],
    timezone:            ['America/New_York', Validators.required],
    dateFormat:          ['MM/DD/YYYY', Validators.required],
    timeFormat:          ['12h', Validators.required],
    theme:               ['light', Validators.required],
    itemsPerPage:        [20, [Validators.required, Validators.min(10), Validators.max(100)]],
    enableNotifications: [true],
    emailDigest:         ['daily', Validators.required],
    compactView:         [false],
    showAvatars:         [true]
  });

  /**
   * DROPDOWN OPTIONS
   * ─────────────────
   * In real app, might come from API or i18n service
   */
  protected readonly languages = [
    { value: 'en-US', label: 'English (US)' },
    { value: 'en-GB', label: 'English (UK)' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'zh', label: 'Chinese' }
  ];

  protected readonly timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' }
  ];

  protected readonly dateFormats = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2026)' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2026)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2026-12-31)' },
    { value: 'MMM DD, YYYY', label: 'MMM DD, YYYY (Dec 31, 2026)' }
  ];

  /**
   * FORM SUBMISSION
   * ────────────────
   * Validate, show loading spinner, simulate save, show success message
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.saveSuccess.set(false);

    // Simulate API call
    setTimeout(() => {
      const values = this.form.getRawValue();
      console.log('Saving preferences:', values);

      // In real app: save to backend and localStorage
      localStorage.setItem('userPreferences', JSON.stringify(values));

      this.saving.set(false);
      this.saveSuccess.set(true);

      // Hide success message after 3 seconds
      setTimeout(() => this.saveSuccess.set(false), 3000);
    }, 800);
  }

  /**
   * RESET TO DEFAULTS
   * ──────────────────
   * Reset form to default values
   */
  onResetDefaults(): void {
    if (confirm('Reset all preferences to default values?')) {
      this.form.reset({
        language:            'en-US',
        timezone:            'America/New_York',
        dateFormat:          'MM/DD/YYYY',
        timeFormat:          '12h',
        theme:               'light',
        itemsPerPage:        20,
        enableNotifications: true,
        emailDigest:         'daily',
        compactView:         false,
        showAvatars:         true
      });
    }
  }

  /**
   * Helper: Check if field is invalid
   */
  isInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }
}
