import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { DatePipe }                 from '@angular/common';
import { DashboardService }         from './services/dashboard.service';
import { AuthService }              from '../../core/services/auth.service';
import { QuickAction }              from './models/dashboard.model';
import { StatsCardComponent }       from './widgets/stats-card/stats-card.component';
import { RecentEmployeesComponent } from './widgets/recent-employees/recent-employees.component';
import { RecentProjectsComponent }  from './widgets/recent-projects/recent-projects.component';
import { RecentTasksComponent }     from './widgets/recent-tasks/recent-tasks.component';
import { QuickActionsComponent }    from './widgets/quick-actions/quick-actions.component';

/**
 * ═══════════════════════════════════════════════════════════════════
 * QUICK ACTIONS — Module-Level Constant
 * ═══════════════════════════════════════════════════════════════════
 * Defined OUTSIDE the class at module scope.
 *
 * Why not inside the class or as a signal?
 *  → Static data never changes at runtime — signals add overhead for no benefit
 *  → Module-level constants are created ONCE when the module is loaded
 *  → If defined inside the class, it is re-allocated on every new instance
 *  → TypeScript tree-shaking can inline module constants more aggressively
 *
 * The array is `as const` — makes it readonly and prevents accidental mutation.
 */
const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Add Employee', icon: 'bi-person-plus-fill',          route: '/employees/create', color: 'primary',   description: 'Onboard a new hire'     },
  { label: 'New Project',  icon: 'bi-kanban-fill',               route: '/projects',         color: 'success',   description: 'Start a new project'    },
  { label: 'Create Task',  icon: 'bi-plus-square-fill',          route: '/tasks',            color: 'warning',   description: 'Add a task'             },
  { label: 'Run Report',   icon: 'bi-file-earmark-bar-graph-fill', route: '/reports',        color: 'info',      description: 'Generate analytics'     },
  { label: 'Departments',  icon: 'bi-diagram-3-fill',            route: '/departments',      color: 'secondary', description: 'Manage org structure'   },
  { label: 'Payroll',      icon: 'bi-cash-coin',                 route: '/payroll',          color: 'danger',    description: 'View payroll records'   },
];

