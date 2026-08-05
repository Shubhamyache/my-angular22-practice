import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserProfileService } from '../services/user-profile.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './profile-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileSettingsComponent implements OnInit {
  private readonly fb                 = inject(FormBuilder);
  private readonly userProfileService = inject(UserProfileService);
  private readonly authService        = inject(AuthService);

  protected readonly loading     = signal(true);
  protected readonly saving      = signal(false);
  protected readonly saveSuccess = signal(false);
  /** True once we know GET /users/me/profile 404'd — lets the template show the "not deployed
   *  yet" banner only when it's actually confirmed missing, not just by default. */
  protected readonly backendMissing = signal(false);

  protected readonly form = this.fb.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
    email:     [{ value: '', disabled: true }, [Validators.required, Validators.email]],
    phone:     [''],
    jobTitle:  ['']
  });

  ngOnInit(): void {
    // Best-effort prefill from the JWT-derived CurrentUserDto so the form isn't empty while
    // GET /users/me/profile (§1 of FeaturesToImplement.md — doesn't exist yet) 404s.
    const user = this.authService.currentUser();
    if (user) {
      const [firstName, ...rest] = user.fullName.split(' ');
      this.form.patchValue({ firstName, lastName: rest.join(' '), email: user.email });
    }

    this.userProfileService.getProfile().subscribe({
      next: profile => {
        this.form.patchValue(profile);
        this.loading.set(false);
      },
      error: () => {
        this.backendMissing.set(true);
        this.loading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.saveSuccess.set(false);

    const raw = this.form.getRawValue();
    this.userProfileService.updateProfile({
      firstName: raw.firstName ?? '',
      lastName:  raw.lastName  ?? '',
      phone:     raw.phone     || null,
      jobTitle:  raw.jobTitle  || null
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.saveSuccess.set(true);
        setTimeout(() => this.saveSuccess.set(false), 3000);
      },
      error: () => {
        this.backendMissing.set(true);
        this.saving.set(false);
      }
    });
  }
}
