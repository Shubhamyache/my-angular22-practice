import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TokenRefreshService } from '../services/token-refresh.service';
import { isPublicAuthEndpoint } from '../utils/auth-endpoints';

/**
 * Owns 401 handling end-to-end: on a 401 from any authenticated endpoint, attempts a single
 * silent token refresh (via TokenRefreshService's single-flight guard — see that file for why),
 * retries the original request once with the new access token, and only logs the user out if
 * the refresh itself fails (expired/revoked/reused refresh token). Public auth endpoints
 * (login, refresh, forgot/reset-password, verify-email) are excluded — a 401 from /auth/login
 * means "bad credentials," not "needs a token refresh."
 *
 * Registered AFTER errorInterceptor in app.config.ts's interceptor array, which — because
 * Angular runs interceptors in array order on the way out and REVERSE order on the way back —
 * means this interceptor sees a raw 401 first (closer to the actual HTTP call) and either
 * resolves it silently or rethrows, before errorInterceptor's generic status-code handling
 * ever sees it.
 */
export const tokenRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const tokenRefreshService = inject(TokenRefreshService);

  if (isPublicAuthEndpoint(req.url)) {
    return next(req);
  }

  return next(req).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse) || err.status !== 401) {
        return throwError(() => err);
      }

      return tokenRefreshService.refreshAccessToken().pipe(
        switchMap(tokens => {
          const retried = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${tokens.accessToken}`)
          });
          return next(retried);
        }),
        catchError(refreshErr => {
          // Refresh itself failed (expired/revoked/reused token) — nothing left to try.
          authService.logout();
          return throwError(() => refreshErr);
        })
      );
    })
  );
};
