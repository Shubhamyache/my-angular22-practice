# Angular Interview Essentials

**The condensed companion to `AngularConcepts.md`.**

That document is the full, exhaustive handbook (23 sections, every concept, deep project
archaeology). This one is the **high-frequency core** — the subset of Angular topics that
actually shows up, over and over, in real interviews for a 2–3 year Angular developer. Read this
one the night before an interview; read the big one to actually *build* the depth this one
assumes.

Every topic here is written to be **complete on its own** — definition, why it exists, how it
works, syntax, a short example — just without the long-form project archaeology, alternative-
history discussion, and exhaustive edge-case coverage the full handbook includes. Where a short
example from this project (`FinancialTrackerUI`) makes something concrete for free, it's included;
otherwise the example is generic.

⭐ = extremely likely to come up · Sections are ordered so each builds on the last.

---

## Table of Contents

1. [Angular in One Page](#1-angular-in-one-page)
2. [Standalone Components](#2-standalone-components)
3. [Component Lifecycle](#3-component-lifecycle) ⭐
4. [Component Communication](#4-component-communication) ⭐
5. [Template Control Flow](#5-template-control-flow) ⭐
6. [Dependency Injection](#6-dependency-injection) ⭐
7. [Services & Singletons](#7-services--singletons)
8. [Routing & Guards](#8-routing--guards) ⭐
9. [Reactive Forms](#9-reactive-forms) ⭐
10. [HTTP & Interceptors](#10-http--interceptors) ⭐
11. [RxJS Core](#11-rxjs-core) ⭐
12. [Signals](#12-signals) ⭐
13. [Change Detection](#13-change-detection) ⭐
14. [Pipes](#14-pipes)
15. [Directives](#15-directives)
16. [TypeScript Essentials](#16-typescript-essentials)
17. [Performance Checklist](#17-performance-checklist)
18. [Authentication (JWT)](#18-authentication-jwt)
19. [Testing Basics](#19-testing-basics)
20. [Rapid-Fire Q&A Cheat Sheet](#20-rapid-fire-qa-cheat-sheet) ⭐

---

## 1. Angular in One Page

Angular = a TypeScript-first, batteries-included SPA framework: its own router, forms, DI, HTTP
client, and CLI, all versioned and designed to work together.

**Bootstrap flow (modern, standalone — no NgModules):**
```typescript
// main.ts
bootstrapApplication(App, appConfig).catch(err => console.error(err));
```
```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
  ]
};
```
`bootstrapApplication()` creates the root Injector, registers every provider, instantiates the
root component, attaches it to the DOM, and starts change detection. `provideXxx()` functions are
tree-shakable feature providers — code for a subsystem you never call ships out of the bundle.

**Build pipeline:** TypeScript compile → Ivy AOT template compile (templates become real JS
instructions, fully type-checked at build time) → tree-shaking → code-splitting (one chunk per
lazy route) → minify/hash → `dist/`.

---

## 2. Standalone Components

A component declares its own template dependencies directly (`imports: [...]`) instead of relying
on an enclosing `NgModule`.

```typescript
@Component({
  selector: 'app-stats-card',
  standalone: true,          // default since Angular 19 — often omitted now
  imports: [DatePipe, RouterLink],
  templateUrl: './stats-card.component.html'
})
export class StatsCardComponent {}
```

| | NgModule-based (legacy) | Standalone (current default) |
|---|---|---|
| Scope of "what can I use" | Enclosing `@NgModule`'s `declarations`+`imports` | The component's own `imports` array |
| Bootstrap | `platformBrowserDynamic().bootstrapModule(AppModule)` | `bootstrapApplication(Root, appConfig)` |
| Lazy-load unit | Whole feature module | One component, or a `Routes` array |

**Why it replaced NgModules:** simpler mental model (one graph, not two), better tree-shaking,
trivial single-component lazy loading.

---

## 3. Component Lifecycle ⭐

The single most commonly asked Angular question at any level. **Memorize the order:**

```
constructor()
  → ngOnChanges()        (only if @Input()s exist; before ngOnInit, and again on every input change)
  → ngOnInit()            (once)
  → ngDoCheck()           (every CD cycle)
  → ngAfterContentInit()  (once — content projected via <ng-content> is ready)
  → ngAfterContentChecked()
  → ngAfterViewInit()     (once — this component's own view + children are ready)
  → ngAfterViewChecked()
  → ... DoCheck/ContentChecked/ViewChecked repeat every CD cycle ...
  → ngOnDestroy()         (once, right before removal)
```

| Hook | Use it for | Avoid because |
|---|---|---|
| `ngOnInit` | Initial data fetch, setup that needs inputs already set | — safe default |
| `ngOnChanges` | React to *which* input changed + its previous value | Signal inputs (`input()`) make this mostly unnecessary now — read the signal in a `computed()`/`effect()` instead |
| `ngDoCheck` | Detect mutations `===` can't see | Runs on **every** CD cycle — expensive logic here multiplies fast; prefer signals |
| `ngAfterViewInit` | Read `@ViewChild` DOM/component refs | Reading them any earlier — they don't exist yet |
| `ngOnDestroy` | Unsubscribe, remove listeners, clear timers | Skipping it — the #1 cause of memory leaks |

**Modern note:** with `inject()` usable in field initializers, many "run once on creation" tasks
now live directly in the constructor instead of `ngOnInit` — both are valid; `ngOnInit` is still
the only safe place for logic that specifically needs inputs already bound.

---

## 4. Component Communication ⭐

| Direction | Mechanism | Syntax |
|---|---|---|
| Parent → Child | `input()` (signal input) | `readonly tasks = input<Task[]>([]);` / parent: `[tasks]="tasks()"` |
| Parent → Child (required) | `input.required<T>()` | Compile error if the parent forgets to bind it |
| Child → Parent | `output()` | `readonly closed = output<void>();` → `this.closed.emit();` / parent: `(closed)="onClose()"` |
| Parent → Child (markup) | `<ng-content>` | Content projection — see below |
| Unrelated siblings | Shared `providedIn:'root'` service (often signal-based) | Both read/write the same singleton's signals |

```typescript
// Modern signal-based (this codebase's exclusive style)
readonly taskId = input.required<number>();
readonly cropped = output<Blob>();

// Legacy decorator style (still valid, seen in most existing codebases)
@Input() taskId!: number;
@Output() cropped = new EventEmitter<Blob>();
```

**`EventEmitter` vs `output()`:** `EventEmitter` is literally an RxJS `Subject` subclass (you
could `.pipe()` it); `output()` is a narrower, framework-only API — same job, less surface area.

**`@ViewChild` vs `@ContentChild`:** ViewChild queries *this component's own template*;
ContentChild queries *content projected in from the parent*. Both only resolve after
`ngAfterViewInit`/`ngAfterContentInit` respectively.

**`ng-content` (content projection):**
```html
<!-- modal.component.html -->
<div class="modal-body"><ng-content></ng-content></div>
<div class="modal-footer"><ng-content select="[modal-footer]"></ng-content></div>
```
Lets a parent inject arbitrary markup into a child's layout — used for generic shells (modals,
cards) where the child owns *chrome*, the parent owns *content*.

**Smart vs. Dumb components:** Smart = injects services, owns state, orchestrates. Dumb = only
`input()`s, zero injected services, pure function of its inputs, trivially testable and reusable.
Structure any non-trivial page as one smart container + several dumb children.

---

## 5. Template Control Flow ⭐

```html
@if (loading()) {
  <app-loader />
} @else if (task(); as t) {
  <h2>{{ t.title }}</h2>   <!-- t is narrowed to non-null for this whole block -->
}

@for (task of tasks(); track task.id) {
  <li>{{ task.title }}</li>
} @empty {
  <li>No tasks.</li>
}

@switch (status) {
  @case ('Done') { <span>Done</span> }
  @default { <span>Unknown</span> }
}
```

**Why `@if`/`@for`/`@switch` replaced `*ngIf`/`*ngFor`/`*ngSwitch`:** no `CommonModule` import
needed, `track` is **mandatory** (can't forget it, unlike the old optional `trackBy`), built-in
`@empty`, better TypeScript narrowing, more efficient compiled output.

**`track` — why it matters (very common question):** without a stable identity, Angular can't
tell "item changed" from "item is new," so it destroys/recreates every DOM node on any array
change. `track task.id` lets Angular match old/new nodes by identity and patch only what actually
changed. **Never `track $index`** on a reorderable/filterable list — it silently reassigns DOM
(and any local UI state inside it) to the wrong item after a reorder.

**Binding types:**
| Syntax | Name | Binds to |
|---|---|---|
| `{{ expr }}` | Interpolation | Text content |
| `[prop]="expr"` | Property binding | DOM **property** (not attribute — `[disabled]` sets `.disabled`, a boolean, not a string) |
| `(event)="handler()"` | Event binding | DOM event / component `output()` |
| `[(ngModel)]="x"` | Two-way binding | Sugar for `[x]="v" (xChange)="v=$event"` |

---

## 6. Dependency Injection ⭐

**Why it exists:** inverts control — a class *declares* what it needs; an external Injector
constructs and supplies it. Enables testability (swap real deps for fakes) and decoupling.

```typescript
export class TaskListComponent {
  private readonly taskService = inject(TaskService);   // modern
  constructor(private authService: AuthService) {}       // legacy — both valid, inject() preferred for new code
}
```

**`inject()` vs constructor injection:** `inject()` works in **functional contexts with no
constructor** — guards, interceptors, resolvers are plain functions, so they *must* use
`inject()`. It also reads top-to-bottom without repeating each dependency's type twice.
**Limitation:** only works inside an active injection context (construction time) — **not** inside
`setTimeout`, `.then()`, or a plain event-listener callback added later.

**Hierarchical injectors — resolution walks UP the tree:**
```
Root Injector (bootstrapApplication — providedIn:'root' services live here)
   └─ Route-level injector (if a route supplies its own `providers`)
        └─ Component injector (if a component lists its own `providers`)
```
A request starts at the requester's own injector and walks upward to the first injector with a
matching provider. `NullInjectorError: No provider for X` = walked all the way to root, found
nothing.

**`providedIn: 'root'` — the default for every service in a modern app:**
```typescript
@Injectable({ providedIn: 'root' })
export class TaskService { }
```
One instance, app-wide, for the app's lifetime. Tree-shakable — if nothing ever injects it, it's
dropped from the bundle entirely (unlike an `NgModule.providers` array, which ships whenever that
module loads, used or not).

**Provider forms:**
```typescript
{ provide: TaskService, useClass: TaskService }             // most common (usually just `TaskService`)
{ provide: API_URL, useValue: 'https://api.x.com' }          // constant
{ provide: Logger, useFactory: () => new Logger(inject(Env)) } // computed
{ provide: TOKEN, useExisting: OtherToken }                  // alias
```

**Angular DI vs. .NET DI (common for full-stack roles):** Angular's default lifetime is Singleton
(`providedIn:'root'`); .NET requires explicitly choosing Singleton/Scoped/Transient every time.
.NET's "Scoped" = per HTTP request; Angular's closest equivalent (a component-level provider) =
per component-subtree instance, a different axis entirely. TypeScript interfaces don't exist at
runtime, so you can't inject by interface the way C# does — Angular's answer is `InjectionToken<T>`.

---

## 7. Services & Singletons

Services hold everything a component shouldn't: API calls, business rules, shared state, utility
logic. Convention: one thin `*.service.ts` per REST resource (pure `HttpClient` → `Observable<T>`,
no UI state), separate from any state-holding "store" that orchestrates it.

**The private-writable / public-readonly store pattern** (signals-based state service):
```typescript
@Injectable({ providedIn: 'root' })
export class TaskStore {
  private readonly _tasks = signal<Task[]>([]);
  readonly tasks = this._tasks.asReadonly();          // consumers can read, never mutate

  readonly filteredTasks = computed(() => /* search+filter+sort over _tasks() */);

  loadTasks(): void {
    this.taskService.getAll().subscribe(tasks => this._tasks.set(tasks));
  }
  updateTask(updated: Task): void {
    this._tasks.update(list => list.map(t => t.id === updated.id ? updated : t)); // new array, not mutation
  }
}
```
Because it's `providedIn:'root'`, every component injecting `TaskStore` shares the *same*
signals — this is what makes it "shared state" at all; it's DI, not magic.

---

## 8. Routing & Guards ⭐

```typescript
export const routes: Routes = [
  { path: 'auth', loadChildren: () => import('./auth/auth.routes').then(r => r.AUTH_ROUTES) },
  {
    path: '', loadComponent: () => import('./shell/shell.component').then(c => c.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: 'create', loadComponent: () => import('./x-form.component').then(c => c.XForm) },
      { path: ':id',    loadComponent: () => import('./x-detail.component').then(c => c.XDetail) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'auth/login' }   // wildcard — always LAST
];
```

**Rules that get tested:**
- Routes match **top-to-bottom, first match wins** — `create` must be declared **before** `:id`,
  or `/projects/create` matches `:id` with `id="create"`.
- Wildcard `**` must be last.

**Lazy vs. eager:** `loadComponent`/`loadChildren` (returning a dynamic `import()`) ships that
code as a **separate chunk**, downloaded only when navigated to — the single highest-leverage
performance technique available. `withPreloading(PreloadAllModules)` preloads every lazy chunk in
the background after first paint — fast first load *and* fast subsequent navigation, more total
bandwidth used.

**Route params vs. query params:** `:id` (path) identifies *which* resource
(`route.snapshot.paramMap.get('id')`); `?key=value` adds optional context without changing which
resource (`route.snapshot.queryParamMap.get('key')`).

**Guards:**
```typescript
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isAuthenticated() ? true : inject(Router).createUrlTree(['/auth/login']);
};
```
| Guard | Runs | Returns |
|---|---|---|
| `CanActivate` | Before entering a route | `true`/`false`/`UrlTree` |
| `CanDeactivate` | Before leaving a route | Same — classic use: "unsaved changes, leave anyway?" |
| `CanMatch` | Before a route is even considered a match candidate | Same |

A route guard can only express **coarse, role-level** authorization ("can this role reach this
URL"). **Per-record** ownership ("is this Manager the actual manager of *this* project") can only
be checked once the specific record has loaded — that's a `computed()` in the component, backed
by a small pure permission function, and it's **UX only** — the server re-checks and 403s
regardless. Never treat a client-side check as the real security boundary.

**Navigation:** `<a routerLink="/x">` for anything user-clickable (real `<a>` — new-tab,
middle-click, keyboard nav all work natively) vs. `router.navigate([...])`/`navigateByUrl()`
imperatively after an action completes or for a URL only known at runtime.

---

## 9. Reactive Forms ⭐

```typescript
protected readonly form = this.fb.group({
  email:    ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(8)]]
}, { validators: crossFieldValidator });   // group-level validator

onSubmit(): void {
  if (this.form.invalid) { this.form.markAllAsTouched(); return; }
  const raw = this.form.getRawValue();     // includes DISABLED controls' values
  // form.value excludes disabled controls
}
```

| | Template-Driven | Reactive (default for real forms) |
|---|---|---|
| Model lives in | Template (`[(ngModel)]`) | Component class (`FormGroup`) |
| Type safety | Weak | Strong — `FormGroup<{...}>` |
| Testability | Needs the DOM rendered | Construct/assert in isolation |
| Dynamic fields | Awkward | Natural (`FormArray`) |

**Custom validator (function signature):**
```typescript
function atLeastSomeTime(control: AbstractControl): ValidationErrors | null {
  const hours = control.get('hours')?.value ?? 0;
  const minutes = control.get('minutes')?.value ?? 0;
  return hours + minutes > 0 ? null : { noTimeLogged: true };
}
```
`null` = valid; an object = invalid, keyed by an arbitrary error name the template checks
(`form.errors?.['noTimeLogged']`). Group-level validators (attached to the `FormGroup`, not one
control) are how you express cross-field rules a single control can't see on its own.

**`patchValue()` vs `setValue()`:** `setValue()` requires **every** key or it throws — good for
"reset to a known-complete object." `patchValue()` accepts a partial object, only updates what's
present — the safe default for "prefill from an API response that might not have every field."

**Async validators** return `Observable<ValidationErrors | null>` — used for server-side checks
(email-uniqueness), run after sync validators pass; the control is `PENDING` while in flight.

**`FormArray`** — a dynamic, unnamed list of controls (`.push()`/`.removeAt(i)`) for "add/remove
rows" UIs, vs `FormGroup`'s fixed, named set.

---

## 10. HTTP & Interceptors ⭐

```typescript
getAll(): Observable<Task[]> {
  return this.http.get<ApiResponse<Task[]>>(this.baseUrl, { params })
    .pipe(map(res => res.data));     // unwrap the { data: T } envelope once, here
}
```
Every `HttpClient` method returns an Observable — **cold** (does nothing until `.subscribe()`;
forgetting to subscribe means the request never fires at all) and it **completes** after one
emission (unlike a raw stream that could emit forever).

**`PUT` vs `PATCH`:** `PUT` = replace the whole resource (send every field); `PATCH` = partial
update (send only what changed). Using `PUT` for a single-field change is wasteful and can hit
tighter authorization than the change actually needs — a very real, very common bug source.

**Interceptors — functional style:**
```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getAccessToken();
  return token ? next(req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) })) : next(req);
};
```
```typescript
provideHttpClient(withInterceptors([authInterceptor, errorInterceptor, tokenRefreshInterceptor]))
```

**Critical, frequently-misunderstood fact — request and response order are REVERSED:**
```
Request:   auth → error → refresh → [network]
Response:  auth ← error ← refresh ← [network]
```
Each interceptor's `next(req)` returns an Observable resolved later, so the response flows back
through the *same* chain in reverse. This is why a 401-recovery interceptor is deliberately placed
**after** a generic error-handling interceptor in the array — on the way back, it's *closer* to
the real call and sees the raw 401 **first**, resolving it silently before the generic handler
ever sees it.

**`req.clone()` not mutation** — `HttpRequest` is immutable, same as `HttpParams`/`HttpHeaders`.

**Error layering:** interceptor-level (normalize + global toast for 403/409/500) → component-level
inline `error:` callback (404/screen-specific) → field-level (400 validation, mapped to the
specific input). Never show raw 500 details to the user — generic message only.

---

## 11. RxJS Core ⭐

**Observable / Observer / Subscription:** an Observable is an inert *description* of values over
time; nothing happens until `.subscribe()`. The returned `Subscription` has `.unsubscribe()`.

**Cold vs. Hot:** Cold = work starts fresh per subscriber (`HttpClient` calls — this is why an
unsubscribed HTTP call never fires). Hot = work happens regardless of subscribers, who just tap
into it (`Subject`s, `router.events`).

**Subjects:**
| Type | Behavior |
|---|---|
| `Subject<T>` | Hot, no memory — late subscribers miss past values |
| `BehaviorSubject<T>` | Always has a current value; new subscribers get it immediately (signals have mostly replaced this role in new code) |
| `ReplaySubject<T>(n)` | Buffers/replays the last `n` values |
| `AsyncSubject<T>` | Emits only the final value, only on completion |

### The mapping-operator family — very frequently asked ⭐

| Operator | Behavior on a new source emission while an inner Observable is active | Use case |
|---|---|---|
| `switchMap` | **Cancels** the old, switches to the new | Search-as-you-type, "always want the latest" |
| `mergeMap` | Runs **both concurrently** | Independent parallel work |
| `concatMap` | **Queues** — waits for the old to finish | Order-sensitive sequential work |
| `exhaustMap` | **Ignores** new ones until the old finishes | Prevent double-submit on a button |

```typescript
this.search$.pipe(
  debounceTime(300),          // wait for a pause in typing
  distinctUntilChanged(),      // skip if the value didn't actually change
  switchMap(q => q ? this.svc.search(q) : of([]))   // cancel stale in-flight searches
).subscribe(results => ...);
```

**Combining multiple sources:**
| Operator | Behavior |
|---|---|
| `forkJoin([a$, b$])` | Waits for **all to complete**, emits once with both results (like `Promise.all`). ⚠️ Never emits if any source never completes. |
| `combineLatest([a$, b$])` | Re-emits the latest of each, every time **any** one changes |
| `zip([a$, b$])` | Pairs emissions **by index** |
| `withLatestFrom(b$)` | On every primary emission, attach the latest value from `b$` |

**Utility operators:**
```typescript
.pipe(
  map(res => res.data),                 // transform
  filter(e => e instanceof NavigationEnd), // drop non-matching
  tap(x => console.log(x)),             // side effect, doesn't change the value
  catchError(err => throwError(() => err)), // recover or re-throw
  finalize(() => this.loading.set(false)) // runs on complete OR error — like `finally`
)
```

**`shareReplay(1)`** — multicasts one real underlying call (e.g. an HTTP request) to every
concurrent subscriber instead of each triggering its own. Classic real use: single-flight token
refresh — if two requests 401 at once, both should share **one** refresh call, not fire two (which
can trigger a refresh-token-reuse rejection if the backend rotates tokens).

**Why unsubscribe / `takeUntilDestroyed()`:**
```typescript
someObservable$.pipe(takeUntilDestroyed()).subscribe(...);   // in a component/directive constructor
someObservable$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(...); // in a service — needs explicit DestroyRef
```
An un-torn-down subscription to anything **long-lived** (a timer, `router.events`, a polling
stream) leaks *forever* and keeps calling back into a destroyed component's dead state — the #1
Angular memory-leak pattern. One-shot HTTP subscriptions "leak" only briefly by comparison, but
the discipline should be universal regardless. `takeUntilDestroyed()` is the modern replacement
for the older `takeUntil(this.destroy$)` + manual `Subject` + `ngOnDestroy` boilerplate.

---

## 12. Signals ⭐

```typescript
const count = signal(0);              // WritableSignal<number>
count.set(5);
count.update(v => v + 1);
count();                                // read — also registers as a dependency if read reactively

const doubled = computed(() => count() * 2);   // lazy, memoized, auto-tracked

effect(() => console.log('count is now', count()));  // side effects only, re-runs on dependency change
```

| | `signal()` | `computed()` | `effect()` |
|---|---|---|---|
| Purpose | Holds a value | Derives a value from other signals | Runs a side effect when dependencies change |
| Writable? | Yes (`.set`/`.update`) | No — read-only | N/A — doesn't return a value for others to use |
| Lazy? | N/A | Yes — only runs when read | Runs once immediately, then on each dependency change |
| Memoized? | N/A | Yes | N/A |

**Golden rule:** never mutate an object/array in place and expect a signal to notice — signals
compare by reference. Always `.set(newArray)` or `.update(list => [...list, x])`/`.map()`/
`.filter()` (new reference every time).

**Never derive state inside `effect()`** that other code depends on — that's `computed()`'s job.
Angular even throws if an effect writes to a signal it also reads (infinite-loop guard), unless
`{ allowSignalWrites: true }`.

**Signal vs. Observable — the single most important comparison:**
| | Signal | Observable |
|---|---|---|
| Always has a current value | Yes, synchronously | No — must subscribe |
| Built for | Holding/deriving state | Async streams over time, cancellation, complex composition |
| Composition | `computed()` | The full RxJS operator library |
| Change detection integration | Native | Needs `async` pipe or manual subscription |

**Rule of thumb:** RxJS gets async data **in** (HTTP, timers, DOM events); signals hold and
distribute it once it's landed. `.subscribe({ next: data => mySignal.set(data) })` is the seam
between the two worlds.

**Signal inputs:**
```typescript
readonly tasks = input<Task[]>([]);        // optional, with default
readonly taskId = input.required<number>(); // compile error if the parent doesn't bind it
```

---

## 13. Change Detection ⭐

**Zone.js model (the traditional/most common one — know this even if your app doesn't use it):**
Zone.js monkey-patches every async browser API (`setTimeout`, `Promise.then`, `addEventListener`,
XHR). Whenever any of them completes, Angular runs a change-detection pass over the **whole
component tree** (skipping `OnPush` subtrees whose inputs/events didn't change). "It just works"
automatically, at the cost of checking far more than usually necessary and real bundle/runtime
overhead from Zone.js itself.

**`OnPush` strategy:**
```typescript
@Component({ changeDetection: ChangeDetectionStrategy.OnPush, ... })
```
Only re-checks a component when: (a) an input reference changes, (b) an event originated inside
it, (c) a signal its template reads changes, or (d) `markForCheck()`/`detectChanges()` is called
explicitly. **Default strategy** re-checks regardless of whether inputs changed — always prefer
`OnPush` in real apps.

**Zoneless change detection (`provideZonelessChangeDetection()`) — the modern direction Angular
is heading, and increasingly asked about:** removes Zone.js entirely. Change detection is now
triggered by **precise signals**: a signal write, a new input binding, an `async` pipe emission —
not a generic "something async happened somewhere." Much more surgical, but requires **every**
template-read reactive value to actually be a signal — a plain mutated class property that a
template reads will **silently never update the DOM**, since nothing signals-based observed the
change. `OnPush` is still explicitly set everywhere in a zoneless app — it's the natural
expression of "only recheck what a signal says changed."

| | Zone.js, Default | Zone.js, OnPush | Zoneless + Signals |
|---|---|---|---|
| Trigger | Any patched async API | Same, but skips untouched OnPush subtrees | A specific signal write |
| Granularity | Whole tree | Tree minus untouched OnPush | Exactly the dependent components |
| Debuggability | Hard ("some async thing happened") | Better | Best — traceable to one `.set()` call |

**`markForCheck()` vs `detectChanges()`:** `markForCheck()` schedules a check for the *next*
normal CD pass; `detectChanges()` runs one **synchronously, right now**. Reach for either only
when state changed **outside** signal visibility — needing them is itself a hint to refactor that
state into a signal instead.

---

## 14. Pipes

```typescript
@Pipe({ name: 'dateFormat', standalone: true })
export class DateFormatPipe implements PipeTransform {
  transform(value: string, format: string = 'medium'): string { /* ... */ }
}
```
Used as `{{ t.dueDate | dateFormat:'medium' }}`.

**Pure (default) vs. impure:** Pure pipes only re-run when the **input reference** changes —
effectively memoized, cheap to use freely. Impure pipes (`{ pure: false }`) re-run on **every**
change-detection cycle regardless — needed only when output can change without the input
reference changing (Angular's own `AsyncPipe` must be impure for exactly this reason — it emits
new values from the *same* Observable reference over time).

**Rule of thumb:** for values derived from **signals**, prefer `computed()` (natively integrated,
memoized). Reach for a pipe specifically for template-only, presentation-focused formatting
applied inline at the point of display.

---

## 15. Directives

| Category | Job | Example |
|---|---|---|
| Component | A directive *with* a template | Any `@Component` |
| Structural | Adds/removes DOM | `@if`/`@for` (built-in), a custom `*appHasRole` |
| Attribute | Changes appearance/behavior of an *existing* element | `appHighlight` |

**Custom attribute directive + host bindings:**
```typescript
@Directive({ selector: '[appHighlight]', standalone: true })
export class HighlightDirective {
  @HostBinding('class.active') isActive = false;
  @HostListener('click') onClick() { this.isActive = !this.isActive; }
}
```
`@HostListener` declaratively attaches an event listener to the directive/component's own host
(or `document`/`window` via a prefix: `'document:click'`) with automatic teardown — no manual
`addEventListener`/`removeEventListener` bookkeeping. `@HostBinding` binds a host element property
to a class field. Real-world use: click-outside-to-close dropdowns via
`@HostListener('document:click')` + `ElementRef.nativeElement.contains(event.target)`.

**`Renderer2`** — Angular's DOM-manipulation abstraction (`renderer.setStyle(el, 'color', 'red')`
instead of touching `nativeElement.style` directly) — keeps code platform-agnostic (works under
SSR, where there's no real DOM).

---

## 16. TypeScript Essentials

| Feature | Example | Why it matters here |
|---|---|---|
| `interface` for shapes, `type` for unions | `interface Task {...}` / `type TaskStatus = 'Todo'\|'Done'` | Community convention; unions can't be interfaces |
| String-literal unions instead of `enum` | `type UserRole = 'Admin'\|'HR'\|...` | Zero runtime cost (pure compile-time), vs. native `enum`'s real JS object output |
| Generics | `ApiResponse<T>`, `Observable<T>` | One shape, many concrete types, fully type-checked |
| `Record<K, V>` | `Record<TaskStatus, {badge: string}>` | Forces exhaustiveness — add a union member, compiler flags every incomplete map |
| `Partial<T>` / `Omit<T,K>` / `Pick<T,K>` | `Omit<Task, 'id'>` for a create-DTO | Derive one shape from another instead of duplicating |
| `keyof` / `typeof` | `field: keyof T` | Type-safe "which property" references |
| `unknown` vs `any` | Prefer `unknown` + narrowing | `any` opts out of checking entirely; `unknown` forces a guard before use |
| `readonly` | `readonly tasks = signal(...).asReadonly()` | Encapsulation — consumers can't call `.set()` |
| Access modifiers | `private`/`protected`/`public` | Angular templates can read `protected`/`public` members, **not** `private` (enforced at compile time via `strictInputAccessModifiers`) |
| Arrow functions | `.subscribe(x => this.foo.set(x))` | Lexical `this` — required for correctly referencing the enclosing class inside a callback |
| `async`/`await` vs Observables | `await confirmDialog.confirm(...)` | Promise = exactly one value eventually (a dialog's yes/no); Observable = a general async stream — pick based on that shape |
| Decorators | `@Component`, `@Injectable`, `@Pipe` | Attach compile-time metadata Angular's compiler reads |

---

## 17. Performance Checklist

1. **Lazy-load every feature** (`loadComponent`/`loadChildren`) — the single biggest lever.
2. **`track` in every `@for`**, always a stable id, never `$index` on a reorderable list.
3. **`OnPush` on every component.**
4. **`computed()` instead of a plain method call in a template** — plain methods re-run on every
   CD check; `computed()` is memoized and only reruns when a real dependency changed.
5. **Pure pipes**, not impure, unless genuinely necessary.
6. **`shareReplay`/signal-store caching** — don't let N components independently refetch the same
   data.
7. **Virtual scroll** once a list genuinely outgrows what server-side pagination handles
   comfortably (not needed at typical CRUD-app volumes).
8. **`NgOptimizedImage`** for any real image-heavy content (responsive `srcset`, lazy loading,
   prevents layout shift).
9. **Debounce + cancel** (`debounceTime` + `switchMap`) on any search-as-you-type input.
10. **Tree-shaking hygiene** — standalone components + `providedIn:'root'` + feature-provider
    functions all exist partly to let the bundler prove "this is unused, delete it."

---

## 18. Authentication (JWT)

**Flow:** login → `POST /auth/login` returns `{ accessToken, refreshToken }` → store both →
attach `Authorization: Bearer <token>` to every subsequent call via an interceptor → a 401
triggers a silent refresh-and-retry → on refresh failure, log out.

```typescript
// Client-side decode — UX only, never trust it as verification
const payload = JSON.parse(atob(token.split('.')[1]));
```
**Critical distinction (frequently tested):** decoding a JWT client-side is trivial (it's just
base64) and tells you nothing about authenticity — only the server, holding the signing secret,
can actually **verify** it. Client-side decode drives what the UI *shows*; the server is the only
real authority on what's *allowed*.

**Storage trade-off:** `sessionStorage` (cleared when the tab closes, smaller leak window, no
cross-tab persistence) vs. `localStorage` (persists indefinitely, larger leak window if
XSS'd) vs. an `HttpOnly` cookie (the only option genuinely immune to XSS token theft, since
JavaScript can't read it at all — but requires server cookie support).

**Refresh token rotation:** each successful refresh revokes the old refresh token and issues a
new one — presenting a used one twice is treated as theft, revoking the whole session. This makes
**single-flight** refresh logic essential (`shareReplay(1)` over the in-flight refresh
Observable) — two concurrent 401s must share one refresh call, or the second one's now-stale
token gets rejected as reuse.

**Two authorization layers, not one:**
1. **Route guards** — coarse, role-only ("can this role reach this URL").
2. **Per-record permission functions** — fine-grained, data-dependent ("is this Manager actually
   this project's manager"), evaluated once the specific record has loaded, **UX only** — the
   server re-checks and 403s regardless of what the client believes.

---

## 19. Testing Basics

- **Angular's modern default runner:** `@angular/build:unit-test`, backed by **Vitest** (not the
  historical Karma+Jasmine combo most tutorials still assume) — `describe`/`it`/`expect` API looks
  familiar either way, but the execution engine and config are different.
- **`TestBed`** — Angular's DI/component-creation harness for tests:
  ```typescript
  TestBed.configureTestingModule({ imports: [MyStandaloneComponent] });
  const fixture = TestBed.createComponent(MyStandaloneComponent);
  fixture.componentRef.setInput('tasks', []);   // the way to set a signal input from a test
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('...');
  ```
- **Dumb/presentational components are far easier to test** than smart ones — no services to
  mock, just set inputs and assert the render (another payoff of the smart/dumb split).
- **Mocking a service:** `{ provide: TaskService, useValue: fakeTaskService }` in
  `TestBed.configureTestingModule({ providers: [...] })`.
- **Pure functions need no `TestBed` at all** — call them directly (e.g., a permission-check
  function) — the highest-value, lowest-effort place to start adding coverage to any codebase.

---

## 20. Rapid-Fire Q&A Cheat Sheet

1. **Component vs. directive?** A component is a directive with a template.
2. **`ngOnInit` vs constructor?** Constructor runs before inputs are set; `ngOnInit` guarantees
   they are.
3. **`@Input`/`@Output` vs `input()`/`output()`?** Same job; the signal-based functions integrate
   natively with `computed()`/`effect()` and need no decorator.
4. **Why is `track` mandatory in `@for`?** Prevents the entire-list-recreation bug that plagued
   `*ngFor` when `trackBy` was forgotten.
5. **`providedIn:'root'` vs a module's `providers` array?** Tree-shakable (dropped if unused) vs.
   always included once the module loads.
6. **Why can't `inject()` be called in a `setTimeout`?** No active injection context outside
   construction.
7. **Route guard order/precedence?** First match in the array wins; a `UrlTree` return is the
   modern way to redirect.
8. **Lazy vs. eager loading?** Separate downloadable chunk, loaded on navigation vs. bundled in
   the initial payload.
9. **`patchValue` vs `setValue`?** Partial-safe vs. requires-every-key.
10. **`PUT` vs `PATCH`?** Full replace vs. partial update.
11. **Cold vs. hot Observable?** Work starts per-subscriber vs. happens regardless, subscribers
    just tap in.
12. **Why must you unsubscribe?** Memory leaks + callbacks firing against dead component state;
    worst for long-lived/repeating sources (timers, event streams), not one-shot HTTP calls.
13. **`switchMap` vs `exhaustMap`?** Cancel-and-replace vs. ignore-while-busy.
14. **`forkJoin` gotcha?** Never emits if any source never completes.
15. **`shareReplay(1)` real use case?** Multicast one in-flight request (e.g. token refresh) to
    every concurrent caller instead of each firing its own.
16. **Signal vs Observable?** Sync current-value holder vs. async stream — use RxJS to get data
    in, signals to hold/distribute it.
17. **Why does `effect()` throw if it writes a signal it also reads?** Infinite-loop guard —
    derive with `computed()` instead.
18. **`OnPush` in a zoneless app — redundant?** No — it's the natural expression of
    "only recheck what a signal says changed."
19. **What breaks in a zoneless app if you mutate a plain property?** Nothing re-renders — no
    Zone.js is watching for it, and nothing signals-based observed it.
20. **Pure vs impure pipe?** Re-runs only on input-reference change vs. every CD cycle; `AsyncPipe`
    must be impure.
21. **`@ViewChild` vs `@ContentChild`?** Own template vs. parent-projected content.
22. **`Renderer2` vs direct `nativeElement` mutation?** Platform-agnostic (SSR-safe) vs. DOM-only.
23. **`any` vs `unknown`?** Opts out of checking entirely vs. safe until narrowed.
24. **Why string-literal unions instead of `enum` here?** Zero runtime bundle cost, same
    type-safety, plus free exhaustiveness checks via `Record<Union, V>`.
25. **JWT client-side decode — safe to trust?** Never for authorization — only the server can
    verify a signature; decode is UX-only.
26. **`sessionStorage` vs `localStorage` for tokens?** Smaller leak window (tab-scoped, cleared on
    close) vs. persistent across tabs/restarts; neither is XSS-proof — only an `HttpOnly` cookie is.
27. **Why does refresh-token rotation need single-flight handling?** Concurrent 401s naively
    firing two refresh calls — the second, now presenting an already-rotated token, gets rejected
    as reuse and force-logs-out the user for no real reason.
28. **Route-level vs per-record authorization?** Coarse "can this role reach this URL" vs.
    fine-grained "does this user own this specific record" — the latter only knowable once data
    has loaded, and never a real security boundary on its own.
29. **`markForCheck()` vs `detectChanges()`?** Schedule for next CD pass vs. run one synchronously
    right now.
30. **Interceptor response order?** Reverse of request order — last-registered interceptor sees
    the raw response *first* on the way back.
31. **Why `req.clone()` not mutation?** `HttpRequest` is immutable, like `HttpParams`/`HttpHeaders`.
32. **Smart vs dumb component?** Injects services + owns state vs. pure function of its inputs,
    zero services, trivially testable.
33. **`FormArray` vs `FormGroup`?** Dynamic, unnamed list vs. fixed, named set of controls.
34. **Async validator timing?** Runs only after all synchronous validators pass; control is
    `PENDING` meanwhile.
35. **Why prefer `computed()` over a plain template method call?** Memoized and lazy — a plain
    method reruns on every single change-detection check regardless of whether anything changed.
36. **What does `NG0100: Expression has changed after it was checked` mean?** A value read during
    CD changed again as a side effect of that same check (e.g., a template method returning a new
    array reference every call).
37. **When would you choose a Promise over an Observable?** Exactly one value, eventually, with no
    need for cancellation or operator composition — e.g. a modal's yes/no answer.
38. **Structural vs attribute directive?** Adds/removes DOM vs. changes an existing element's
    appearance/behavior without adding/removing it.
39. **Biggest single performance lever in a large Angular app?** Lazy loading every feature
    boundary.
40. **What's the honest first place to add tests to an untested real codebase?** Pure functions
    with no Angular dependencies (e.g. permission-check logic) — zero setup, highest logic density,
    then presentational components, then the rest.

---

Keep `AngularConcepts.md` open beside this one — every row in the tables above has a full,
project-grounded write-up there if an answer needs more depth than a cheat sheet can hold.
