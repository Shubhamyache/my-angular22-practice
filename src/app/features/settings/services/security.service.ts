/**
 * §3 and §5 of FeaturesToImplement.md — change password + active sessions. None of these
 * endpoints exist yet; SecuritySettingsComponent calls these and handles the resulting 404
 * inline (UIIntegrationInfo.md §11). Two-factor auth (§4) is deliberately not wired here — the
 * UI needs a verify-code modal once `/2fa/setup` exists, which doesn't exist as a screen today,
 * see FeaturesToImplement.md §4's "Angular readiness" note.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { ChangePasswordDto, SessionDto } from '../models/settings.model';

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
}
