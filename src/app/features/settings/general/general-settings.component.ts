import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-general-settings',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './general-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneralSettingsComponent {
  private readonly fb = inject(FormBuilder);
  protected readonly form = this.fb.group({
    appName:    ['Employee Management System', Validators.required],
    timezone:   ['UTC'],
    dateFormat: ['MM/DD/YYYY'],
    pageSize:   [20]
  });
}
