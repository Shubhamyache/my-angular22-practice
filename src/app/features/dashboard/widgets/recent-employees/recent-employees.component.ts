import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RecentEmployee, EmployeeStatus } from '../../models/dashboard.model';

/**
 * ═══════════════════════════════════════════════════════════════════
 * RECENT EMPLOYEES WIDGET — Dumb / Presentational Component
 * ═══════════════════════════════════════════════════════════════════
 *
 * COMPONENT TYPE: Presentational ("Dumb")
 * ─────────────────────────────────────────
 * This component has NO business logic. It:
 *  1. Receives data via Signal Inputs (input())
 *  2. Renders it in a responsive Bootstrap table
 *  3. Does NOT inject services — zero external dependencies
 *
 * WHY DUMB COMPONENTS?
 * ─────────────────────
 * Presentational components are:
 *  ✓ TESTABLE:   Just pass mock input data, check rendered output
 *  ✓ REUSABLE:   Use anywhere — not tied to one service or context
 *  ✓ FAST:       No DI overhead, no subscription lifecycle
 *  ✓ PREDICTABLE: Same input → same output (like a pure function)
 *
 * SIGNAL INPUTS — input() API (Angular 17+)
 * ──────────────────────────────────────────
 *   Old @Input decorator:
 *     @Input() employees: RecentEmployee[] = [];
 *     // In template: employees (no parentheses)
 *     // ngOnChanges() fires on new value
 *
 *   Signal input:
 *     employees = input<RecentEmployee[]>([]);
 *     // In template: employees() (called like a signal)
 *     // Integrated with signal graph — no ngOnChanges needed
 *
 *   Why signal inputs are better:
 *     → Consistent: all reactive values use () syntax
 *     → Angular tracks the dependency automatically
 *     → Works in computed() and effect() inside child
 *     → Type-safe: TypeScript enforces the generic type
 *
 * COMPONENT COMMUNICATION PATTERN:
 * ──────────────────────────────────
 *   DashboardComponent (Smart)
 *       ↓ [employees]="employees()"    ← passes computed signal value
 *   RecentEmployeesComponent (Dumb)
 *       reads employees() in template  ← signal input
 *       renders @for rows
 *
 * DATA FLOWS DOWN via inputs.
 * EVENTS FLOW UP via outputs (this component has none — it links to routes).
 *
 * ANGULAR RENDERING CYCLE:
 * ─────────────────────────
 * When the parent's employees computed() changes:
 *   1. Angular detects the signal change in the parent template
 *   2. Angular re-evaluates [employees]="employees()" in parent
 *   3. The child's employees signal input updates
 *   4. Angular re-renders ONLY this component's template
 *   5. @for produces new <tr> elements for changed items
 *   6. Angular reconciles the DOM with minimal DOM mutations
 *
 * This is fine-grained reactivity — only the affected nodes update.
 */
