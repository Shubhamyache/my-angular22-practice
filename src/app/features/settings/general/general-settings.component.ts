import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { GeneralSettingsService } from '../services/general-settings.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';

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
  private readonly authService = inject(AuthService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  /** View is any authenticated user, edit is Admin-only (PartTwoUIIntegration.md §8) — the
   *  route itself is open to everyone now, this component enforces the write boundary. */
  protected readonly canEdit = this.authService.getUserRole() === 'Admin';

  protected readonly form = this.fb.group({
    appName:    [{ value: 'Employee Management System', disabled: !this.canEdit }, Validators.required],
    timezone:   [{ value: 'UTC', disabled: !this.canEdit }],
    dateFormat: [{ value: 'MM/DD/YYYY', disabled: !this.canEdit }],
    pageSize:   [{ value: 20, disabled: !this.canEdit }]
  });

  private readonly defaults = this.form.getRawValue();

  protected readonly loading = signal(true);
  protected readonly saving  = signal(false);
  protected readonly saved   = signal(false);
  protected readonly error   = signal<string | null>(null);

  ngOnInit(): void {
    this.generalSettingsService.getSettings().subscribe({
      next: settings => {
        this.form.patchValue(settings);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSubmit(): void {
    if (!this.canEdit || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.saved.set(false);
    this.error.set(null);

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
      error: (err: Error) => {
        this.error.set(err.message);
        this.saving.set(false);
      }
    });
  }

  async onResetDefaults(): Promise<void> {
    if (!this.canEdit) return;

    const confirmed = await this.confirmDialog.confirm({
      title: 'Reset Settings',
      message: 'Reset all settings to default values?',
      confirmText: 'Reset',
      cancelText: 'Cancel',
      confirmClass: 'btn-warning',
      icon: 'bi-arrow-counterclockwise',
      iconColor: 'text-warning'
    });
    if (!confirmed) return;

    this.form.reset(this.defaults);
  }
}
