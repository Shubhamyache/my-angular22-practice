import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './profile-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileSettingsComponent {
  private readonly fb = inject(FormBuilder);
  protected readonly form = this.fb.group({
    firstName: ['Admin'],
    lastName:  ['User'],
    email:     ['admin@company.com', [Validators.required, Validators.email]],
    phone:     ['+1 555 000 0000'],
    jobTitle:  ['System Administrator']
  });
}
