/**
 * The six Auth endpoints that don't require (or, for login/refresh/forgot/reset/verify, that
 * must NOT carry) a Bearer token — used by both authInterceptor (to skip attaching a token)
 * and tokenRefreshInterceptor (to skip attempting a silent refresh+retry on a 401 from these).
 *
 * Deliberately excludes /auth/logout and /auth/me — both require Bearer auth per
 * UIIntegrationInfo.md §4, so a 401 from either should still trigger the normal refresh flow.
 */
export const PUBLIC_AUTH_PATHS: readonly string[] = [
  '/auth/login',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
];

export function isPublicAuthEndpoint(url: string): boolean {
  return PUBLIC_AUTH_PATHS.some(path => url.includes(path));
}
