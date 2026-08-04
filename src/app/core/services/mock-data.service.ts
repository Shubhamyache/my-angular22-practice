/**
 * ═══════════════════════════════════════════════════════════════════
 * MOCK DATA SERVICE — Simulated Backend with In-Memory Storage
 * ═══════════════════════════════════════════════════════════════════
 *
 * PURPOSE:
 * ────────
 * Provides realistic mock data for development and testing without
 * requiring a real backend API. All CRUD operations are performed
 * in-memory with simulated network delays.
 *
 * WHY USE THIS PATTERN?
 * ──────────────────────
 * 1. **Development Independence**: Frontend team can work without waiting
 *    for backend APIs to be ready.
 *
 * 2. **Consistent Testing**: Same data structure every time, making
 *    tests more reliable.
 *
 * 3. **Offline Development**: No network required. Work on planes, trains, etc.
 *
 * 4. **Fast Iteration**: Instant feedback loop without real API latency.
 *
 * 5. **Easy Migration**: When real API is ready, just swap the service
 *    implementation. Components don't change.
 *
 * OBSERVABLES VS PROMISES:
 * ─────────────────────────
 * We return Observable<T> (not Promise<T>) because:
 * - Angular's HttpClient returns Observables
 * - Observables can be cancelled (Promises cannot)
 * - RxJS operators work only with Observables
 * - When we swap to real API, no component code changes
 *
 * SIMULATED DELAY:
 * ─────────────────
 * The delay(300) simulates network latency. This helps:
 * - Test loading states in components
 * - Catch race conditions
 * - Provide realistic UX during development
 *
 * GENERIC TYPE CONSTRAINTS:
 * ──────────────────────────
 * We use TypeScript generics (T extends { id: number }) to ensure
 * all mock entities have an 'id' field. This allows the store
 * methods to work with any entity type.
 *
 * INTERVIEW TIP:
 * ───────────────
 * Q: "Why not just use hard-coded arrays in components?"
 * A: "Separation of concerns. Components should not know WHERE data
 *     comes from (mock vs real API). Services abstract the data source."
 */

import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

/**
 * Base entity interface — all mock entities must have an ID.
 */
interface Entity {
  id: number;
}

@Injectable({ providedIn: 'root' })
export class MockDataService {
  /**
   * Simulated network delay in milliseconds.
   * Increase to 1000ms to test loading states more thoroughly.
   */
  private readonly DELAY_MS = 300;

  /**
   * GET ALL — Returns all items with simulated delay
   * ──────────────────────────────────────────────────
   * @param data - Array of items to return
   * @returns Observable that emits after DELAY_MS
   */
  getAll<T>(data: T[]): Observable<T[]> {
    return of(data).pipe(delay(this.DELAY_MS));
  }

  /**
   * GET BY ID — Finds item by ID or returns 404 error
   * ───────────────────────────────────────────────────
   * @param data - Array to search
   * @param id - Entity ID to find
   * @returns Observable with item or error
   */
  getById<T extends Entity>(data: T[], id: number): Observable<T> {
    const item = data.find(x => x.id === id);
    return item
      ? of(item).pipe(delay(this.DELAY_MS))
      : throwError(() => new Error(`Item with id ${id} not found`));
  }

  /**
   * CREATE — Adds new item with auto-incremented ID
   * ─────────────────────────────────────────────────
   * In a real app, the backend generates the ID.
   * Here we simulate it by finding max ID + 1.
   *
   * @param data - Array to add to (mutated)
   * @param item - New item (without ID)
   * @returns Observable with created item (with ID)
   */
  create<T extends Entity>(data: T[], item: Partial<T>): Observable<T> {
    const maxId = data.length > 0
      ? Math.max(...data.map(x => x.id))
      : 0;

    const newItem = { ...item, id: maxId + 1 } as T;
    data.unshift(newItem); // Add to beginning of array
    return of(newItem).pipe(delay(this.DELAY_MS));
  }

  /**
   * UPDATE — Replaces existing item
   * ─────────────────────────────────
   * @param data - Array containing item (mutated)
   * @param id - ID of item to update
   * @param updates - Partial updates to apply
   * @returns Observable with updated item or error
   */
  update<T extends Entity>(data: T[], id: number, updates: Partial<T>): Observable<T> {
    const index = data.findIndex(x => x.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Item with id ${id} not found`));
    }

    const updated = { ...data[index], ...updates };
    data[index] = updated;
    return of(updated).pipe(delay(this.DELAY_MS));
  }

  /**
   * DELETE — Removes item from array
   * ──────────────────────────────────
   * @param data - Array to remove from (mutated)
   * @param id - ID of item to delete
   * @returns Observable that completes or errors
   */
  delete<T extends Entity>(data: T[], id: number): Observable<void> {
    const index = data.findIndex(x => x.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Item with id ${id} not found`));
    }

    data.splice(index, 1);
    return of(void 0).pipe(delay(this.DELAY_MS));
  }

  /**
   * SEARCH — Case-insensitive search across multiple fields
   * ─────────────────────────────────────────────────────────
   * @param data - Array to search
   * @param query - Search term
   * @param searchFn - Function that returns true if item matches
   * @returns Observable with filtered results
   */
  search<T>(
    data: T[],
    query: string,
    searchFn: (item: T, query: string) => boolean
  ): Observable<T[]> {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) {
      return of(data).pipe(delay(this.DELAY_MS));
    }

    const results = data.filter(item => searchFn(item, lowerQuery));
    return of(results).pipe(delay(this.DELAY_MS));
  }
}
