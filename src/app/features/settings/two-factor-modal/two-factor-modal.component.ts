/**
 * ═══════════════════════════════════════════════════════════════════
 * TWO-FACTOR MODAL — Enable / Disable 2FA
 * ═══════════════════════════════════════════════════════════════════
 * PartTwoUIIntegration.md §4. Two distinct flows share one modal:
 *
 *  - mode='enable':  POST /2fa/setup → render QR (client-side, see below) + secret fallback →
 *                     user enters the 6-digit code from their authenticator app →
 *                     POST /2fa/verify → emits changed(true) on success.
 *  - mode='disable':  no setup step — just ask for a current code → POST /2fa/disable →
 *                     emits changed(false) on success. Requires proving TOTP possession even to
 *                     turn it off, so a hijacked session can't be used to silently disable 2FA.
 *
 * The QR code is rendered ENTIRELY IN THE BROWSER via the `qrcode` npm package, from the
 * `qrCodeUri` (an `otpauth://...` string) the backend returns — never sent to a third-party
 * QR-image service, which would leak the TOTP secret off-device and defeat the point of 2FA.
 */
import { ChangeDetectionStrategy, Component, OnInit, inject, input, output, signal } from '@angular/core';
import * as QRCode from 'qrcode';
import { SecurityService } from '../services/security.service';
import { TwoFactorSetupDto } from '../models/settings.model';
import { ApiError, getFieldError } from '../../../core/utils/api-error.util';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-two-factor-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModalComponent],
  templateUrl: './two-factor-modal.component.html'
})
export class TwoFactorModalComponent implements OnInit {
  private readonly securityService = inject(SecurityService);

  readonly mode    = input.required<'enable' | 'disable'>();
  readonly changed = output<boolean>();
  readonly closed  = output<void>();

  protected readonly settingUp  = signal(true);
  protected readonly setupData  = signal<TwoFactorSetupDto | null>(null);
  protected readonly qrDataUrl  = signal<string | null>(null);
  protected readonly setupError = signal<string | null>(null);

  protected readonly code          = signal('');
  protected readonly submitting    = signal(false);
  protected readonly codeError     = signal<string | null>(null);

  ngOnInit(): void {
    if (this.mode() === 'disable') {
      this.settingUp.set(false);
      return;
    }

    this.securityService.setupTwoFactor().subscribe({
      next: async data => {
        this.setupData.set(data);
        try {
          this.qrDataUrl.set(await QRCode.toDataURL(data.qrCodeUri, { width: 220, margin: 1 }));
        } catch {
          // QR rendering failed client-side (shouldn't happen with a well-formed otpauth:// URI)
          // — the raw secret fallback below still lets the user complete setup manually.
        }
        this.settingUp.set(false);
      },
      error: (err: ApiError) => {
        this.setupError.set(err.message);
        this.settingUp.set(false);
      }
    });
  }

  onCodeInput(value: string): void {
    this.code.set(value.replace(/\D/g, '').slice(0, 6));
    this.codeError.set(null);
  }

  submit(): void {
    const code = this.code();
    if (code.length !== 6 || this.submitting()) return;

    this.submitting.set(true);
    this.codeError.set(null);

    const request$ = this.mode() === 'enable'
      ? this.securityService.verifyTwoFactor(code)
      : this.securityService.disableTwoFactor(code);

    request$.subscribe({
      next: () => {
        this.submitting.set(false);
        this.changed.emit(this.mode() === 'enable');
      },
      error: (err: ApiError) => {
        this.submitting.set(false);
        // 'code' (lowercase, wrong code) or 'Code' (PascalCase, not 6 digits) — case-insensitive
        // lookup handles both (PartTwoUIIntegration.md §4).
        this.codeError.set(getFieldError(err.fieldErrors, 'code') ?? err.message);
      }
    });
  }

  close(): void {
    this.closed.emit();
  }
}
