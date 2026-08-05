import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  CurrentUserDto,
  ForgotPasswordRequest,
  LoginRequest,
  ResetPasswordRequest,
  TokenResponseDto,
  VerifyEmailRequest
} from '../../../core/models/auth.model';
import { AuthService } from '../../../core/services/auth.service';
import { TokenRefreshService } from '../../../core/services/token-refresh.service';

/**
 * The real Auth API surface (UIIntegrationInfo.md §3/§4). Orchestrates AuthService (token/user
 * state) around each call — components never touch AuthService's setters directly.
 */
@Injectable({ providedIn: 'root' })
export class AuthFeatureService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly tokenRefreshService = inject(TokenRefreshService);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  /**
   * Logs in, stores the token pair, then immediately fetches /auth/me so
   * `AuthService.currentUser()` (and its `employeeId`, needed for ownership-scoped UI checks
   * per §13) is populated before the caller's subscription completes — components can safely
   * navigate to a protected route the instant this Observable emits.
   */
  login(credentials: LoginRequest): Observable<CurrentUserDto> {
    return this.http.post<ApiResponse<TokenResponseDto>>(`${this.baseUrl}/login`, credentials).pipe(
      map(res => res.data),
      tap(tokens => this.authService.setTokens(tokens.accessToken, tokens.refreshToken)),
      switchMap(() => this.getCurrentUser())
    );
  }

  /**
   * Proactive refresh (e.g. called before the access token's exp is reached). Delegates to
   * TokenRefreshService so there is exactly one code path in the app that ever calls
   * POST /auth/refresh — see that service for why a second, independent call site would
   * reintroduce the refresh-token-reuse race it exists to prevent.
   */
  refresh(): Observable<TokenResponseDto> {
    return this.tokenRefreshService.refreshAccessToken();
  }

  /**
   * Revokes the refresh token server-side, then always clears local session state — even if
   * the network call fails, the user should end up logged out locally rather than stuck.
   */
  logout(): Observable<void> {
    const refreshToken = this.authService.getRefreshToken();
    const request$ = refreshToken
      ? this.http.post<void>(`${this.baseUrl}/logout`, { refreshToken })
      : new Observable<void>(subscriber => subscriber.complete());

    return request$.pipe(
      tap({
        next: () => this.authService.logout(),
        error: () => this.authService.logout()
      }),
      map(() => void 0)
    );
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<void> {
    return this.http
      .post<ApiResponse<null>>(`${this.baseUrl}/forgot-password`, request)
      .pipe(map(() => void 0));
  }

  resetPassword(request: ResetPasswordRequest): Observable<void> {
    return this.http
      .post<ApiResponse<null>>(`${this.baseUrl}/reset-password`, request)
      .pipe(map(() => void 0));
  }

  verifyEmail(request: VerifyEmailRequest): Observable<void> {
    return this.http
      .post<ApiResponse<null>>(`${this.baseUrl}/verify-email`, request)
      .pipe(map(() => void 0));
  }

  /** Rehydrates AuthService.currentUser — call on app bootstrap when a token already exists
   *  (page reload) as well as right after login. */
  getCurrentUser(): Observable<CurrentUserDto> {
    return this.http.get<ApiResponse<CurrentUserDto>>(`${this.baseUrl}/me`).pipe(
      map(res => res.data),
      tap(user => this.authService.setCurrentUser(user))
    );
  }
}
