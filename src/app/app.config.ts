import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import {
  provideRouter,
  withPreloading,
  PreloadAllModules
} from '@angular/router';
import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor }         from './core/interceptors/auth.interceptor';
import { errorInterceptor }        from './core/interceptors/error.interceptor';
import { tokenRefreshInterceptor } from './core/interceptors/token-refresh.interceptor';
import { loggingInterceptor }      from './core/interceptors/logging.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(
      withInterceptors([
        authInterceptor,          // Attaches Bearer JWT token (skips the 5 public auth endpoints)
        errorInterceptor,         // Generic ProblemDetails -> UI status-code handling (403/404/409/423/500 + 401 fallback)
        tokenRefreshInterceptor,  // Owns 401: single-flight refresh + retry, or logout if refresh fails.
                                   // Placed AFTER errorInterceptor in this array so it runs CLOSER to the
                                   // actual HTTP call (Angular interceptors see responses in reverse array
                                   // order) — it gets first look at a raw 401 and can resolve it silently
                                   // before errorInterceptor's generic handling ever sees it.
        loggingInterceptor        // Request/response timing logs — innermost, measures the real network call
      ])
    )
  ]
};
