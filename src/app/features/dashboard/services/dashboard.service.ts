import { Injectable, computed, signal } from '@angular/core';
// ─── Future .NET 10 integration (uncomment when backend is ready) ─
// import { HttpClient }            from '@angular/common/http';
// import { DestroyRef }            from '@angular/core';
// import { takeUntilDestroyed }    from '@angular/core/rxjs-interop';
// import { environment }           from '../../../../environments/environment';

import {
  DashboardSummary, DashboardStats,
  RecentEmployee, RecentProject, RecentTask
} from '../models/dashboard.model';

/**
 * ═══════════════════════════════════════════════════════════════════
 * DASHBOARD SERVICE — Signal-Based State Management
 * ═══════════════════════════════════════════════════════════════════
 *
 * SINGLE RESPONSIBILITY:
 *  Fetch, cache, and expose dashboard data to the component layer.
 *  The component never knows HOW the data arrives — mock, HTTP, cache.
 *
 * ── STATE ARCHITECTURE: Private Write / Public Read ───────────────
 *
 *  Angular 22 enforces unidirectional data flow:
 *
 *    [Service]  private _summary = signal(null)     ← WRITES happen here only
 *               readonly summary = _summary.asReadonly() ← exposed to outside
 *
 *    [Component] reads: this.service.summary()      ← READ only
 *
 *  This mirrors C# { get; private set; }
 *  It prevents accidental state mutation from outside the service,
 *  which is the #1 source of bugs in large Angular apps.
 *
 * ── WHY SIGNALS OVER RxJS BehaviorSubject? ────────────────────────
 *
 *  BehaviorSubject (old):
 *    private _data$ = new BehaviorSubject<T | null>(null);
 *    data$ = this._data$.asObservable();
 *    // In template: {{ data$ | async }}
 *    // Manual subscribe/unsubscribe lifecycle management
 *    // Full Observable pipe chain required
 *
 *  Signal (Angular 22):
 *    private _data = signal<T | null>(null);
 *    data = this._data.asReadonly();
 *    // In template: {{ data() }}  ← reads like a function call
 *    // No subscription lifecycle — signal graph handles cleanup
 *    // Works with both zone.js and zoneless change detection
 *    // Synchronous — no async pipe needed
 *
 * ── CHANGE DETECTION INTEGRATION ─────────────────────────────────
 *
 *  Angular maintains a "signal graph" — a directed acyclic graph of
 *  signal dependencies:
 *
 *    _summary (source signal)
 *       ↓ consumed by
 *    hasData (computed signal)
 *       ↓ consumed by
 *    dashboard.component.html template
 *
 *  When _summary.set(data) is called:
 *    1. Angular marks hasData as DIRTY (not re-evaluated yet — lazy!)
 *    2. Angular schedules a microtask (not a full zone check)
 *    3. When the template is next read, Angular re-evaluates hasData
 *    4. If hasData changed (false → true), Angular re-renders
 *       ONLY the template nodes that depend on it
 *
 *  Without signals (zone.js + ChangeDetectorRef):
 *    → Every async event (setTimeout, HTTP, click) triggers a full
 *      top-down tree walk, re-checking EVERY component in the app.
 *    → Signals eliminate this O(n) tree walk entirely.
 *
 * ── FUTURE .NET 10 INTEGRATION (Step-by-Step Guide) ──────────────
 *
 *  Step 1: Add to constructor params:
 *    private readonly http        = inject(HttpClient);
 *    private readonly destroyRef  = inject(DestroyRef);
 *
 *  Step 2: Replace loadDashboard() body with:
 *    this.http
 *      .get<DashboardSummary>(`${environment.apiUrl}/dashboard`)
 *      .pipe(takeUntilDestroyed(this.destroyRef))
 *      .subscribe({
 *        next:  data => { this._summary.set(data); this._loading.set(false); },
 *        error: err  => { this._error.set('Dashboard load failed.'); this._loading.set(false); }
 *      });
 *
 *  Step 3: The COMPONENT is UNCHANGED.
 *    It reads signals — it doesn't care about the data source.
 *    This is the Dependency Inversion Principle:
 *    the component depends on the ABSTRACTION (signals), not
 *    the IMPLEMENTATION (HTTP vs mock vs cache).
 */
@Injectable({ providedIn: 'root' })
export class DashboardService {

  // ── Private writable signals (this service is the only writer) ───
  private readonly _summary = signal<DashboardSummary | null>(null);
  private readonly _loading = signal(false);
  private readonly _error   = signal<string | null>(null);

  // ── Public readonly signals (components observe, cannot write) ───
  readonly summary = this._summary.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error   = this._error.asReadonly();

  /**
   * COMPUTED SIGNAL — Pure Derived State
   * ──────────────────────────────────────
   * computed() wraps a pure derivation function. It is:
   *
   *  LAZY:       Only runs when a consumer actually reads it.
   *              If nothing reads hasData, the factory never runs.
   *
   *  MEMOIZED:   If _summary() hasn't changed since last read,
   *              computed() returns the CACHED value without re-running.
   *              Multiple components reading hasData share one cached value.
   *
   *  TRACKED:    Angular knows: "hasData depends on _summary".
   *              When _summary changes → hasData is marked dirty.
   *              When template reads hasData → it re-evaluates if dirty.
   *
   *  Think of it as a spreadsheet formula: =A1 <> ""
   *  It automatically recalculates only when A1 (the dependency) changes.
   */
  readonly hasData = computed(() => this._summary() !== null);

