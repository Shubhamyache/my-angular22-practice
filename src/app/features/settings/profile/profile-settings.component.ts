import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserProfileService } from '../services/user-profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { ApiError, getFieldError } from '../../../core/utils/api-error.util';

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB — PartTwoUIIntegration.md §2
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png'];

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

  protected readonly avatarUrl     = signal<string | null>(null);
  protected readonly avatarLoading = signal(false);
  protected readonly avatarError   = signal<string | null>(null);

  protected readonly form = this.fb.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
    email:     [{ value: '', disabled: true }, [Validators.required, Validators.email]],
    phone:     [''],
    jobTitle:  ['']
  });

  ngOnInit(): void {
    // Best-effort prefill from the JWT-derived CurrentUserDto so the form isn't empty for the
    // brief moment before GET /users/me/profile resolves.
    const user = this.authService.currentUser();
    if (user) {
      const [firstName, ...rest] = user.fullName.split(' ');
      this.form.patchValue({ firstName, lastName: rest.join(' '), email: user.email });
    }

    this.userProfileService.getProfile().subscribe({
      next: profile => {
        this.form.patchValue(profile);
        this.avatarUrl.set(profile.avatarUrl);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  /** Resolves the (relative) avatarUrl against the backend origin for use in <img [src]>. In
   *  dev this is '' (proxy.conf.json now also covers /uploads, see environment.ts), so the
   *  value is used as-is; in prod it's the real backend origin. */
  protected resolvedAvatarSrc(url: string): string {
    return `${environment.backendOrigin}${url}`;
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // allow re-selecting the same file later
    if (!file) return;

    this.avatarError.set(null);

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      this.avatarError.set('Only JPG or PNG images are allowed.');
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      this.avatarError.set('Image must be 2MB or smaller.');
      return;
    }

    this.avatarLoading.set(true);
    this.userProfileService.uploadAvatar(file).subscribe({
      next: result => {
        this.avatarUrl.set(result.avatarUrl);
        this.avatarLoading.set(false);
      },
      error: (err: ApiError) => {
        this.avatarError.set(getFieldError(err.fieldErrors, 'file') ?? err.message);
        this.avatarLoading.set(false);
      }
    });
  }

  removeAvatar(): void {
    if (!this.avatarUrl() || this.avatarLoading()) return;
    if (!confirm('Remove your profile photo?')) return;

    this.avatarLoading.set(true);
    this.userProfileService.removeAvatar().subscribe({
      next: () => {
        this.avatarUrl.set(null);
        this.avatarLoading.set(false);
      },
      error: (err: ApiError) => {
        this.avatarError.set(err.message);
        this.avatarLoading.set(false);
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
      error: () => this.saving.set(false)
    });
  }
}
