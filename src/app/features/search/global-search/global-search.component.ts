/**
 * ═══════════════════════════════════════════════════════════════════
 * GLOBAL SEARCH — navbar search box, wired to real data
 * ═══════════════════════════════════════════════════════════════════
 * Replaces the previous static `<input>` in navbar.component.html, which had no (input)
 * handler at all — searching did nothing. This fans a debounced query out to
 * GlobalSearchService (Employees/Projects/Tasks in parallel) and renders a grouped dropdown;
 * clicking a result navigates to its detail page.
 *
 * Each section caps at 6 visible results (the underlying endpoints can return more —
 * Employees up to 20 server-side, Projects/Tasks up to 100) since this is a quick-jump
 * dropdown, not a search-results page; there's no "view all results" page for a raw multi-
 * entity query, so results beyond the cap just don't fit here today (results are already
 * server-scoped/sorted, not truncated arbitrarily).
 */
import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GlobalSearchResults, GlobalSearchService } from '../services/global-search.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProjectStatus } from '../../projects/models/project.model';
import { TaskStatus } from '../../tasks/models/task.model';

const PROJECT_STATUS_BADGE: Record<ProjectStatus, string> = {
  Planning:  'bg-info text-dark',
  Active:    'bg-success',
  OnHold:    'bg-warning text-dark',
  Completed: 'bg-primary',
  Cancelled: 'bg-secondary'
};

const TASK_STATUS_BADGE: Record<TaskStatus, string> = {
  Todo:       'bg-secondary',
  InProgress: 'bg-primary',
  InReview:   'bg-warning text-dark',
  Done:       'bg-success'
};

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;
const SECTION_LIMIT = 6;

const EMPTY_RESULTS: GlobalSearchResults = { employees: [], projects: [], tasks: [] };

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './global-search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GlobalSearchComponent {
  private readonly searchService = inject(GlobalSearchService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  protected readonly query   = signal('');
  protected readonly open    = signal(false);
  protected readonly loading = signal(false);
  protected readonly results = signal<GlobalSearchResults>(EMPTY_RESULTS);

  protected readonly sectionLimit = SECTION_LIMIT;

  private readonly canSearchEmployees = ['Admin', 'HR', 'Manager'].includes(this.authService.getUserRole());
  private readonly query$ = new Subject<string>();

  constructor() {
    this.query$
      .pipe(
        debounceTime(DEBOUNCE_MS),
        distinctUntilChanged(),
        switchMap(q => {
          if (q.trim().length < MIN_QUERY_LENGTH) return of(EMPTY_RESULTS);
          this.loading.set(true);
          return this.searchService.search(q.trim(), this.canSearchEmployees);
        }),
        takeUntilDestroyed()
      )
      .subscribe(results => {
        this.results.set(results);
        this.loading.set(false);
      });
  }

  get hasAnyResults(): boolean {
    const r = this.results();
    return r.employees.length > 0 || r.projects.length > 0 || r.tasks.length > 0;
  }

  get hasQuery(): boolean {
    return this.query().trim().length >= MIN_QUERY_LENGTH;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.open.set(false);
  }

  onFocus(): void {
    this.open.set(true);
  }

  onInput(value: string): void {
    this.query.set(value);
    this.query$.next(value);
  }

  clear(): void {
    this.query.set('');
    this.results.set(EMPTY_RESULTS);
  }

  goTo(path: string, id: number): void {
    this.open.set(false);
    this.clear();
    this.router.navigate([path, id]);
  }

  projectStatusBadge(status: ProjectStatus): string {
    return PROJECT_STATUS_BADGE[status];
  }

  taskStatusBadge(status: TaskStatus): string {
    return TASK_STATUS_BADGE[status];
  }
}
