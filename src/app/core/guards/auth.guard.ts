import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AuthFeatureService } from '../../features/auth/services/auth-feature.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const authFeature = inject(AuthFeatureService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/auth/login']);
  }

  // Already rehydrated this session (e.g. just logged in) — nothing more to do.
  if (auth.currentUser()) {
    return true;
  }

  // Valid token but no cached user yet — happens on a page reload, since the JWT itself
  // carries no employeeId (UIIntegrationInfo.md §3). Fetch /auth/me once before letting the
  // route activate, so record-level ownership checks (§13) have what they need immediately.
  return authFeature.getCurrentUser().pipe(
    map(() => true),
    catchError(() => of(router.createUrlTree(['/auth/login'])))
  );
};
