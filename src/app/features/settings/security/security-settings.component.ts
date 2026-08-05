import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SecurityService } from '../services/security.service';
import { SessionDto } from '../models/settings.model';

@Component({
  selector: 'app-security-settings',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './security-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SecuritySettingsComponent implements OnInit {
  private readonly fb              = inject(FormBuilder);
  private readonly securityService = inject(SecurityService);

  protected readonly twoFAEnabled = signal(false);
  protected readonly passwordForm = this.fb.group({
    current: ['', Validators.required],
    newPass: ['', [Validators.required, Validators.minLength(8)]],
    confirm: ['', Validators.required]
  });

  protected readonly changingPassword = signal(false);
  protected readonly passwordSaved    = signal(false);
  protected readonly passwordError    = signal<string | null>(null);

  protected readonly sessions        = signal<SessionDto[]>([]);
  protected readonly sessionsLoading = signal(true);
  protected readonly revokingId      = signal<number | null>(null);
  /** True once GET /users/me/sessions is confirmed missing — see FeaturesToImplement.md §5. */
  protected readonly backendMissing  = signal(false);

  ngOnInit(): void {
    this.securityService.getSessions().subscribe({
      next: sessions => {
        this.sessions.set(sessions);
        this.sessionsLoading.set(false);
      },
      error: () => {
        this.backendMissing.set(true);
        this.sessionsLoading.set(false);
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { current, newPass, confirm } = this.passwordForm.getRawValue();
    if (newPass !== confirm) {
      this.passwordError.set("New password and confirmation don't match.");
      return;
    }

    this.changingPassword.set(true);
    this.passwordError.set(null);
    this.passwordSaved.set(false);

    this.securityService.changePassword({ currentPassword: current!, newPassword: newPass! }).subscribe({
      next: () => {
        this.changingPassword.set(false);
        this.passwordSaved.set(true);
        this.passwordForm.reset();
        setTimeout(() => this.passwordSaved.set(false), 3000);
      },
      error: (err: Error) => {
        this.changingPassword.set(false);
        this.passwordError.set(err.message);
      }
    });
  }

  revokeSession(session: SessionDto): void {
    if (session.isCurrent) return;
    if (!confirm('Revoke this session? That device will be signed out.')) return;

    this.revokingId.set(session.id);
    this.securityService.revokeSession(session.id).subscribe({
      next: () => {
        this.sessions.update(list => list.filter(s => s.id !== session.id));
        this.revokingId.set(null);
      },
      error: () => this.revokingId.set(null)
    });
  }
}
