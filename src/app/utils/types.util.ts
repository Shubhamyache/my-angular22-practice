/**
 * ═══════════════════════════════════════════════════════════════════
 * TYPE UTILITIES - Advanced TypeScript Patterns
 * ═══════════════════════════════════════════════════════════════════
 *
 * ENTERPRISE PATTERN: Utility Types for Type Safety
 * ──────────────────────────────────────────────────
 * Custom utility types enhance TypeScript's built-in types and
 * provide better type inference and safety.
 *
 * WHY UTILITY TYPES?
 * ──────────────────
 * - Type safety prevents runtime errors
 * - Self-documenting code
 * - Better IDE autocomplete
 * - Refactoring confidence
 * - Enforces contracts between layers
 */

/**
 * API RESPONSE TYPES
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
  timestamp: string;
}

/**
 * Paginated response
 */
export interface PagedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * API Error response
 */
export interface ApiError {
  message: string;
  code: string;
  status: number;
  errors?: Record<string, string[]>;
}

/**
 * QUERY TYPES
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Sorting configuration
 */
export interface SortConfig<T> {
  field: keyof T;
  direction: 'asc' | 'desc';
}

/**
 * Filtering configuration
 */
export interface FilterConfig<T> {
  field: keyof T;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte';
  value: any;
}

/**
 * Search and pagination params
 */
export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

/**
 * UTILITY TYPE HELPERS
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make all properties required recursively
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Extract keys of specific type
 * @example KeysOfType<User, string> → 'name' | 'email'
 */
export type KeysOfType<T, TProp> = {
  [K in keyof T]: T[K] extends TProp ? K : never;
}[keyof T];

/**
 * Extract values of specific type
 */
export type ValuesOf<T> = T[keyof T];

/**
 * Make specific properties required
 * @example RequireKeys<User, 'email'> → email is now required
 */
export type RequireKeys<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Make specific properties optional
 */
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Nullable type
 */
export type Nullable<T> = T | null;

/**
 * Maybe type (null or undefined)
 */
export type Maybe<T> = T | null | undefined;

/**
 * Constructor type
 */
export type Constructor<T = any> = new (...args: any[]) => T;

/**
 * FORM TYPES
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Form field configuration
 */
export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox' | 'date';
  placeholder?: string;
  required?: boolean;
  validators?: any[];
  options?: Array<{ value: any; label: string }>;
}

/**
 * Form state
 */
export interface FormState {
  dirty: boolean;
  touched: boolean;
  valid: boolean;
  errors: Record<string, string[]>;
}

/**
 * ENTITY TYPES
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Base entity with common fields
 */
export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Entity with soft delete
 */
export interface SoftDeletableEntity extends BaseEntity {
  deletedAt: string | null;
  isDeleted: boolean;
}

/**
 * Entity with audit fields
 */
export interface AuditableEntity extends BaseEntity {
  createdBy: number;
  updatedBy: number;
}

/**
 * STATE TYPES
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Loading state
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Async data wrapper
 */
export interface AsyncData<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Store state base
 */
export interface StoreState<T> {
  items: T[];
  selectedItem: T | null;
  loading: boolean;
  error: string | null;
  filters: Record<string, any>;
  sorting: SortConfig<T> | null;
}

/**
 * ACTION TYPES
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Action creator type
 */
export type ActionCreator<T = void> = T extends void
  ? () => void
  : (payload: T) => void;

/**
 * Async action result
 */
export type AsyncActionResult<T> = Promise<T> | T;

/**
 * GUARD TYPES
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Type guard helper
 */
export function isOfType<T>(
  value: any,
  checkFn: (val: any) => boolean
): value is T {
  return checkFn(value);
}

/**
 * Check if value is defined
 */
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

/**
 * Check if value is string
 */
export function isString(value: any): value is string {
  return typeof value === 'string';
}

/**
 * Check if value is number
 */
export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Check if value is array
 */
export function isArray<T = any>(value: any): value is T[] {
  return Array.isArray(value);
}

/**
 * Check if value is object
 */
export function isObject(value: any): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * HTTP TYPES
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * HTTP methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * HTTP headers
 */
export type HttpHeaders = Record<string, string>;

/**
 * HTTP request config
 */
export interface HttpRequestConfig {
  method: HttpMethod;
  url: string;
  headers?: HttpHeaders;
  params?: Record<string, any>;
  body?: any;
  timeout?: number;
}

/**
 * OBSERVABLE TYPES
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Observable error
 */
export interface ObservableError {
  name: string;
  message: string;
  status?: number;
}

/**
 * VALIDATION TYPES
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Validation rule
 */
export interface ValidationRule<T = any> {
  name: string;
  validator: (value: T) => boolean;
  message: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * ROUTER TYPES
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Route params
 */
export type RouteParams = Record<string, string>;

/**
 * Query params
 */
export type QueryParamsType = Record<string, string | string[]>;

/**
 * ENVIRONMENT TYPES
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Environment configuration
 */
export interface Environment {
  production: boolean;
  apiUrl: string;
  apiVersion: string;
  features: Record<string, boolean>;
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    console: boolean;
    remote: boolean;
  };
}
