/** RFC 7807 error shape returned by every non-2xx backend response (UIIntegrationInfo.md §11). */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
}

/**
 * The 400-only shape FluentValidation failures use. `errors` keys are INCONSISTENTLY cased —
 * most are PascalCase (raw C# property names), a handful are lowercase (hand-thrown checks on
 * reset-password/verify-email/payroll-history). Always look these up case-insensitively —
 * see getFieldError() in core/utils/api-error.util.ts.
 */
export interface ValidationProblemDetails extends ProblemDetails {
  errors?: Record<string, string[]>;
}
