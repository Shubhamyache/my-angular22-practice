/**
 * ═══════════════════════════════════════════════════════════════════
 * UTILITY FUNCTIONS - Pure Functions for Common Operations
 * ═══════════════════════════════════════════════════════════════════
 *
 * ENTERPRISE PATTERN: Pure Utility Functions
 * ───────────────────────────────────────────
 * Utils are stateless, side-effect-free functions that can be
 * unit tested in isolation and reused throughout the application.
 *
 * WHY UTILITY FUNCTIONS?
 * ──────────────────────
 * - DRY principle (Don't Repeat Yourself)
 * - Testability (pure functions are easy to test)
 * - Consistency (same logic everywhere)
 * - Maintainability (change once, update everywhere)
 * - Type-safety (TypeScript generics)
 *
 * SOLID PRINCIPLES:
 * ─────────────────
 * - Single Responsibility: Each function does one thing
 * - Open/Closed: Can extend via composition without modifying
 * - Dependency Inversion: No dependencies on concrete implementations
 */

/**
 * ARRAY UTILITIES
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Remove duplicates from array
 * @example uniqueBy([{id: 1}, {id: 1}, {id: 2}], 'id') → [{id: 1}, {id: 2}]
 */
export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

/**
 * Group array by key
 * @example groupBy([{type: 'A', val: 1}, {type: 'A', val: 2}], 'type')
 * → { A: [{type: 'A', val: 1}, {type: 'A', val: 2}] }
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Sort array by key (immutable)
 */
export function sortBy<T>(
  array: T[],
  key: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Chunk array into smaller arrays
 * @example chunk([1,2,3,4,5], 2) → [[1,2], [3,4], [5]]
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * STRING UTILITIES
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Capitalize first letter
 * @example capitalize('hello') → 'Hello'
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert to kebab-case
 * @example toKebabCase('HelloWorld') → 'hello-world'
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Convert to camelCase
 * @example toCamelCase('hello-world') → 'helloWorld'
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/[-_\s](.)/g, (_, char) => char.toUpperCase())
    .replace(/^(.)/, char => char.toLowerCase());
}

/**
 * Truncate string with ellipsis
 * @example truncate('Long text here', 10) → 'Long te...'
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Generate initials from name
 * @example getInitials('John Doe') → 'JD'
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Resolves a (relative) avatarUrl — e.g. "/uploads/avatars/3f2a....png" — against the backend
 * origin, for use in <img [src]>. Shared by every place that renders a user's photo (navbar,
 * profile settings) so there's exactly one place that knows this contract; see
 * environment.ts's `backendOrigin` comment for why dev vs prod need different prefixes.
 * @example resolveAvatarSrc('/uploads/avatars/x.png') → '/uploads/avatars/x.png' (dev, via proxy)
 */
export function resolveAvatarSrc(avatarUrl: string, backendOrigin: string): string {
  return `${backendOrigin}${avatarUrl}`;
}

/**
 * DATE UTILITIES
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Check if date is today
 */
export function isToday(date: Date | string): boolean {
  const d = new Date(date);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

/**
 * Check if date is in past
 */
export function isPast(date: Date | string): boolean {
  return new Date(date) < new Date();
}

/**
 * Get relative time string
 * @example getRelativeTime(new Date('2024-01-01')) → '2 days ago'
 */
export function getRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);
  
  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  if (months < 12) return `${months}mo ago`;
  return `${years}y ago`;
}

/**
 * Add days to date
 */
export function addDays(date: Date | string, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * VALIDATION UTILITIES
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Email validation
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Phone validation (US format)
 */
export function isValidPhone(phone: string): boolean {
  const regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return regex.test(phone);
}

/**
 * URL validation
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * NUMBER UTILITIES
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Format number with commas
 * @example formatNumber(1234567) → '1,234,567'
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Format bytes to human-readable
 * @example formatBytes(1024) → '1 KB'
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

/**
 * Clamp number between min and max
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

/**
 * Generate random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * OBJECT UTILITIES
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Deep clone object (simple version)
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if object is empty
 */
export function isEmpty(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Pick specific keys from object
 * @example pick({a: 1, b: 2, c: 3}, ['a', 'c']) → {a: 1, c: 3}
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * Omit specific keys from object
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result as Omit<T, K>;
}

/**
 * ASYNC UTILITIES
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Delay execution (Promise-based)
 * @example await delay(1000); // Wait 1 second
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry async operation with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      await delay(delayMs * attempt); // Exponential backoff
    }
  }
  throw new Error('Max retry attempts reached');
}

/**
 * Debounce function (returns Promise)
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: number | undefined;
  
  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise(resolve => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        resolve(fn(...args));
      }, ms);
    });
  };
}

/**
 * LOCAL STORAGE UTILITIES
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Safe localStorage get with JSON parse
 */
export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Safe localStorage set with JSON stringify
 */
export function setInStorage(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

/**
 * Remove from localStorage
 */
export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
}
