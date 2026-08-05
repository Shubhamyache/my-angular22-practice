import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, finalize, map, shareReplay, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { TokenResponseDto } from '../models/auth.model';
import { AuthService } from './auth.service';

/**
 * ═══════════════════════════════════════════════════════════════════
 * SINGLE-FLIGHT REFRESH TOKEN
 * ═══════════════════════════════════════════════════════════════════
 * The backend ROTATES refresh tokens: every successful /auth/refresh call revokes the token
 * that was just used and issues a new one. If the same already-used refresh token is ever
 * presented twice, the backend treats it as theft and revokes the entire session
 * (UIIntegrationInfo.md §3).
 *
 * If two requests both 401 at roughly the same time (e.g. two widgets loading in parallel
 * after the access token expires), a naive interceptor would fire two independent
 * POST /auth/refresh calls with the same (still-valid-at-that-instant) refresh token. The
 * first call rotates it; the second call — now presenting an already-used token — gets
 * rejected as reuse, and the user is force-logged-out even though nothing was actually wrong.
 *
 * This service fixes that by caching the in-flight refresh Observable (via shareReplay(1))
 * and handing the SAME Observable to every concurrent caller, so only one HTTP call to
 * /auth/refresh is ever made per "outage window" — every 401 that arrives while a refresh is
 * already in progress rides along on that one call instead of starting its own.
 */
@Injectable({ providedIn: 'root' })
export class TokenRefreshService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  private refreshInFlight$: Observable<TokenResponseDto> | null = null;

  refreshAccessToken(): Observable<TokenResponseDto> {
    if (this.refreshInFlight$) {
      return this.refreshInFlight$;
    }

    const refreshToken = this.authService.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available.'));
    }

    this.refreshInFlight$ = this.http
      .post<ApiResponse<TokenResponseDto>>(`${this.baseUrl}/refresh`, { refreshToken })
      .pipe(
        map(res => res.data),
        tap(tokens => this.authService.setTokens(tokens.accessToken, tokens.refreshToken)),
        // Multicasts the one real HTTP call to every concurrent subscriber instead of each
        // triggering its own request.
        shareReplay(1),
        // Once this refresh attempt settles (success OR error), drop the cached Observable so
        // the *next* 401 starts a fresh refresh call rather than replaying this stale one.
        finalize(() => { this.refreshInFlight$ = null; })
      );

    return this.refreshInFlight$;
  }
}
