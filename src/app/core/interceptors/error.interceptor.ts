import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        authService.logout();
      } else if (err.status === 403) {
        router.navigate(['/dashboard']);
      }
      const message =
        (err.error as { message?: string })?.message ??
        err.message ??
        'An unexpected error occurred.';
      return throwError(() => new Error(message));
    })
  );
};