  /**
   * Trigger a dashboard data load.
   * Guard prevents concurrent fetches if called multiple times.
   */
  loadDashboard(): void {
    if (this._loading()) return;
    this._loading.set(true);
    this._error.set(null);

    /**
     * SIMULATED ASYNC LATENCY
     * ─────────────────────────
     * setTimeout simulates a ~700ms HTTP round-trip.
     * Signals work correctly inside async callbacks — Angular's scheduler
     * detects signal mutations and schedules a synchronous UI update
     * via microtask (not a full zone check).
     *
     * Replace this entire block with HttpClient.get() when the
     * .NET 10 API is ready. The component template is unchanged.
     */
    setTimeout(() => {
      try {
        this._summary.set(this.buildMockData());
      } catch {
        this._error.set('Failed to load dashboard. Please try again.');
      } finally {
        this._loading.set(false);
      }
    }, 700);
  }

  /** Clear cached data and reload — shows skeleton during refresh. */
  refresh(): void {
    this._summary.set(null);   // null → hasData() = false → skeleton appears
    this.loadDashboard();
  }

  // ══════════════════════════════════════════════════════════════════
  // MOCK DATA — Replace with HTTP call when .NET 10 API is ready.
  // Reference date: 2026-07-25
  // ══════════════════════════════════════════════════════════════════

  private buildMockData(): DashboardSummary {
    return {
      lastUpdated:     new Date(),
      stats:           this.buildStats(),
      recentEmployees: this.buildEmployees(),
      recentProjects:  this.buildProjects(),
      recentTasks:     this.buildTasks(),
    };
  }

  private buildStats(): DashboardStats {
    return {
      totalEmployees:   248,
      employeeChange:   5.2,    // +5.2% vs last month
      activeProjects:   17,
      projectChange:    12.0,
      pendingTasks:     43,
      taskChange:       -8.5,   // negative is good — fewer pending tasks
      totalDepartments: 12,
      departmentChange: 0,
    };
  }

  private buildEmployees(): RecentEmployee[] {
    return [
      { id: 'e1', name: 'Sarah Johnson',   jobTitle: 'HR Manager',       department: 'Human Resources', initials: 'SJ', color: 'primary', joinDate: new Date('2026-07-18'), status: 'Active'  },
      { id: 'e2', name: 'Michael Chen',    jobTitle: 'Sr. Developer',    department: 'Engineering',     initials: 'MC', color: 'success', joinDate: new Date('2026-07-10'), status: 'Active'  },
      { id: 'e3', name: 'Emily Rodriguez', jobTitle: 'Product Designer', department: 'Design',          initials: 'ER', color: 'warning', joinDate: new Date('2026-07-01'), status: 'Active'  },
      { id: 'e4', name: 'James Williams',  jobTitle: 'Finance Analyst',  department: 'Finance',         initials: 'JW', color: 'info',    joinDate: new Date('2026-06-20'), status: 'OnLeave' },
      { id: 'e5', name: 'Olivia Brown',    jobTitle: 'DevOps Engineer',  department: 'Engineering',     initials: 'OB', color: 'danger',  joinDate: new Date('2026-06-12'), status: 'Active'  },
    ];
  }

  private buildProjects(): RecentProject[] {
    return [
      { id: 'p1', name: 'Enterprise ERP Migration', status: 'Active',   priority: 'High',     progress: 65, dueDate: new Date('2026-12-31'), teamSize: 8, budget: 250000 },
      { id: 'p2', name: 'Mobile App Redesign',       status: 'Active',   priority: 'Medium',   progress: 30, dueDate: new Date('2026-09-30'), teamSize: 4, budget: 75000  },
      { id: 'p3', name: 'Data Analytics Platform',   status: 'Planning', priority: 'Critical', progress: 10, dueDate: new Date('2027-03-31'), teamSize: 6, budget: 120000 },
      { id: 'p4', name: 'Customer Portal v2.0',      status: 'OnHold',   priority: 'High',     progress: 45, dueDate: new Date('2026-11-15'), teamSize: 5, budget: 95000  },
    ];
  }

  private buildTasks(): RecentTask[] {
    return [
      { id: 't1', title: 'API Integration Testing',    status: 'InProgress', priority: 'High',     assignee: 'Michael Chen',    assigneeInitials: 'MC', assigneeColor: 'success', dueDate: new Date('2026-10-15'), projectName: 'Enterprise ERP Migration' },
      { id: 't2', title: 'Design Component Library',   status: 'InReview',   priority: 'Medium',   assignee: 'Emily Rodriguez',  assigneeInitials: 'ER', assigneeColor: 'warning', dueDate: new Date('2026-08-30'), projectName: 'Mobile App Redesign'       },
      { id: 't3', title: 'Set Up CI/CD Pipeline',      status: 'Todo',       priority: 'Critical', assignee: 'Olivia Brown',     assigneeInitials: 'OB', assigneeColor: 'danger',  dueDate: new Date('2026-08-20'), projectName: 'Enterprise ERP Migration' },
      { id: 't4', title: 'Technical Documentation',    status: 'Todo',       priority: 'Low',      assignee: 'Michael Chen',    assigneeInitials: 'MC', assigneeColor: 'success', dueDate: new Date('2026-09-10'), projectName: 'Mobile App Redesign'       },
      { id: 't5', title: 'Data Migration Scripts',     status: 'InProgress', priority: 'High',     assignee: 'James Williams',   assigneeInitials: 'JW', assigneeColor: 'info',    dueDate: new Date('2026-10-01'), projectName: 'Enterprise ERP Migration' },
      { id: 't6', title: 'User Authentication Module', status: 'Done',       priority: 'High',     assignee: 'Michael Chen',    assigneeInitials: 'MC', assigneeColor: 'success', dueDate: new Date('2026-07-20'), projectName: 'Customer Portal v2.0'      },
    ];
  }
}
