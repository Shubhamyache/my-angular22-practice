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

import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserPreferencesService } from '../services/user-preferences.service';
import { UserPreferencesDto } from '../models/settings.model';

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
export class PreferencesSettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userPreferencesService = inject(UserPreferencesService);

  protected readonly saving = signal(false);
  protected readonly saveSuccess = signal(false);
  /** True once GET /users/me/preferences is confirmed missing — see FeaturesToImplement.md §7. */
  protected readonly backendMissing = signal(false);

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
   * Loads previously-saved preferences. Reads localStorage first (fixes a pre-existing gap —
   * onSubmit wrote to localStorage but nothing ever read it back, so preferences never actually
   * survived a page reload), then tries GET /users/me/preferences (§7 of
   * FeaturesToImplement.md — doesn't exist yet) to override with the backend copy once it does.
   */
  ngOnInit(): void {
    const stored = localStorage.getItem('userPreferences');
    if (stored) {
      try {
        this.form.patchValue(JSON.parse(stored));
      } catch {
        // Corrupt/old-shape localStorage value — ignore and keep form defaults.
      }
    }

    // The form is typed fb.group<any> (see class docblock) since it predates this backend
    // integration pass, so patchValue()/getRawValue() below are cast at the boundary rather
    // than fighting FormGroup<any>'s inferred `{[x: string]: unknown}` shape.
    this.userPreferencesService.getPreferences().subscribe({
      next: prefs => this.form.patchValue(prefs as unknown as Record<string, unknown>),
      error: () => this.backendMissing.set(true)
    });
  }

  /**
   * FORM SUBMISSION
   * ────────────────
   * Validate, show loading spinner, save to localStorage (always) and the backend (once it
   * exists), show success message.
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.saveSuccess.set(false);

    const values = this.form.getRawValue();
    localStorage.setItem('userPreferences', JSON.stringify(values));

    this.userPreferencesService.updatePreferences(values as unknown as UserPreferencesDto).subscribe({
      next: () => this.finishSave(),
      error: () => {
        // No backend yet (§7) — localStorage write above already happened, so from the user's
        // perspective on this device the save still "worked"; just flag the gap for next load.
        this.backendMissing.set(true);
        this.finishSave();
      }
    });
  }

  private finishSave(): void {
    this.saving.set(false);
    this.saveSuccess.set(true);
    setTimeout(() => this.saveSuccess.set(false), 3000);
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
