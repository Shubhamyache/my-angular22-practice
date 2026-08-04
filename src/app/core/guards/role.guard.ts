import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const requiredRoles: string[] = (route.data['roles'] as string[]) ?? [];
  const userRole = auth.getUserRole();

  if (requiredRoles.length === 0 || requiredRoles.includes(userRole)) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
