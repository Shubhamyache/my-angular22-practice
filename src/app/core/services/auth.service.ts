import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CurrentUserDto, DecodedAccessToken } from '../models/auth.model';

const ACCESS_TOKEN_KEY = 'ems_token';
const REFRESH_TOKEN_KEY = 'ems_refresh_token';

/**
 * Token/session state only. Real API calls (login, refresh, logout, /auth/me, password
 * reset, ...) live in AuthFeatureService — this split mirrors the app's existing convention
 * (core/services/auth.service.ts for state, features/auth/services for the API surface) so
 * every existing consumer of AuthService (guards, interceptors, HasRoleDirective, navbar)
 * keeps working against the same low-level API it already used under mock auth.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);

  private readonly _accessToken = signal<string | null>(
    sessionStorage.getItem(ACCESS_TOKEN_KEY)
  );
  private readonly _refreshToken = signal<string | null>(
    sessionStorage.getItem(REFRESH_TOKEN_KEY)
  );

  /**
   * The JWT carries no `employeeId` claim (UIIntegrationInfo.md §3), so ownership-scoped UI
   * checks (§13 — "is this my project/task/payroll record") need a separate fetch of
   * GET /auth/me. Populated by AuthFeatureService.getCurrentUser(), consumed by authGuard
   * (which fetches it once per session if missing) and by permission helper functions.
   */
  private readonly _currentUser = signal<CurrentUserDto | null>(null);
  readonly currentUser = this._currentUser.asReadonly();
  readonly employeeId = computed(() => this._currentUser()?.employeeId ?? null);

  readonly isAuthenticated = computed(() => {
    const token = this._accessToken();
    if (!token) return false;
    const decoded = this.decodeToken(token);
    return decoded ? decoded.exp * 1000 > Date.now() : false;
  });

  getAccessToken(): string | null {
    return this._accessToken();
  }

  getRefreshToken(): string | null {
    return this._refreshToken();
  }

  setTokens(accessToken: string, refreshToken: string): void {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    this._accessToken.set(accessToken);
    this._refreshToken.set(refreshToken);
  }

  setCurrentUser(user: CurrentUserDto): void {
    this._currentUser.set(user);
  }

  /** Local session teardown only — does not call the backend. AuthFeatureService.logout()
   *  calls POST /auth/logout first (to revoke the refresh token server-side) and then this. */
  logout(): void {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    this._accessToken.set(null);
    this._refreshToken.set(null);
    this._currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getDecodedToken(): DecodedAccessToken | null {
    return this.decodeToken(this._accessToken());
  }

  getUserRole(): string {
    return this.getDecodedToken()?.role ?? '';
  }

  getUserName(): string {
    return this.getDecodedToken()?.name ?? '';
  }

  private decodeToken(token: string | null): DecodedAccessToken | null {
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload)) as DecodedAccessToken;
    } catch {
      return null;
    }
  }
}
