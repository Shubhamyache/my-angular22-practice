import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <h5 class="fw-bold mb-1">Profile Settings</h5>
    <p class="text-muted small mb-4">Update your personal information</p>

    <div class="d-flex align-items-center gap-4 mb-4">
      <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-3"
        style="width:80px;height:80px;flex-shrink:0;">A</div>
      <div>
        <button class="btn btn-outline-primary btn-sm me-2">Upload Photo</button>
        <button class="btn btn-outline-danger btn-sm">Remove</button>
        <p class="text-muted small mt-1 mb-0">JPG or PNG, max 2MB</p>
      </div>
    </div>

    <form [formGroup]="form">
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label fw-semibold small">First Name</label>
          <input formControlName="firstName" type="text" class="form-control" />
        </div>
        <div class="col-md-6">
          <label class="form-label fw-semibold small">Last Name</label>
          <input formControlName="lastName" type="text" class="form-control" />
        </div>
        <div class="col-md-6">
          <label class="form-label fw-semibold small">Email</label>
          <input formControlName="email" type="email" class="form-control"
            [class.is-invalid]="form.get('email')?.invalid && form.get('email')?.touched" />
          <div class="invalid-feedback">Valid email is required.</div>
        </div>
        <div class="col-md-6">
          <label class="form-label fw-semibold small">Phone</label>
          <input formControlName="phone" type="tel" class="form-control" />
        </div>
        <div class="col-12">
          <label class="form-label fw-semibold small">Job Title</label>
          <input formControlName="jobTitle" type="text" class="form-control" />
        </div>
      </div>
      <div class="mt-4">
        <button type="submit" class="btn btn-primary">Save Profile</button>
      </div>
    </form>
  `
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
