import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  log(message: string, ...args: unknown[]): void {
    console.log(`[EMS] ${message}`, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    console.error(`[EMS ERROR] ${message}`, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(`[EMS WARN] ${message}`, ...args);
  }
}
