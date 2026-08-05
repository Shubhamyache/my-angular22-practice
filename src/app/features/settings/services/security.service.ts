/**
 * §3, §4, §5 of PartTwoUIIntegration.md — change password, two-factor auth, and active
 * sessions. All live on the backend now.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { ChangePasswordDto, SessionDto, TwoFactorSetupDto } from '../models/settings.model';

@Injectable({ providedIn: 'root' })
export class SecurityService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users/me`;

  changePassword(dto: ChangePasswordDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/password`, dto);
  }

  getSessions(): Observable<SessionDto[]> {
    return this.http
      .get<ApiResponse<SessionDto[]>>(`${this.baseUrl}/sessions`)
      .pipe(map(res => res.data));
  }

  revokeSession(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/sessions/${id}`);
  }

  /** Starts (or restarts — a repeat call silently discards any prior pending secret,
   *  PartTwoUIIntegration.md §4) a 2FA enrollment. Nothing is committed until verifyTwoFactor(). */
  setupTwoFactor(): Observable<TwoFactorSetupDto> {
    return this.http
      .post<ApiResponse<TwoFactorSetupDto>>(`${this.baseUrl}/2fa/setup`, {})
      .pipe(map(res => res.data));
  }

  verifyTwoFactor(code: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/2fa/verify`, { code });
  }

  disableTwoFactor(code: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/2fa/disable`, { code });
  }
}