@Component({
  selector: 'app-recent-employees',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="card border-0 shadow-sm h-100">

      <!-- ── Card Header ──────────────────────────────────────────── -->
      <div class="card-header bg-white border-bottom d-flex align-items-center justify-content-between py-3 px-4">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-people-fill text-primary fs-5"></i>
          <span class="fw-semibold">Recent Employees</span>
          <span class="badge bg-primary bg-opacity-10 text-primary rounded-pill">
            {{ employees().length }}
          </span>
        </div>
        <a routerLink="/employees" class="btn btn-sm btn-outline-primary">
          View All <i class="bi bi-arrow-right ms-1"></i>
        </a>
      </div>

      <!-- ── Responsive Table ──────────────────────────────────────── -->
      <!--
        Bootstrap's table-responsive wraps the table in a horizontal
        scrollable container on small screens — no overflow clipping.
      -->
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="px-4 py-3 fw-semibold text-muted small text-uppercase border-0">Employee</th>
                <th class="py-3 fw-semibold text-muted small text-uppercase border-0 d-none d-md-table-cell">Department</th>
                <th class="py-3 fw-semibold text-muted small text-uppercase border-0 d-none d-lg-table-cell">Joined</th>
                <th class="py-3 fw-semibold text-muted small text-uppercase border-0">Status</th>
              </tr>
            </thead>
            <tbody>
              <!--
                @for DIRECTIVE
                ─────────────────
                @for (item of collection; track item.id) { ... }

                The 'track' expression is the IDENTITY FUNCTION.
                Angular uses it to efficiently reconcile DOM updates:
                  - If an item's id hasn't changed → reuse existing DOM node
                  - If an item's id is new → create a new DOM node
                  - If an item's id is gone → destroy its DOM node

                Without track (or with track $index):
                  → Angular destroys and recreates ALL rows on every change
                  → Expensive for large lists (animations, focus states lost)

                With track emp.id (unique identifier):
                  → Angular PATCHES only the changed rows
                  → O(diff) instead of O(n) DOM operations
              -->
              @for (emp of employees(); track emp.id) {
                <tr>

                  <!-- Avatar + Name + Job Title -->
                  <td class="px-4 py-3">
                    <div class="d-flex align-items-center gap-3">
                      <!--
                        Avatar circle: Bootstrap color variable via inline style.
                        var(--bs-primary) = Bootstrap's primary CSS custom property.
                        Using style binding instead of [class] so the color is dynamic.
                      -->
                      <div
                        class="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
                        [style]="'width:38px;height:38px;background:var(--bs-' + emp.color + ');font-size:0.75rem;'">
                        {{ emp.initials }}
                      </div>
                      <div>
                        <div class="fw-semibold lh-1 mb-1">{{ emp.name }}</div>
                        <div class="text-muted small">{{ emp.jobTitle }}</div>
                      </div>
                    </div>
                  </td>

                  <!-- Department: hidden on mobile (d-none d-md-table-cell) -->
                  <td class="py-3 d-none d-md-table-cell">
                    <span class="text-secondary small">{{ emp.department }}</span>
                  </td>

                  <!-- Join date: hidden on tablet too -->
                  <td class="py-3 d-none d-lg-table-cell">
                    <span class="text-secondary small">{{ formatDate(emp.joinDate) }}</span>
                  </td>

                  <!-- Status badge -->
                  <td class="py-3">
                    <span [class]="'badge rounded-pill ' + statusClass(emp.status)">
                      {{ statusLabel(emp.status) }}
                    </span>
                  </td>

                </tr>

              } @empty {
                <!--
                  @empty block: rendered when the collection is empty.
                  This handles zero state elegantly without extra @if checks.
                -->
                <tr>
                  <td colspan="4" class="text-center text-muted py-5">
                    <i class="bi bi-people d-block fs-1 mb-2 opacity-25"></i>
                    No recent employees to show
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `
})
export class RecentEmployeesComponent {

  /**
   * SIGNAL INPUT
   * ─────────────
   * input<T>(defaultValue?) — creates a readonly signal input.
   *
   * The default [] ensures the template never receives undefined,
   * so @for renders gracefully before the parent passes real data.
   *
   * The parent binds: [employees]="employees()"
   * This component reads: employees() in template
   */
  readonly employees = input<RecentEmployee[]>([]);

  /**
   * PURE HELPER METHODS
   * ────────────────────
   * These are plain class methods, NOT signals.
   * They are called in the template as expressions: {{ statusClass(emp.status) }}
   * Angular re-evaluates them only when the template re-renders.
   *
   * PERFORMANCE NOTE:
   * In a list with hundreds of rows, consider using a @Pipe instead of
   * a method call — a pure pipe is memoized and only re-runs when the
   * input value changes. For 5 rows, a method is fine.
   *
   * Record<K, V> is TypeScript's built-in mapped type:
   *   Record<EmployeeStatus, string> = { Active: string, Inactive: string, OnLeave: string }
   * This gives compile-time exhaustiveness checking — if we add a new
   * EmployeeStatus and forget to add a map entry, TypeScript errors.
   */
  statusClass(status: EmployeeStatus): string {
    const map: Record<EmployeeStatus, string> = {
      'Active':   'bg-success',
      'Inactive': 'bg-secondary',
      'OnLeave':  'bg-warning text-dark',
    };
    return map[status];
  }

  statusLabel(status: EmployeeStatus): string {
    const map: Record<EmployeeStatus, string> = {
      'Active':   'Active',
      'Inactive': 'Inactive',
      'OnLeave':  'On Leave',
    };
    return map[status];
  }

  /**
   * Using Intl.DateTimeFormat instead of Angular's DatePipe to avoid
   * importing DatePipe as a dependency. Intl is built into every
   * modern browser (ES2015+) — zero bundle cost.
   */
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    }).format(new Date(date));
  }
}