/**
 * ═══════════════════════════════════════════════════════════════════
 * DASHBOARD COMPONENT — Smart / Container Component
 * ═══════════════════════════════════════════════════════════════════
 *
 * COMPONENT TYPE: Smart ("Container")
 * ─────────────────────────────────────
 * This component:
 *  1. Injects services (DashboardService, AuthService)
 *  2. Calls service methods (loadDashboard, refresh)
 *  3. Derives state via computed() signals
 *  4. Runs side effects via effect()
 *  5. Passes data DOWN to dumb child components via inputs
 *
 * Smart components are the "orchestrators". They own the data flow.
 * Dumb components are the "renderers". They only display given data.
 *
 * SMART/DUMB SPLIT IN THIS FEATURE:
 * ───────────────────────────────────
 *   DashboardComponent        ← Smart (this file)
 *     ↓ [employees]
 *   RecentEmployeesComponent  ← Dumb (just renders a table)
 *     ↓ [projects]
 *   RecentProjectsComponent   ← Dumb (just renders cards)
 *     ↓ [tasks]
 *   RecentTasksComponent      ← Dumb (just renders a list)
 *     ↓ [actions]
 *   QuickActionsComponent     ← Dumb (just renders nav buttons)
 *
 * ── ANGULAR RENDERING CYCLE ───────────────────────────────────────
 *
 * 1. CONSTRUCTION: inject(), signal(), computed(), effect() run.
 *    Angular registers signal graph edges.
 *    loadDashboard() is called → _loading.set(true).
 *
 * 2. FIRST RENDER: Angular reads the template, tracks which signals
 *    are consumed. loading() = true → skeleton cards rendered.
 *
 * 3. 700ms LATER: setTimeout fires → _summary.set(data), _loading.set(false).
 *    Angular detects: _summary changed → hasData dirty → stats dirty →
 *    employees dirty → etc.
 *
 * 4. SIGNAL PROPAGATION: Angular schedules a synchronous re-render
 *    (via microtask, NOT a full zone.js check).
 *    Only nodes in the template that depend on changed signals re-render.
 *    Skeleton cards replaced with real cards.
 *
 * 5. EFFECT RUNS: After signal propagation, effect() callbacks execute.
 *    Logging "Dashboard loaded" appears in the console.
 *
 * 6. SUBSEQUENT RENDERS: Only when signal values actually change.
 *    If user navigates away and back, service's `providedIn: 'root'`
 *    means the cached summary is already there → instant render.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DatePipe,
    StatsCardComponent,
    RecentEmployeesComponent,
    RecentProjectsComponent,
    RecentTasksComponent,
    QuickActionsComponent,
  ],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {

  // ── Service Injection ────────────────────────────────────────────
  /**
   * inject() — Angular 22 Recommended Injection API
   * ─────────────────────────────────────────────────
   * inject() works in field initializers (class body, before constructor).
   * This is TypeScript's class field initialization order:
   *   1. Field initializers run top-to-bottom
   *   2. Constructor body runs last
   *
   * inject() requires an "injection context" — it reads from Angular's
   * current DI scope. Field initializers run INSIDE the injection context,
   * so inject() works there. It also works inside constructor().
   *
   * It does NOT work in:
   *   - setTimeout callbacks
   *   - Promise.then()
   *   - Event listeners (unless explicitly passed an injector)
   *
   * Why prefer inject() over constructor params?
   *   constructor(private svc: DashboardService, private auth: AuthService) {}
   *   vs.
   *   protected readonly svc = inject(DashboardService);
   *
   *   ✓ Works in functional contexts (guards, interceptors are just functions)
   *   ✓ No need to list every dep in constructor signature
   *   ✓ Cleaner with many dependencies
   *   ✓ Fields are immediately available — no "possibly undefined" before assignment
   */
  protected readonly dashService  = inject(DashboardService);
  protected readonly authService  = inject(AuthService);

  // ── Static data (no signals needed for immutable config) ─────────
  protected readonly quickActions = QUICK_ACTIONS;

  // ── For skeleton @for loops ───────────────────────────────────────
  // A simple array used to render 4 skeleton cards in the template.
  // Not a signal because it never changes.
  protected readonly skeletonItems = [1, 2, 3, 4];

  // ── Computed Signals — Derived Reactive State ────────────────────
  /**
   * computed() DEEP DIVE
   * ─────────────────────
   * computed() creates a LAZY, MEMOIZED, TRACKED derived signal.
   *
   *   LAZY: The factory runs ONLY when a consumer reads it.
   *         If nothing reads `stats`, the factory never runs.
   *         This is unlike ngOnChanges which runs even if nothing uses the value.
   *
   *   MEMOIZED: If all dependencies return the same values as last time,
   *              computed() returns the CACHED value. Zero re-computation.
   *              Multiple places reading `stats()` share one computation.
   *
   *   TRACKED: Angular registers the dependency graph:
   *              dashService.summary() → stats
   *              When summary changes → stats is marked "dirty"
   *              When template reads stats() → re-evaluates if dirty
   *              If new value !== old value → marks component for re-render
   *
   *   TYPE NARROWING: The `?.` optional chain propagates undefined safely.
   *   `stats()` returns DashboardStats | undefined.
   *   In the template: stats()!.totalEmployees  ← we use ! after @if (hasData())
   *
   * PERFORMANCE: computed() signals give Angular PRECISE knowledge of what
   * changed. Only components that READ a changed computed() signal re-render.
   * Compare to OnPush + markForCheck(): you manually manage which components
   * need re-rendering. With signals, Angular's runtime does it automatically.
   */
  protected readonly loading   = computed(() => this.dashService.loading());
  protected readonly hasData   = computed(() => this.dashService.hasData());
  protected readonly error     = computed(() => this.dashService.error());
  protected readonly stats     = computed(() => this.dashService.summary()?.stats);
  protected readonly employees = computed(() => this.dashService.summary()?.recentEmployees ?? []);
  protected readonly projects  = computed(() => this.dashService.summary()?.recentProjects  ?? []);
  protected readonly tasks     = computed(() => this.dashService.summary()?.recentTasks     ?? []);
  protected readonly lastUpdated = computed(() => {
    const d = this.dashService.summary()?.lastUpdated;
    return d ? new Date(d) : null;
  });

  // ── Local UI State ───────────────────────────────────────────────
  // This signal is LOCAL to this component — it doesn't belong in the service.
  // Rule: if state is only used for UI rendering in ONE component → keep it local.
  //       if state is shared across multiple components → put it in a service.
  protected readonly activityFeedOpen = signal(false);

  constructor() {
    /**
     * effect() — Reactive Side Effect Runner
     * ─────────────────────────────────────────
     * effect() runs a callback WHENEVER its signal dependencies change.
     * Angular automatically tracks which signals are READ inside the callback.
     *
     * EXECUTION MODEL:
     *   1. effect() runs immediately once during construction
     *   2. Thereafter, runs AFTER Angular has processed signal changes
     *      (asynchronously, via microtask scheduler)
     *   3. Runs at most ONCE per change detection cycle per changed signal
     *
     * LIFECYCLE:
     *   Created inside constructor → runs in injection context →
     *   Angular registers it with the component's DestroyRef →
     *   Automatically cleaned up when component is destroyed.
     *   NO manual unsubscribe needed (unlike RxJS subscriptions).
     *
     * CORRECT USE CASES for effect():
     *   ✓ Logging / analytics tracking
     *   ✓ Syncing to localStorage / sessionStorage
     *   ✓ Triggering 3rd-party libs (Chart.js, Google Maps, etc.)
     *   ✓ Debugging (log signal value changes during development)
     *
     * WRONG USE CASES (avoid these):
     *   ✗ Deriving values → use computed() instead
     *   ✗ Writing to other signals → creates circular dependencies
     *      (Angular will throw an error if you write a signal in an effect
     *       that reads that same signal, unless you use allowSignalWrites: true)
     *
     * ANALYTICS PATTERN:
     *   In production, replace console.log with:
     *   this.analyticsService.track('dashboard_viewed', { ... })
     */
    effect(() => {
      const summary = this.dashService.summary();
      if (summary) {
        // Fires once when data loads, again on every refresh
        console.log(
          `[Dashboard] Loaded — employees: ${summary.stats.totalEmployees},` +
          ` projects: ${summary.stats.activeProjects},` +
          ` tasks: ${summary.stats.pendingTasks}`
        );
        // Future: analyticsService.track('dashboard_loaded', { timestamp: summary.lastUpdated });
      }
    });

    effect(() => {
      const err = this.dashService.error();
      if (err) {
        console.error('[Dashboard] Error:', err);
        // Future: toastService.show(err, 'danger');
      }
    });

    /**
     * INITIAL DATA LOAD
     * ─────────────────
     * Angular 22 best practice: prefer constructor over ngOnInit for
     * simple service calls. ngOnInit is still valid but adds a lifecycle
     * hook import and a method. With inject() and signals, the constructor
     * body is the natural place for initialization.
     *
     * The service guard (if (this._loading()) return) prevents double-fetch
     * if loadDashboard() is somehow called twice.
     */
    this.dashService.loadDashboard();
  }

  protected onRefresh(): void {
    this.dashService.refresh();
  }

  protected getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }
}

