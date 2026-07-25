import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { inject } from '@angular/core';

@Component({
  selector: 'app-general-settings',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <h5 class="fw-bold mb-1">General Settings</h5>
    <p class="text-muted small mb-4">Configure application-wide preferences</p>

    <form [formGroup]="form">
      <div class="mb-3">
        <label class="form-label fw-semibold small">Application Name</label>
        <input formControlName="appName" type="text" class="form-control" />
      </div>
      <div class="mb-3">
        <label class="form-label fw-semibold small">Default Timezone</label>
        <select formControlName="timezone" class="form-select">
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Chicago">Central Time</option>
          <option value="America/Los_Angeles">Pacific Time</option>
          <option value="Europe/London">London</option>
          <option value="Europe/Paris">Paris</option>
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label fw-semibold small">Date Format</label>
        <select formControlName="dateFormat" class="form-select">
          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
          <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
        </select>
      </div>
      <div class="mb-4">
        <label class="form-label fw-semibold small">Items per Page</label>
        <select formControlName="pageSize" class="form-select">
          <option [value]="10">10</option>
          <option [value]="20">20</option>
          <option [value]="50">50</option>
          <option [value]="100">100</option>
        </select>
      </div>
      <div class="d-flex gap-2">
        <button type="submit" class="btn btn-primary">Save Changes</button>
        <button type="button" class="btn btn-outline-secondary">Reset Defaults</button>
      </div>
    </form>
  `
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
