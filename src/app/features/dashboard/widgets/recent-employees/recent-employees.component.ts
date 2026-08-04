import { ChangeDetectionStrategy, Component, input } from '@angular/core';
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
  templateUrl: './recent-employees.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
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
