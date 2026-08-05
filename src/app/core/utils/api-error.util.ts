/**
 * The normalized error every HTTP call in this app rejects with, after errorInterceptor runs.
 * A plain `Error` (message = the backend's `detail`/`title`, or a safe generic fallback for a
 * 500) so every existing `error: (err: Error) => this.error.set(err.message)` call site across
 * the app — a convention already used everywhere before this migration — keeps working
 * unchanged. `fieldErrors` is attached only for 400 validation failures, for components that
 * want to map errors onto individual form controls instead of (or in addition to) a banner.
 */
export interface ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Case-insensitive lookup into a validation `errors` dictionary — required because the backend
 * mixes PascalCase (`Email`, `FirstName`) and lowercase (`token`, `employeeId`) keys depending
 * on which code path threw the error (UIIntegrationInfo.md §11).
 */
export function getFieldError(
  fieldErrors: Record<string, string[]> | undefined,
  fieldName: string
): string | undefined {
  if (!fieldErrors) return undefined;
  const key = Object.keys(fieldErrors).find(k => k.toLowerCase() === fieldName.toLowerCase());
  return key ? fieldErrors[key][0] : undefined;
}
