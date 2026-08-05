import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { GeneralSettingsService } from '../services/general-settings.service';

@Component({
  selector: 'app-general-settings',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './general-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneralSettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly generalSettingsService = inject(GeneralSettingsService);

  protected readonly form = this.fb.group({
    appName:    ['Employee Management System', Validators.required],
    timezone:   ['UTC'],
    dateFormat: ['MM/DD/YYYY'],
    pageSize:   [20]
  });

  private readonly defaults = this.form.getRawValue();

  protected readonly saving  = signal(false);
  protected readonly saved   = signal(false);
  /** True once GET /settings/general is confirmed missing — see FeaturesToImplement.md §8. */
  protected readonly backendMissing = signal(false);

  ngOnInit(): void {
    this.generalSettingsService.getSettings().subscribe({
      next: settings => this.form.patchValue(settings),
      error: () => this.backendMissing.set(true)
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.saved.set(false);

    const raw = this.form.getRawValue();
    this.generalSettingsService.updateSettings({
      appName:    raw.appName ?? '',
      timezone:   raw.timezone ?? 'UTC',
      dateFormat: raw.dateFormat ?? 'MM/DD/YYYY',
      pageSize:   raw.pageSize ?? 20
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 3000);
      },
      error: () => {
        this.backendMissing.set(true);
        this.saving.set(false);
      }
    });
  }

  onResetDefaults(): void {
    if (confirm('Reset all settings to default values?')) {
      this.form.reset(this.defaults);
    }
  }
}
