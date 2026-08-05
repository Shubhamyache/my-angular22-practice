import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ValidationProblemDetails } from '../models/problem-details.model';
import { ApiError } from '../utils/api-error.util';
import { ErrorHandlerService } from '../services/error-handler.service';

const GENERIC_SERVER_ERROR_MESSAGE = 'Something went wrong. Please try again.';

/**
 * Normalizes every non-2xx response into a single `ApiError` shape (UIIntegrationInfo.md §11)
 * and fires a global toast for the error classes that need one. Session recovery (401 ->
 * refresh-and-retry, or logout) is intentionally NOT handled here — that's
 * tokenRefreshInterceptor's job, and it runs closer to the actual HTTP call (see
 * app.config.ts's interceptor ordering comment), so by the time an error reaches this
 * interceptor, a 401 has already either been silently resolved or is unrecoverable.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorHandler = inject(ErrorHandlerService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // A role-attribute 403 (ASP.NET Core authorization middleware, runs before the
      // controller) has NO body at all. A service-layer ownership 403 DOES carry ProblemDetails.
      const problem = (err.error ?? undefined) as ValidationProblemDetails | undefined;

      const message =
        err.status === 500
          ? GENERIC_SERVER_ERROR_MESSAGE
          : (problem?.detail || problem?.title || err.message || 'An unexpected error occurred.');

      switch (err.status) {
        case 403:
          errorHandler.notify('warning', problem?.detail || "You don't have permission to do that.");
          break;
        case 409:
          errorHandler.notify('warning', message);
          break;
        case 500:
          errorHandler.notify('danger', GENERIC_SERVER_ERROR_MESSAGE);
          break;
        default:
          // 400 (field errors, handled inline by forms), 401 (owned by tokenRefreshInterceptor),
          // 404 (handled inline by the failing screen), 423 (handled inline by the login form)
          // — none of these need a global toast.
          break;
      }

      const apiError = Object.assign(new Error(message), {
        status: err.status,
        fieldErrors: problem?.errors
      }) as ApiError;

      return throwError(() => apiError);
    })
  );
};
