import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-security-settings',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './security-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SecuritySettingsComponent {
  private readonly fb = inject(FormBuilder);
  protected readonly twoFAEnabled = signal(false);
  protected readonly passwordForm = this.fb.group({
    current: ['', Validators.required],
    newPass: ['', [Validators.required, Validators.minLength(8)]],
    confirm: ['', Validators.required]
  });
}
