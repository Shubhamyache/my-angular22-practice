import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../services/logger.service';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggerService);
  const started = Date.now();
  logger.log(`→ ${req.method} ${req.url}`);

  return next(req).pipe(
    tap({
      next: () => {
        const elapsed = Date.now() - started;
        logger.log(`← ${req.method} ${req.url} (${elapsed}ms)`);
      },
      error: (err) => {
        const elapsed = Date.now() - started;
        logger.error(`← ${req.method} ${req.url} FAILED (${elapsed}ms)`, err);
      }
    })
  );
};
