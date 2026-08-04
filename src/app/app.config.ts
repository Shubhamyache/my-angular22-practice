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
import { authInterceptor }    from './core/interceptors/auth.interceptor';
import { errorInterceptor }   from './core/interceptors/error.interceptor';
import { loggingInterceptor } from './core/interceptors/logging.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(
      withInterceptors([
        authInterceptor,     // Attaches Bearer JWT token for .NET 10 API
        errorInterceptor,    // Global 401/403 handling
        loggingInterceptor   // Request/response timing logs
      ])
    )
  ]
};
