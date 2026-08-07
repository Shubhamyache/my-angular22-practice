# Angular Concepts — The Complete Interview Handbook

**Built from a real, working codebase: `FinancialTrackerUI` (Employee Management System)**
Angular 22 · Standalone Components · Signals · Zoneless Change Detection · Reactive Forms · Bootstrap 5

This is not a generic Angular tutorial. Every concept below is explained from first principles
(what/why/how/when/when-not) and then, wherever the project actually uses it, grounded in a real
file and real line of code from this repository — file paths are exact, so you can open them and
read the surrounding code for more context.

Target reader: an Angular Full-Stack developer with ~2.5 years of experience, preparing for
interviews that go beyond syntax recall into "why does Angular work this way" and "what would you
do differently in production."

---

## How To Use This Document

Read it **in order** the first time — Section 2 assumes you understand Section 1's vocabulary,
Section 11 (Signals) assumes you understand Section 3 (Components) and Section 15 (Change
Detection) assumes you understand Section 11. After the first read, use it as a reference: jump to
any section, each one is self-contained enough to re-read on its own before an interview.

⭐⭐⭐⭐⭐ marks the topics interviewers ask about most at the 2–3 year experience level.

---

## Table of Contents

1. [Angular Fundamentals](#section-1--angular-fundamentals)
2. [Project Architecture](#section-2--project-architecture)
3. [Components](#section-3--components)
4. [Templates](#section-4--templates)
5. [Dependency Injection](#section-5--dependency-injection)
6. [Services](#section-6--services)
7. [Routing](#section-7--routing)
8. [Forms](#section-8--forms)
9. [HTTP Communication](#section-9--http-communication)
10. [RxJS](#section-10--rxjs)
11. [State Management & Signals](#section-11--state-management--signals)
12. [Pipes](#section-12--pipes)
13. [Directives](#section-13--directives)
14. [TypeScript for Angular](#section-14--typescript-for-angular)
15. [Change Detection (Zoneless)](#section-15--change-detection-zoneless)
16. [Performance Optimization](#section-16--performance-optimization)
17. [Authentication](#section-17--authentication)
18. [Interceptors](#section-18--interceptors)
19. [Error Handling](#section-19--error-handling)
20. [Testing](#section-20--testing)
21. [~100 Interview Questions](#section-21--100-interview-questions)
22. [Project-Specific Concept Map](#section-22--project-specific-concept-map)
23. [Learning Roadmap](#section-23--learning-roadmap)

---

# SECTION 1 — Angular Fundamentals

## 1.1 What Angular Is

Angular is a **TypeScript-first, opinionated, batteries-included front-end framework** maintained
by Google. "Batteries included" is the key word that separates it from React: Angular ships its
own router, forms library, HTTP client, dependency injection system, testing utilities, CLI, and
build tooling, all designed to work together and versioned together. React is a rendering library;
Angular is a full application platform.

## 1.2 Why Angular Exists

Before frameworks like Angular, large JavaScript applications became unmaintainable: DOM
manipulation was manual (`document.getElementById(...).innerHTML = ...`), state was scattered
across global variables, and there was no structural convention forcing two different developers
to organize code the same way. Angular (AngularJS in 2010, rewritten as "Angular 2+" in 2016)
solved this by introducing:

- **Declarative templates** — describe *what* the UI should look like for a given state, not the
  imperative steps to mutate the DOM into that state.
- **Component-based architecture** — UI is a tree of small, isolated, reusable components instead
  of one giant page script.
- **Two-way data binding** (and later, more disciplined one-way + explicit two-way) — sync between
  model and view without manual DOM listeners.
- **Dependency Injection** — testable, decoupled services instead of singletons imported by file
  path.
- **A CLI and opinionated project structure** — every Angular project looks recognizably similar,
  which matters enormously at the scale of a team or an enterprise codebase (this project's own
  `CLAUDE.md` and `ENTERPRISE_ARCHITECTURE.md` are examples of a team codifying "the Angular way"
  for itself).

## 1.3 SPA Architecture (Single Page Application)

A traditional multi-page app makes a full HTTP round trip (and a full page reload) on every
navigation. An SPA loads **one** HTML shell once, then the JavaScript framework:

1. Intercepts link clicks / URL changes.
2. Matches the new URL against a client-side route table.
3. Swaps out only the relevant DOM subtree (via the router's `<router-outlet>`), without a page
   reload.
4. Fetches only the *data* it needs via `HttpClient` (JSON over `fetch`/`XHR`), not a new HTML
   document.

```
Traditional multi-page app:              Angular SPA:
┌────────┐  full reload  ┌────────┐      ┌──────────────────────────────┐
│ /login │ ───────────►  │  /home │      │  index.html loaded ONCE       │
└────────┘               └────────┘      │  ┌────────────────────────┐  │
                                          │  │ Router swaps            │  │
                                          │  │ <router-outlet> content │  │
                                          │  │  /auth/login → /dashboard│  │
                                          │  └────────────────────────┘  │
                                          │  Only JSON is fetched after   │
                                          │  the initial JS bundle loads  │
                                          └──────────────────────────────┘
```

This project's `src/index.html` is loaded exactly once by the browser; from there,
`app.routes.ts` drives every subsequent "page" the user sees, including the `/auth/login` →
`/dashboard` transition after a successful login (`AuthFeatureService.login()` navigates via the
Router, not `window.location`).

## 1.4 What Happens When `ng serve` Runs

1. The Angular CLI reads `angular.json` to find the project's build configuration (entry point,
   `tsconfig`, assets, styles).
2. `esbuild`/the Angular build system (`@angular/build`, the modern successor to the old
   webpack-based `@angular-devkit/build-angular`) compiles every TypeScript file, including
   running the **Angular Compiler (`ngc`/Ivy AOT compiler)** over every `@Component`'s template.
3. A development server starts (usually on `http://localhost:4200`), serving the compiled JS/CSS
   bundles and `index.html`.
4. A file watcher recompiles and triggers **Hot Module Replacement / live reload** whenever a
   source file changes.
5. `proxy.conf.json` (present in this project) is consulted so that any request to `/api` or
   `/uploads` is transparently forwarded to the real backend (`https://localhost:7048`) instead of
   404ing against the dev server — see `environment.ts`'s comment on why this exists (the backend
   has no CORS middleware configured, so same-origin via the proxy is the only way the browser
   allows the calls in local dev).

## 1.5 How the Browser Loads Angular

```
Browser requests /  ──►  index.html  ──►  <script src="main.js"> (+ vendor/polyfill chunks)
                                                │
                                                ▼
                                          main.ts runs
                                                │
                                                ▼
                                   bootstrapApplication(App, appConfig)
                                                │
                                                ▼
                          Angular creates the root component (App),
                          registers all providers from appConfig,
                          and renders <app-root> into <body>
                                                │
                                                ▼
                     Router (provideRouter) reads the current URL and
                     lazy-loads + renders the first matched route's component
                     inside <router-outlet>
```

`index.html` in this project is minimal — it just has `<app-root></app-root>` in the body and a
`<script>` tag (injected automatically by the CLI at build time) pointing at the compiled bundles.

## 1.6 `main.ts` ⭐⭐⭐

```typescript
// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
```

This is the **true entry point** of every modern (standalone) Angular application. `main.ts`
does exactly one job: call `bootstrapApplication()`, passing the root component and the
application-wide configuration. There is no `NgModule` anywhere in this call — that's the
"standalone" story (see 1.13).

**WHY it's structured this way:** separating "what to bootstrap" (`App`) from "how to configure
it" (`appConfig`) means `appConfig` can be swapped per environment or per test without touching
`main.ts` at all — `app.spec.ts` in this project reuses `App` directly in `TestBed` without ever
importing `main.ts`.

## 1.7 `bootstrapApplication()`

**WHAT:** the function that replaces the old `platformBrowserDynamic().bootstrapModule(AppModule)`
call from NgModule-based Angular. It takes a root **standalone component** and an
`ApplicationConfig` (a plain object of providers) and:

1. Creates the root `Injector` (the top of the DI tree) and registers every provider from
   `appConfig.providers`.
2. Instantiates the root component (`App`).
3. Attaches it to the DOM element matching the component's selector (`app-root`) found in
   `index.html`.
4. Starts change detection.

**HOW internally:** it creates a `PlatformRef` (the "browser platform," which knows how to talk to
the DOM/BOM), then an `ApplicationRef` (the running application instance), resolves the DI graph
lazily as components/services request dependencies, and finally triggers the first render pass.

**WHY it replaced `NgModule` bootstrapping:** `NgModule` bootstrapping required a root
`AppModule` that declared/imported everything eagerly, which (a) made tree-shaking harder (the
bundler couldn't always prove a module's declarations were unused), (b) added a layer of
indirection beginners found confusing ("why do I need to add my component to a module *and*
declare it?"), and (c) made lazy-loading verbose (`loadChildren: () =>
import('./x.module').then(m => m.XModule)` vs. today's `loadComponent: () =>
import('./x.component').then(c => c.XComponent)`).

## 1.8 `app.config.ts` ⭐⭐⭐⭐

```typescript
// src/app/app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(
      withInterceptors([
        authInterceptor, errorInterceptor, tokenRefreshInterceptor, loggingInterceptor
      ])
    )
  ]
};
```

This is the modern replacement for `AppModule`'s `providers: [...]` array. Each `provideXxx()`
call is a **feature provider function** — a factory that returns the `Provider[]` needed to wire
up one Angular subsystem. This project's `app.config.ts` tells you, at a glance, exactly what
"platform" this app runs on without reading a single component:

- `provideZonelessChangeDetection()` — **this app does not use Zone.js** (see Section 15 — this is
  one of the most distinctive architectural facts about this codebase and a great interview
  talking point).
- `provideRouter(routes, withPreloading(PreloadAllModules))` — the Router is configured to
  eagerly *preload* every lazy chunk in the background after the initial page renders (fast
  subsequent navigations, at the cost of extra background bandwidth — see Section 7).
  `withPreloading` is a **router feature function**, the same "opt-in feature" pattern
  `provideHttpClient`/`withInterceptors` uses.
- `provideHttpClient(withInterceptors([...]))` — registers the functional interceptor chain, in
  a specific, deliberate order (see Section 18).

**WHY this pattern (feature providers) exists:** it's tree-shakable. If a project never calls
`provideHttpClient()`, none of `HttpClient`'s code ends up in the final bundle. The old
`HttpClientModule` import achieved the same *result* but through NgModule import graphs, which
were harder for the bundler to prove were unused.

## 1.9 `AppComponent` / Root Component

```typescript
// src/app/app.ts
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`
})
export class App {}
```

The **root component** is the single component instance that exists for the entire lifetime of
the application (until a full page reload). Every other component in the app is, directly or
indirectly, a descendant of it in the **component tree**. In this project the root component is
deliberately tiny — its only job is to host `<router-outlet>`, which is where the Router injects
whatever component matches the current URL (first `AUTH_ROUTES` or `ShellComponent`, per
`app.routes.ts`).

**WHY keep it this thin:** any logic in the root component runs for literally every page of the
app and is hard to test in isolation. This project pushes all real UI (navbar, sidebar, page
content) down into `ShellComponent`, which is loaded *by* the router rather than hardcoded into
`App` — that way, the `/auth/*` routes (login, forgot-password) render **without** the
authenticated shell around them at all, which a shell hardcoded into `App` couldn't express.

## 1.10 Component Tree

Angular renders UI as a tree, and understanding this tree is essential for reasoning about change
detection, DI, and data flow (Input/Output).

```
App (root)
 └─ <router-outlet>
     └─ ShellComponent                     (only for authenticated routes)
         ├─ NavbarComponent
         │   ├─ GlobalSearchComponent
         │   ├─ NotificationBellComponent
         │   └─ ProfileMenuComponent
         ├─ SidebarComponent
         ├─ <router-outlet> (nested)
         │   └─ DashboardComponent          (or TaskListComponent, etc. — whatever route matched)
         │       ├─ StatsCardComponent × 4
         │       ├─ QuickActionsComponent
         │       ├─ RecentTasksComponent
         │       └─ RecentProjectsComponent
         └─ FooterComponent
```

Data flows **down** the tree via `@Input`/signal inputs; events flow **up** via `@Output`/signal
outputs. A parent never reaches into a child's internals directly (that would break
encapsulation) — see Section 3.6.

## 1.11 Standalone Components ⭐⭐⭐⭐⭐

**WHAT:** a component that declares its own dependencies (other components, directives, pipes it
uses in its template) directly in its own `@Component({ imports: [...] })` array, instead of
relying on an enclosing `NgModule`'s `declarations`/`imports`.

```typescript
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, RouterLink, StatsCardComponent, RecentTasksComponent, /* … */],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent { /* … */ }
```
(`src/app/features/dashboard/dashboard.component.ts`)

Every single component, directive, pipe, and service in this entire project is standalone —
there is not one `NgModule` in the codebase (other than the implicit ones Angular's testing
utilities use internally).

**WHY Angular added this (Angular 14 introduced it, Angular 17 made it the CLI default, Angular
19+ removed the `standalone: true` boilerplate requirement — implicitly standalone by default):**

- NgModules were a *second, parallel* dependency graph on top of the DI graph and the component
  tree. A component's "what can I use in my template" question required understanding which
  module declared it AND which modules that module imported — often several files away.
  Standalone components collapse that to "what does *this* component's own `imports` array say."
- Tree-shaking improves: a component only pulls in exactly what it lists.
- Lazy-loading a single component (`loadComponent`) instead of an entire feature module became
  trivial — no more "create a module just so I can lazy-load one component."

**HOW internally:** a standalone component's `imports` array is resolved by the Angular compiler
at compile time into the component's own local "module-like" scope — conceptually, the compiler
synthesizes an implicit module behind the scenes, but you never write or think about it.

**WHEN to use:** always, in any Angular 15+ project — this is now the default, recommended, and
in Angular 19+ the *only* implicit mode.

**WHEN NOT to use:** you'll only see NgModules in legacy (pre-Angular-14) codebases being
incrementally migrated. There's no reason to introduce a new NgModule in a modern project.

## 1.12 Modules vs. Standalone Components (comparison table)

| | NgModule-based | Standalone (this project) |
|---|---|---|
| Declares what a component can use | The enclosing `@NgModule`'s `declarations` + `imports` | The component's own `@Component({ imports })` |
| Bootstrapping | `platformBrowserDynamic().bootstrapModule(AppModule)` | `bootstrapApplication(RootComponent, appConfig)` |
| Lazy loading unit | A whole feature module (`loadChildren`) | A single component (`loadComponent`) or a route array (`loadChildren` returning `Routes`) |
| Root config | `AppModule`'s `providers` | `app.config.ts`'s `ApplicationConfig.providers` |
| Boilerplate for a new component | Create component + add to a module's `declarations` | Create component, done |
| Mental model | Two graphs (module graph + DI graph) to track | One graph (component's own imports = DI + template scope) |

## 1.13 Folder Structure (introduced here, detailed in Section 2)

```
src/app/
  core/       — singletons: guards, interceptors, app-wide services, cross-cutting models
  shared/     — reusable, presentational building blocks: components, pipes, directives
  features/   — one folder per business feature (dashboard, employees, tasks, projects, …)
  layout/     — the authenticated app shell: navbar, sidebar, footer
  utils/      — pure, stateless helper functions and TypeScript utility types
  environments/ — per-environment config (apiUrl, backendOrigin, …)
```

## 1.14 Angular CLI

**WHAT:** `ng` — the command-line tool that scaffolds, builds, serves, tests, and lints an Angular
project (`ng serve`, `ng build`, `ng generate component`, `ng test`).

**WHY it matters:** it enforces the exact same file/folder conventions across every Angular
project in the world, which is why any Angular developer can open this repository and immediately
know where to find a service (`*.service.ts`), a route file (`*.routes.ts`), or a model
(`*.model.ts`) without being told.

This project's `package.json` scripts are thin wrappers around the CLI:
```json
"scripts": {
  "ng": "ng",
  "start": "ng serve",
  "build": "ng build",
  "watch": "ng build --watch --configuration development",
  "test": "ng test"
}
```

## 1.15 Build Process (production)

`ng build` (production mode by default in modern CLI versions) runs:

1. **TypeScript compilation** — type-checks and transpiles `.ts` → `.js`.
2. **Angular Ivy AOT (Ahead-Of-Time) compilation** — every component's template is compiled into
   JavaScript *instruction* calls at build time (not parsed by a template engine in the browser at
   runtime). This is why Angular templates get real compile-time type checking (a typo like
   `{{ t.titel }}` is a build error, not a silent runtime `undefined`).
3. **Tree-shaking** — unused exports (e.g., an RxJS operator never imported, a component never
   referenced) are removed from the final bundle via `esbuild`/Rollup-style dead-code elimination.
4. **Bundling & code-splitting** — one "initial" bundle (everything needed for the first paint)
   plus one lazy chunk per `loadComponent`/`loadChildren` boundary. This project's own build output
   (from `ng build`) shows this concretely — chunks like `dashboard-component`,
   `task-detail-component`, `security-settings-component` each ship as separate lazy-loaded files,
   only downloaded when the user actually navigates there.
5. **Minification, hashing, and asset copying** into `dist/`.

---

# SECTION 2 — Project Architecture

## 2.1 Why This Project Is Organized This Way

This codebase follows **Feature-First (a.k.a. Feature-Sliced) Architecture**, explicitly mandated
by `CLAUDE.md`:

```
app/
    core/
    shared/
    features/
    layout/
    models/
    store/
    utils/
```

The alternative — **Layer-First** (`components/`, `services/`, `models/` as *top-level* folders,
with every feature's files interleaved inside each) — is what most beginner tutorials teach, and
it scales badly: adding "Payroll" to a layer-first project means touching `components/`,
`services/`, and `models/` all at once, and finding everything related to Payroll means grepping
across three unrelated folders. Feature-First flips this: `features/payroll/` contains
*everything* Payroll needs — its own `models/`, `services/`, `payroll-list/` component — so the
feature is self-contained, easy to delete, easy to lazy-load as one unit, and easy for a new
developer to onboard onto ("I'm working on Tasks" → open `features/tasks/`, done).

## 2.2 `core/` — Application-Wide Singletons

```
core/
  guards/          authGuard, roleGuard
  interceptors/    authInterceptor, errorInterceptor, tokenRefreshInterceptor, loggingInterceptor
  models/          auth.model.ts, api-response.model.ts, problem-details.model.ts
  services/        AuthService, LoggerService, ErrorHandlerService, TokenRefreshService
  utils/           permissions.util.ts, api-error.util.ts, auth-endpoints.ts
```

**Rule of thumb this project follows:** if it's a **singleton** that the *entire app* depends on
regardless of which feature is active — token storage, the HTTP interceptor pipeline, route
guards — it belongs in `core/`. Nothing in `core/` imports from `features/` (a one-way dependency
rule — features can depend on core, never the reverse). `AuthService`
(`core/services/auth.service.ts`) is the canonical example: it holds the access/refresh tokens and
the decoded `CurrentUserDto`, and is consumed by guards, interceptors, the navbar, and virtually
every feature — but it depends on nothing feature-specific itself.

## 2.3 `shared/` — Reusable, Presentational Building Blocks

```
shared/
  components/   button, input, card, pagination, modal, confirm-dialog, search-box,
                empty-state, loader, table, toast, avatar-crop-modal
  pipes/        date-format.pipe.ts, currency-format.pipe.ts
  directives/   highlight.directive.ts, has-role.directive.ts
```

**Rule of thumb:** if a piece of UI has **no knowledge of business logic** and could, in
principle, be copy-pasted into a completely different Angular project unmodified, it belongs in
`shared/`. `ModalComponent` (`shared/components/modal/modal.component.ts`) is a perfect example —
it knows nothing about tasks, employees, or projects; it just renders a Bootstrap modal shell
around whatever content is projected into it via `<ng-content>`. Contrast that with
`AvatarCropModalComponent` — also in `shared/` because *cropping an image before upload* is a
generic capability any future feature could reuse, even though today only Profile Settings uses
it.

**WHY separate `shared/` from `core/`:** `core/` is about *singleton services and cross-cutting
concerns*; `shared/` is about *reusable UI*. A `shared/` component can be instantiated many times
on a page (e.g., four `<app-stats-card>` instances); a `core/` service is instantiated once for
the whole app.

## 2.4 `features/` — One Folder Per Business Capability

```
features/
  dashboard/  employees/  projects/  tasks/  departments/  payroll/  reports/
  notifications/  settings/  search/  auth/
```

Each feature folder typically contains:
```
features/tasks/
  models/            task.model.ts, task-comment.model.ts, task-attachment.model.ts, task-time-log.model.ts
  services/          task.service.ts, task-comment.service.ts, task-attachment.service.ts, task-time-log.service.ts
  store/             task.store.ts                (signal-based state for the feature)
  task-list/         task-list.component.ts/.html
  task-detail/       task-detail.component.ts/.html
  task-form/         task-form.component.ts/.html
  task-board/        task-board.component.ts/.html  (Kanban view)
  task-comments/      task-comments.component.ts/.html
  task-attachments/   task-attachments.component.ts/.html
  tasks.routes.ts     (the feature's own lazy-loaded route table)
```

**WHY this internal shape:** it mirrors real backend REST resource boundaries (`/tasks`,
`/tasks/{id}/comments`, `/tasks/{id}/attachments`, `/tasks/{id}/time-logs` all live under
`features/tasks/`), and it means a feature can be **deleted or lazy-loaded as a single unit** —
`app.routes.ts` loads the entire feature via one dynamic `import()`:
```typescript
{
  path: 'tasks',
  loadChildren: () => import('./features/tasks/tasks.routes').then(r => r.TASK_ROUTES)
}
```

## 2.5 Services

Services in this project are layered by responsibility, not dumped into one giant
`api.service.ts`:

- **State services / stores** (`task.store.ts`, `project.store.ts`, `employee.store.ts`) — own
  signal-based in-memory state for a feature's list screens (search/filter/sort as `computed()`
  chains over a base signal).
- **API services** (`task.service.ts`, `project.service.ts`) — talk to `HttpClient`, know REST
  endpoint shapes, return `Observable<T>`. Contain zero UI logic.
- **Feature-specific "orchestration" services** (`AuthFeatureService` in `features/auth/services/`)
  — sit between the API layer and `AuthService` (the core token/session state holder), so every
  consumer of `AuthService` (guards, interceptors, the navbar) keeps working against the same
  low-level API regardless of how login/refresh/logout are actually implemented underneath.

See Section 6 for the full "why services exist" discussion.

## 2.6 Models / Interfaces

Every feature's `models/*.model.ts` file defines the TypeScript shape of the data that crosses the
network boundary — e.g. `task.model.ts` defines `Task`, `CreateTaskDto`, `UpdateTaskDto`,
`TaskStatus`, `TaskListFilter`. **This project draws a firm distinction between a raw backend DTO
and a UI-friendly shape** wherever they diverge — see `dashboard.model.ts`'s two-tier design:
`DashboardSummaryDto`/`DashboardStatsDto` (exactly what `GET /api/v1/dashboard` returns) vs.
`DashboardSummary`/`DashboardStats` (what the dashboard's presentational widgets actually consume)
— with `DashboardService` as the one place that adapts between them. This is the **Adapter
pattern**, and it means a backend contract change never ripples into every widget component that
displays the data.

## 2.7 Guards

`core/guards/auth.guard.ts` (`authGuard`) and `core/guards/role.guard.ts` (`roleGuard`) are
**functional route guards** (`CanActivateFn`) — plain functions, not classes, using `inject()`
(see Section 5.5). `authGuard` protects the entire authenticated shell; `roleGuard` reads
`route.data['roles']` and compares against the current user's role, redirecting to `/dashboard` if
disallowed. See Section 7.9 for the full mechanics.

## 2.8 Pipes

`shared/pipes/date-format.pipe.ts` and `currency-format.pipe.ts` — small, **pure** pipes (see
Section 12) used across many features so date/currency formatting stays consistent without every
component re-implementing `Intl.DateTimeFormat` calls by hand.

## 2.9 Directives

`shared/directives/has-role.directive.ts` — a **structural** directive for conditionally rendering
DOM based on the current user's role (an alternative to sprinkling `@if
(authService.getUserRole() === 'Admin')` everywhere). `highlight.directive.ts` — an **attribute**
directive. See Section 13 for the full directive taxonomy.

## 2.10 Routing Structure

`app.routes.ts` is the **root route table**. It has exactly three top-level entries, evaluated
top-to-bottom (first match wins, per Angular Router semantics):

```typescript
export const routes: Routes = [
  { path: 'auth', loadChildren: () => import('./features/auth/auth.routes').then(r => r.AUTH_ROUTES) },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then(c => c.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard',     loadChildren: () => import('./features/dashboard/dashboard.routes')...   },
      { path: 'employees',     loadChildren: () => import('./features/employees/employees.routes')...   },
      { path: 'projects',      loadChildren: () => import('./features/projects/projects.routes')...     },
      { path: 'tasks',         loadChildren: () => import('./features/tasks/tasks.routes')...            },
      { path: 'departments',   loadChildren: () => import('./features/departments/departments.routes')...},
      { path: 'payroll', canActivate: [roleGuard], data: { roles: ['Admin','HR'] },
        loadChildren: () => import('./features/payroll/payroll.routes')... },
      { path: 'reports',       loadChildren: () => import('./features/reports/reports.routes')...        },
      { path: 'notifications', loadChildren: () => import('./features/notifications/notifications.routes')...},
      { path: 'settings',      loadChildren: () => import('./features/settings/settings.routes')...      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'auth/login' }
];
```

Every `children` entry is itself lazily loaded (`loadChildren` returning a `Routes` array from
that feature's own `*.routes.ts` file) — a two-level lazy-loading structure: the **shell** loads
eagerly-ish (well, lazily too, via `loadComponent`) once authenticated, and each **feature**
underneath it loads only when actually navigated to. `settings.routes.ts` goes one level deeper
still — a **third** nested `<router-outlet>` inside `SettingsShellComponent` for
`/settings/profile`, `/settings/security`, etc. See Section 7 for the full routing story.

---

# SECTION 3 — Components

## 3.1 What a Component Is

**WHAT:** the fundamental UI building block in Angular — a TypeScript class decorated with
`@Component`, paired with a template (HTML) and optionally styles, that controls a patch of the
DOM.

**WHY:** components let you decompose a UI into small, independently testable, independently
reusable units, each owning its own state and rendering logic — the same reason every modern UI
framework (React, Vue, Angular) converged on a component model.

## 3.2 Anatomy: Selector, Template, Metadata

```typescript
@Component({
  selector: 'app-stats-card',        // ① how this component is invoked in a parent's template
  standalone: true,                  // ② no NgModule needed
  templateUrl: './stats-card.component.html',  // ③ the view
  changeDetection: ChangeDetectionStrategy.OnPush // ④ see Section 15
})
export class StatsCardComponent {
  readonly loading = input<boolean>(false);
  readonly label   = input<string>('');
  readonly value   = input<string | number>('');
}
```
(`src/app/features/dashboard/widgets/stats-card/stats-card.component.ts`)

- **Selector** — the custom HTML tag name a parent template uses to place this component:
  `<app-stats-card [label]="..." [value]="..." />`. Convention (enforced by this project's
  `.editorconfig`/CLI defaults): kebab-case, prefixed (`app-`) to avoid colliding with native or
  third-party elements.
- **Template** — either inline (`template: '...'`) or external (`templateUrl`). This project
  uses external `.html` files exclusively (better editor tooling: HTML syntax highlighting,
  Angular Language Service autocomplete).
- **Metadata** — everything inside the `@Component({...})` decorator: selector, template,
  styles, change detection strategy, and (for standalone components) `imports`.

## 3.3 Component Lifecycle ⭐⭐⭐⭐⭐

Every Angular component instance passes through a well-defined sequence of **lifecycle hooks** —
methods Angular calls automatically at specific points. You opt in by implementing the
corresponding TypeScript interface (purely for compile-time safety; Angular calls the method by
name regardless) and defining the method.

### Execution order (first-ever render of a component with inputs, a view, and content projection)

```
constructor()
     │
     ▼
ngOnChanges()      ← ONLY if the component has @Input()/input() bound values, called
     │                BEFORE ngOnInit, and again on every subsequent change to an input
     ▼
ngOnInit()         ← once, after the first ngOnChanges
     │
     ▼
ngDoCheck()        ← every change detection run, immediately after ngOnChanges/ngOnInit
     │
     ▼
ngAfterContentInit()  ← once, after content projected via <ng-content> has been initialized
     │
     ▼
ngAfterContentChecked() ← every CD run, after content is checked
     │
     ▼
ngAfterViewInit()   ← once, after the component's OWN view (and child views) is fully initialized
     │
     ▼
ngAfterViewChecked() ← every CD run, after the view is checked
     │
     ▼
   ... (ngDoCheck / ngAfterContentChecked / ngAfterViewChecked repeat every CD cycle) ...
     │
     ▼
ngOnDestroy()       ← once, right before Angular removes the component from the DOM
```

### `ngOnInit` — WHAT/WHY/HOW/WHEN

- **WHAT:** runs once, after Angular has set the component's `@Input()` properties for the first
  time.
- **WHY it exists separately from the constructor:** the constructor runs *before* Angular has had
  a chance to bind inputs — reading `this.someInput` inside a constructor may read `undefined`.
  `ngOnInit` guarantees inputs are set. It's also the conventional place to kick off the
  component's initial data fetch.
- **Project example:** `TaskDetailComponent.ngOnInit()` reads the route's `:id` param and calls
  `this.store.loadTaskById(this.taskId)` plus `this.loadTimeLogs()` — this couldn't safely happen
  in the constructor because (in this project's modern style) most initial-load calls actually
  *do* happen in the constructor via `inject()` field initializers when there's no route param
  dependency (see `DashboardComponent`'s constructor calling `loadDashboard()`/
  `loadEmployeeDashboard()` directly) — but wherever the initial call depends on
  `ActivatedRoute.snapshot.paramMap`, this project consistently uses `ngOnInit`, not the
  constructor, by convention for readability, even though `inject(ActivatedRoute)` would already
  be available in the constructor too.
- **Angular 22 modern style note:** with `inject()` available in field initializers, many
  "always run this on creation" tasks now happen directly in the constructor body instead of
  `ngOnInit` (see `dashboard.component.ts`'s extensive docblock on exactly this point) — `ngOnInit`
  is still fully valid, just no longer the *only* idiomatic place for initialization.

### `ngOnChanges` — WHAT/WHY/HOW/WHEN

- **WHAT:** called whenever a `@Input()`-bound value changes (including on first set, before
  `ngOnInit`). Receives a `SimpleChanges` object: `{ [inputName]: { currentValue, previousValue,
  firstChange } }`.
- **WHY:** lets a component react specifically to *which* input changed and to *what*, without
  manually diffing old vs. new — useful when a change to one input should trigger a side effect
  distinct from a change to another.
- **HOW internally:** Angular compares each bound input's value by reference (`===`) on every
  change detection pass; if different, it queues a call to `ngOnChanges` with the diff, before
  running the rest of that check cycle.
- **This project's usage:** none of the standalone components here implement `ngOnChanges`
  explicitly — they overwhelmingly use **signal inputs** (`input<T>()`) instead (see 3.9), which
  make "react when an input changes" a matter of reading the signal inside a `computed()` or
  `effect()`, which is simpler and doesn't need the `SimpleChanges` ceremony at all. This is a
  deliberate modern-Angular shift: `ngOnChanges` was the *only* answer to "did this input change"
  before signals; today, signal inputs make it largely unnecessary for new code.
- **WHEN to still use it:** components still using the older `@Input()` decorator (not signal
  inputs) — e.g., interop with a library, or when you need the *previous* value, not just the
  current one (signals don't expose "previous value" directly).

### `ngDoCheck` — WHAT/WHY/HOW/WHEN NOT

- **WHAT:** called on **every single change detection cycle**, for both `Default` and `OnPush`
  components (though for `OnPush`, it still only runs during cycles that were actually triggered
  for that component — see Section 15).
- **WHY it exists:** an escape hatch for detecting changes Angular's own reference-equality input
  check can't see — e.g., a mutation *inside* an object/array passed by reference (Angular's
  default input comparison is `===`, so mutating `task.tags.push('x')` without reassigning
  `task.tags` won't trigger `ngOnChanges`, but a custom `ngDoCheck` *could* deep-compare and catch
  it).
- **WHEN NOT to use it:** almost always avoid it. It runs on every CD cycle, for every instance —
  putting any nontrivial logic here is a classic **performance foot-gun** (interviewers love
  asking "why is `ngDoCheck` dangerous?" — the answer is exactly this: it runs far more often than
  you think, and anything expensive inside it multiplies across every change-detection pass).
  Prefer signals/`computed()`, which are lazy and memoized by design, over `ngDoCheck`.
- **This project's usage:** zero — consistent with the "avoid it, prefer signals" guidance above.

### `ngAfterContentInit` / `ngAfterContentChecked`

- **WHAT:** fire after content **projected into this component via `<ng-content>`** (from the
  parent) has been initialized/checked. Distinct from the component's *own* template.
- **WHY:** if a component needs to inspect or manipulate the projected content (e.g., via
  `@ContentChild`), it must wait until `ngAfterContentInit` — the projected content doesn't exist
  yet in the constructor or `ngOnInit`.
- **This project's usage:** `CardComponent`/`ModalComponent` use `<ng-content>` for content
  projection (see 3.11) but don't need `@ContentChild` introspection, so neither hook is
  implemented — a good example of "the hook exists for when you need it, most projection use
  cases don't."

### `ngAfterViewInit` / `ngAfterViewChecked`

- **WHAT:** fire after the component's own view — including all child components' views — has
  been fully initialized/checked.
- **WHY:** this is the *only* safe place to read `@ViewChild`-queried DOM elements or child
  component instances; before this hook, the view (and thus the queried element) may not exist
  yet.
- **Project example:** `TaskCommentsComponent` uses `@ViewChild('draftInput')
  draftInputRef?: ElementRef<HTMLTextAreaElement>` to imperatively refocus the comment textarea
  and set cursor position after inserting an `@mention` (`selectMention()` calls
  `textarea.focus(); textarea.setSelectionRange(...)`) — this only works because the view (and
  thus the `#draftInput` template reference) is guaranteed to exist by the time any user
  interaction (which happens well after `ngAfterViewInit`) can trigger it.

### `ngOnDestroy` — WHAT/WHY/HOW/WHEN ⭐⭐⭐⭐⭐

- **WHAT:** called once, immediately before Angular removes a component/directive from the DOM
  (route navigation away, `*ngIf`/`@if` becoming false, parent destroyed, etc.).
- **WHY it is critical:** this is where you **must** clean up anything that would otherwise keep
  the destroyed component alive in memory or keep firing callbacks against a component that no
  longer exists — the #1 cause of memory leaks in real Angular apps (see Section 10.9).
- **This project's usage:** `ShellComponent`'s constructor registers a `window.addEventListener`
  for resize, and explicitly tears it down: `this.destroyRef.onDestroy(() =>
  window.removeEventListener('resize', onResize))` — using **`DestroyRef.onDestroy()`**, the
  modern functional replacement for implementing the `OnDestroy` class interface (available since
  Angular 16, works in services too, not just components — `inject(DestroyRef)` anywhere in an
  injection context). Most other manual subscriptions in this codebase instead use
  `takeUntilDestroyed()` (see Section 10.9), which is built *on top of* `DestroyRef` internally —
  so `ngOnDestroy`/`DestroyRef.onDestroy` is the foundational mechanism, and
  `takeUntilDestroyed()` is sugar over it specifically for Observables.

## 3.4 Interview Diagram: "Draw the lifecycle order"

This exact question ("list Angular's lifecycle hooks in order, and explain when each runs") is one
of the single most common Angular interview questions at any experience level. Memorize this
mnemonic: **"Change, Init, Check, Content(Init,Check), View(Init,Check), Destroy"** — i.e.
`ngOnChanges → ngOnInit → ngDoCheck → ngAfterContentInit → ngAfterContentChecked →
ngAfterViewInit → ngAfterViewChecked → (repeat DoCheck/ContentChecked/ViewChecked) → ngOnDestroy`.

## 3.5 Component Communication — Parent → Child

**WHAT:** a parent passes data down into a child via property binding on the child's `@Input()`
(or signal `input()`).

```typescript
// Child: recent-tasks.component.ts
export class RecentTasksComponent {
  readonly tasks = input<RecentTask[]>([]);
}
```
```html
<!-- Parent: dashboard.component.html -->
<app-recent-tasks [tasks]="tasks()" />
```

**WHY one-directional (parent → child) is the default, not two-way, by design:** it makes data
flow predictable — a child never silently mutates a parent's state behind its back. If a child
*needs* to inform the parent of something, it does so explicitly via an `@Output()` event (next
section), which the parent's own code decides how to react to. This unidirectional flow is one of
Angular's (and React's, and Vue's) core architectural principles, precisely because bidirectional
implicit sync (as in AngularJS 1.x's `$scope` two-way binding) made large apps very hard to reason
about — you could no longer answer "who changed this value?" without tracing every binding.

## 3.6 Component Communication — Child → Parent (`@Output` / `output()`)

```typescript
// SidebarComponent
readonly closeRequested = output<void>();

close(): void {
  this.closeRequested.emit();
}
```
```html
<!-- ShellComponent's template -->
<app-sidebar (closeRequested)="closeOverlay()" />
```
(`src/app/layout/sidebar/sidebar.component.ts` + `shell.component.html`)

**WHAT:** `output<T>()` (the modern signal-era replacement for `@Output() foo = new
EventEmitter<T>()`) declares that a component can emit an event of type `T`; the parent listens
via `(eventName)="handler($event)"` event binding syntax.

**HOW internally:** `output()` is backed by an internal `Subject`-like primitive (not a full RxJS
`Subject` you can `.subscribe()` to arbitrarily — it exposes only `.emit()` to the component and a
`.subscribe()` used internally by the framework's own event-binding wiring). The old
`EventEmitter` *was* literally an RxJS `Subject` subclass; `output()` deliberately narrows the
public API so a component can't accidentally treat its own output as a general-purpose Observable
bus.

**Every `@Output`/`output()` in this project:**
- `NavbarComponent.menuToggled = output<void>()` — hamburger click bubbles up to `ShellComponent`.
- `SidebarComponent.closeRequested = output<void>()` — mobile backdrop-tap-to-close.
- `AvatarCropModalComponent.cropped = output<Blob>()` / `cancelled = output<void>()` — the crop
  modal reports back either a finished image or a cancellation; it has zero opinion on what
  happens next (`ProfileSettingsComponent` decides: upload the blob, or just close the modal).

**WHEN NOT to use `@Output`:** for state that many unrelated components across the tree need to
react to — that's what a shared service (often signal-based, see Section 11) is for. `@Output` is
specifically for "this direct child needs to tell its direct parent something," not a
general-purpose event bus.

## 3.7 `EventEmitter` vs. `output()`

| | `EventEmitter` (legacy) | `output()` (Angular 17.3+, used exclusively in this project) |
|---|---|---|
| Declaration | `@Output() foo = new EventEmitter<T>();` | `readonly foo = output<T>();` |
| Underlying type | Public RxJS `Subject` subclass | Framework-internal, not directly RxJS-subscribable by consumers |
| Can you `.pipe()` it? | Yes (it's an actual Observable) | No — by design, narrower API |
| Decorator needed | `@Output()` | None — `output()` is a plain function call |

## 3.8 `@ViewChild` / `@ContentChild`

- **`@ViewChild`** — query an element/component/directive that exists **in this component's own
  template**. Example: `TaskCommentsComponent`'s `@ViewChild('draftInput')
  draftInputRef?: ElementRef<HTMLTextAreaElement>` — `#draftInput` is a template reference
  variable declared in `task-comments.component.html`'s own markup, so `@ViewChild` finds it.
- **`@ContentChild`** — query an element/component/directive that was **projected into this
  component from its parent** via `<ng-content>`. This project doesn't use `@ContentChild`
  anywhere (its content-projecting components — `CardComponent`, `ModalComponent` — never need to
  introspect what was projected, only render it), but the distinction is a very common interview
  question: *"what's the difference between `@ViewChild` and `@ContentChild`?"* → ViewChild = "my
  own template," ContentChild = "content my parent gave me."
- **Modern signal equivalents:** `viewChild()`/`contentChild()` (Angular 17.3+) — same idea,
  return a `Signal<T | undefined>` instead of a decorated property populated imperatively by the
  framework. This project's `AvatarCropModalComponent` uses the older `@ViewChild('previewCanvas')`
  decorator form (chosen for direct familiarity/consistency with the rest of the codebase's
  established patterns at the time it was written), which is a perfectly valid, still-supported
  API — not deprecated, just not the newest option.

## 3.9 Signal Inputs — `input()` ⭐⭐⭐⭐⭐

Every component in this project that accepts data from a parent uses the modern **signal input**
API instead of the `@Input()` decorator:

```typescript
readonly employees = input<RecentEmployee[]>([]);   // optional, with default
readonly taskId     = input.required<number>();      // required — compile error if not bound
```

**WHY this replaced `@Input()`:**
- The value is a genuine `Signal<T>`, so it composes directly with `computed()`/`effect()` — no
  separate "wrap this input in a signal myself" step.
- `input.required<T>()` gives a **compile-time guarantee** the parent must bind it — the old
  `@Input()` had no equivalent (you could forget to bind a required input and only find out at
  runtime, or never, if it just silently stayed `undefined`).
- Reading it is explicit (`this.taskId()`) everywhere — template and class — which matches how
  every other reactive value in a signals-based codebase is read, removing the old inconsistency
  of "some values need `()`, some don't."

**HOW internally:** `input()` creates a special kind of writable-from-the-framework-only signal;
Angular's change detection updates it directly when the bound expression's value changes, and any
`computed()`/template expression reading it is automatically re-evaluated per the normal signal
dependency-tracking mechanism (see Section 11).

## 3.10 Smart vs. Dumb (Container vs. Presentational) Components ⭐⭐⭐⭐

This is one of the most load-bearing architectural patterns in the entire codebase, and it's
explicitly documented in `dashboard.component.ts`'s own docblock:

```
DashboardComponent        ← Smart (injects services, computes state, orchestrates)
    ↓ [employees]
RecentEmployeesComponent  ← Dumb (just renders a table, zero injected services)
    ↓ [projects]
RecentProjectsComponent   ← Dumb
    ↓ [tasks]
RecentTasksComponent      ← Dumb
    ↓ [actions]
QuickActionsComponent     ← Dumb
```

| | Smart / Container | Dumb / Presentational |
|---|---|---|
| Injects services? | Yes (`DashboardService`, `AuthService`, …) | No |
| Owns state? | Yes (signals, computed, effects) | No — receives everything via inputs |
| Knows about routes? | Sometimes | Rarely (`RecentEmployeesComponent` uses `RouterLink` purely for navigation, but has zero route *logic*) |
| Reusability | Low — tied to one page/feature | High — could render anywhere given the right inputs |
| Testability | Needs service mocks | Trivial — pass plain input data, assert rendered output |

**WHY this split matters (and is a favorite interview question — "how do you structure a complex
page?"):** presentational components are pure functions of their inputs — same input, same
render, every time — making them trivially unit-testable and reusable. Smart components
concentrate *all* the "how do I get this data / what happens when the user clicks this" logic in
one place per page, instead of scattering `HttpClient` calls across a dozen small components.

## 3.11 `ng-content` — Content Projection ⭐⭐⭐

**WHAT:** lets a parent pass **template markup** (not just data) into a child component, which
the child renders at a specific point in its own template via `<ng-content>`.

```typescript
// modal.component.html
<div class="modal-body pt-2">
  <ng-content></ng-content>                      <!-- default (unnamed) slot -->
</div>
<div class="modal-footer border-0 pt-0">
  <ng-content select="[modal-footer]"></ng-content>  <!-- named slot -->
</div>
```
```html
<!-- Usage: task-detail.component.html -->
<app-modal title="Log Time" size="sm" (closed)="closeLogTimeModal()">
  <form [formGroup]="logTimeForm">...</form>              <!-- goes into the default slot -->
  <div modal-footer class="d-flex gap-2">
    <button (click)="closeLogTimeModal()">Cancel</button>
    <button (click)="submitLogTime()">Save</button>       <!-- goes into the [modal-footer] slot -->
  </div>
</app-modal>
```

**WHY:** without content projection, `ModalComponent` would need an `@Input()` for every possible
piece of content it might ever show — an unbounded, unmaintainable API. Projection instead lets
the **parent** decide exactly what goes inside, while the **child** only owns the *chrome*
(backdrop, header, close button, footer layout) — the same "composition over configuration"
principle behind `<div>`/`<slot>` in web components generally.

**HOW `select="[modal-footer]"` works:** Angular matches projected content against each
`<ng-content>`'s `select` attribute using a CSS-selector-like syntax — here, `[modal-footer]`
matches any projected element carrying a `modal-footer` HTML attribute. Content that matches no
`select` falls through to the first `<ng-content>` with no `select` (the "default slot").

**WHEN to use:** any component whose job is to provide *layout/chrome* around arbitrary,
consumer-defined content (modals, cards, panels) — never for components whose content is always
one specific, known shape (use `@Input()`/`input()` for that instead — `StatsCardComponent` takes
`label`/`value`/`icon` as inputs, not projected content, because its content genuinely is fixed
data, not free-form markup).

## 3.12 Component Communication Summary Table

| Direction | Mechanism | Project Example |
|---|---|---|
| Parent → Child (data) | `input()` / `[prop]="expr"` | `[tasks]="tasks()"` into `RecentTasksComponent` |
| Child → Parent (event) | `output()` / `(event)="handler($event)"` | `(closeRequested)="closeOverlay()"` |
| Parent → Child (markup) | `<ng-content>` | `<app-modal>...</app-modal>` |
| Sibling ↔ Sibling | Shared service (often signal-based) | `AuthService.currentUser` read by both `NavbarComponent` and `SidebarComponent` |
| Ancestor ↔ Deep descendant | Shared service, or Router (`ActivatedRoute`/query params) | `?commentId=` query param read by `TaskDetailComponent`, passed down to `TaskCommentsComponent` |
| Child reaching into parent DOM/instance | `@ViewChild` (parent queries child) | never the other way — a child NEVER queries its parent |

---

# SECTION 4 — Templates

## 4.1 Interpolation

**WHAT:** `{{ expression }}` — embeds the string result of a template expression into text
content.

```html
<h4 class="fw-bold mb-1">{{ getGreeting() }}, <span class="text-primary">{{ authService.getUserName() }}</span></h4>
```
(`dashboard.component.html`)

**HOW internally:** the Ivy compiler turns `{{ expr }}` into an `ɵɵtextInterpolate` instruction
that re-evaluates `expr` and updates the text node **only if the value actually changed**
(reference/primitive equality) — not a naive re-render of the whole template on every check.

## 4.2 Property Binding

**WHAT:** `[property]="expression"` — binds a template expression to a DOM element **property**
(not an HTML *attribute* — an important distinction; see 4.2.1) or to a component's `@Input()`.

```html
<button [disabled]="loading()">...</button>
<app-stats-card [value]="stats()!.totalEmployees" [color]="'primary'" />
```

### 4.2.1 Property vs. Attribute — a classic interview trap

HTML *attributes* are what you write in markup; DOM *properties* are the live JavaScript object's
fields. They start in sync but can diverge (`<input value="a">`'s attribute never changes as the
user types, but the `.value` *property* does). `[disabled]="loading()"` binds to the **property**
— `button.disabled = true/false` — which is faster and type-correct (a boolean, not the string
`"true"`/`"false"` an attribute would force). This project's `dashboard.component.html` calls this
out explicitly in its own comments.

## 4.3 Event Binding

**WHAT:** `(event)="handler($event)"` — attaches a native DOM event listener (or a component's
custom `output()`).

```html
<button (click)="onRefresh()">Refresh</button>
<textarea (input)="onDraftInput($any($event.target))"></textarea>
```

`$event` is the native DOM event object (or the emitted value, for a custom `output()`).
`task-comments.component.html`'s `$any($event.target)` is a **type-cast escape hatch** — the
compiler can't statically know `$event.target` is specifically an `HTMLTextAreaElement`, so
`$any(...)` tells the Angular template type-checker to stop checking that expression's type (used
sparingly, only where TypeScript's DOM event typings are genuinely too generic to help).

## 4.4 Two-Way Binding

**WHAT:** `[(ngModel)]="value"` (template-driven forms) or, more generally, `[(prop)]="value"` for
any component exposing both a `prop` input and a `propChange` output — Angular's **banana-in-a-box**
syntax is pure sugar for `[prop]="value" (propChange)="value = $event"`.

**This project's stance:** `FormsModule`/`ngModel` is used sparingly (e.g., simple search boxes:
`task-list.component.ts`'s `searchTerm` bound via `[(ngModel)]` in a few list-filter contexts) —
the codebase's default for anything resembling a real form is **Reactive Forms** (Section 8), per
`CLAUDE.md`'s explicit instruction ("Use typed Reactive Forms"). Two-way binding is reserved for
small, throwaway local UI state, not data that needs validation or is submitted to a backend.

## 4.5 Template Reference Variables

**WHAT:** `#name` on an element, giving you a handle to that DOM element (or directive/component
instance) usable elsewhere **in the same template**.

```html
<textarea #draftInput ...></textarea>
<button (click)="fileInput.click()">Upload Photo</button>
<input #fileInput type="file" class="d-none" (change)="onAvatarSelected($event)" />
```
(`profile-settings.component.html`) — `#fileInput` lets the visible "Upload Photo" button
programmatically trigger the click on a hidden native `<input type="file">`, a very common pattern
for styling file inputs (native file inputs can't be styled directly, so you hide the real one and
proxy clicks to it from a styled button).

## 4.6 Structural Directives — `@if` / `@for` / `@switch` ⭐⭐⭐⭐⭐

**WHAT:** control-flow blocks that conditionally create/destroy or repeat chunks of DOM. Angular
17 introduced this **built-in control flow** syntax to replace the old structural directives
(`*ngIf`, `*ngFor`, `*ngSwitch`). This project uses the new syntax **exclusively** — there is not
a single `*ngIf`/`*ngFor` anywhere in the codebase.

```html
@if (loading()) {
  <app-loader />
} @else if (error()) {
  <div class="alert alert-danger">{{ error() }}</div>
} @else if (task(); as t) {
  <!-- t is now a narrowed, non-null local variable for this whole block -->
  <h2>{{ t.title }}</h2>
}

@for (task of tasks(); track task.id) {
  <li>{{ task.title }}</li>
} @empty {
  <li>No tasks yet.</li>
}

@switch (status) {
  @case ('Todo') { <span class="badge bg-secondary">To Do</span> }
  @case ('Done') { <span class="badge bg-success">Done</span> }
  @default { <span class="badge bg-light">Unknown</span> }
}
```

**WHY the new syntax replaced `*ngIf`/`*ngFor`:**
1. **No imports needed** — `*ngIf`/`*ngFor` required importing `CommonModule` (or `NgIf`/`NgFor`
   individually); `@if`/`@for` are parsed directly by the template compiler, zero imports.
2. **Mandatory `track` in `@for`** — the old `*ngFor` let you *forget* `trackBy`, silently
   defaulting to identity-based diffing that destroys/recreates every DOM node on any array
   change. `@for` **requires** a `track` expression at compile time — you cannot forget it. This
   alone prevents an entire category of performance bugs.
3. **Built-in `@empty`** — replaces the old `*ngIf="!items.length"` sibling-block workaround.
4. **Better type narrowing** — `@if (task(); as t)` narrows `t` to a non-nullable type for the
   *entire* block, which TypeScript's control-flow analysis understands natively (this project
   relies on exactly this in `task-detail.component.html`: `t.status`, `t.title`, etc. are all
   safely accessed with zero `!` non-null assertions *inside* the `@if` block, even though `task()`
   itself is typed `Task | undefined`).
5. **Compiles to more efficient instructions** than the old structural-directive machinery
   (`*ngIf`'s `<ng-template>`-based desugaring had more overhead per instance).

**`track` deep dive — WHY it matters:** without it, `@for` can't tell "item at index 3 changed" from
"item at index 3 is a brand new object" — it would have to destroy and recreate every DOM node for
every item whenever the array reference changes at all (e.g., after any `signal.update()` that
returns a new array, which is *every* update in this project's immutable-signal style — see
`TaskStore.updateTask()`: `this._tasks.update(list => list.map(t => t.id === updated.id ? updated
: t))`, a brand-new array every time). `track task.id` tells Angular "match old and new DOM nodes
by this stable identity," so only the one row that actually changed re-renders; every other `<li>`
is reused as-is. This project tracks by a stable numeric `id` everywhere real entity lists are
rendered (`track task.id`, `track project.id`, `track employee.id`) and by the value itself for
primitive lists (`track tag` for a `string[]` of tags, `track s` for a fixed `TaskStatus[]` of
status options).

**Performance implication (a very common interview question — "what happens if you track by
index instead of id?"):** `track $index` reintroduces the exact bug `track` was designed to
prevent — if the array is reordered/filtered, Angular matches by *position*, not identity, so an
item's DOM node (and any local UI state inside it, like an open dropdown or a text input's cursor
position) can get silently reassigned to a *different* underlying item. Always track by a stable,
unique identity — never by index — unless the list truly has no stable identity and never
reorders.

## 4.7 Attribute Directives

**WHAT:** directives that change the *appearance or behavior* of an existing element, without
adding/removing it from the DOM (contrast with structural directives, which do add/remove).
`shared/directives/highlight.directive.ts` is this project's example — it decorates an element
with a highlight style based on some condition, applied like a regular HTML attribute:
`<div appHighlight>`.

## 4.8 `ng-template` and `ng-container`

- **`ng-container`** — a purely logical grouping element that renders **nothing** to the DOM
  itself (no extra `<div>` wrapper) — useful when you need to apply a structural directive to a
  group of sibling elements without introducing an unwanted wrapping element that would break CSS
  (e.g., flex/grid layouts where an extra `<div>` would break `nth-child` selectors or grid
  placement).
- **`ng-template`** — defines a chunk of template that is **not rendered by default**; it's only
  rendered when explicitly instantiated (by a structural directive internally, or via
  `TemplateRef`/`ViewContainerRef` imperatively, or projected via `<ng-content>`'s named-slot
  variant, or via `@if`'s `@else` — internally, `@else { ... }` desugars conceptually to an
  `ng-template`-like deferred block). Modern `@if`/`@for`/`@switch` syntax means this project
  never needs to write `<ng-template>` directly — it's the compiler's implementation detail now,
  not something authors hand-write day to day, but understanding it explains *how* `@if`/`@for`
  achieve "don't render this until the condition is true" under the hood: conditionally rendered
  content is compiled into an embedded view created from a template definition, attached to (or
  detached from) the DOM as the condition changes, not just hidden via CSS.

## 4.9 Template Expressions — What's Allowed and What's Not

Template expressions are a **restricted subset** of JavaScript — no assignments (`=`), no `new`,
no bitwise operators, no chained expressions with `;`. This is intentional: templates should be
free of side effects, so Angular can safely re-evaluate an expression as many times as it wants
during a single change-detection pass without worrying it might, say, increment a counter each
time it's read. (`dashboard.component.html`'s `Math.min(...)`/`.toFixed(1)` calls work because
plain method calls on already-injected/exposed values are allowed — what's disallowed is
*mutating* state from within the template.)

## 4.10 Performance Implications of Template Choices

| Choice | Cost if done wrong |
|---|---|
| Missing/wrong `track` in `@for` | Full DOM node recreation on every array change instead of minimal diffing |
| Calling a method (not a signal/property) directly in a template, e.g. `{{ calculateTotal() }}` | Re-invoked on **every** change-detection pass, even `OnPush` ones that do run — expensive computation should be a `computed()` signal (memoized) instead, not a plain method call |
| Deeply nested `@if`/`@for` without `OnPush` | Every nested level gets re-checked on every parent CD pass |
| Not using `@empty` and instead layering a second `@if (!items.length)` block right after `@for` | Extra, redundant array-length check on every CD pass (minor, but `@empty` is free and clearer) |

---

# SECTION 5 — Dependency Injection

## 5.1 Why DI Exists

Without DI, a class that needs a collaborator creates it itself:
```typescript
class TaskListComponent {
  private taskService = new TaskService(new HttpClient(...));  // tightly coupled, hard to test
}
```
This hard-codes *which* implementation is used and makes unit testing painful (you can't swap in a
fake `TaskService` without changing `TaskListComponent`'s source). **Dependency Injection inverts
this**: a class *declares* what it needs (its dependencies), and an external system (the
**Injector**) is responsible for constructing and supplying them. This is the **Dependency
Inversion Principle** (the "D" in SOLID) made concrete as a framework feature.

```typescript
export class TaskListComponent {
  private readonly taskService = inject(TaskService);   // "give me a TaskService" — don't care how it's built
}
```

## 5.2 The Injector

**WHAT:** the runtime object that holds a registry of **providers** (recipes for how to construct
a given token/type) and resolves dependency graphs on demand.

**HOW Angular resolves a dependency internally (step by step):**
1. A class (component, service, guard, interceptor) asks for a token — either via `inject(Token)`
   or a constructor parameter typed with `Token`.
2. Angular looks at that class's own **injection context** — which Injector is "current" at the
   point of the request (this is the Injector Angular created for the component/directive/service
   instance being constructed, or, for a functional guard/interceptor, the Injector active
   because Angular runs it inside `runInInjectionContext`).
3. Angular checks: does *this* injector have a provider registered for the token? If yes, it
   either returns an already-created instance (if it's a singleton scope that's already been
   instantiated) or constructs one now (recursively resolving *its* dependencies the same way).
4. If not found, Angular walks **up** the injector hierarchy (see 5.4) to the parent injector, and
   repeats.
5. If the root injector (created at `bootstrapApplication`) has no provider either, Angular throws
   `NullInjectorError: No provider for X`.

## 5.3 Providers

**WHAT:** a "recipe" telling an injector how to produce a value for a token. Forms:
```typescript
{ provide: TaskService, useClass: TaskService }        // most common (usually shortened to just `TaskService`)
{ provide: API_URL,     useValue: 'https://api.x.com' } // a constant
{ provide: Logger,      useFactory: () => new Logger(inject(Env)) } // computed
{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputComponent), multi: true } // aliasing / multi-provider
```
The `NG_VALUE_ACCESSOR` pattern (used by this project's `shared/components/input/input.component.ts`
per `ENTERPRISE_REFACTORING_SUMMARY.md`) is how a custom component registers itself as a
`ControlValueAccessor` so Reactive Forms can bind to it exactly like a native `<input>` — `multi:
true` means *multiple* providers can be registered against the same token (Angular collects them
into an array) rather than the last one winning.

## 5.4 Hierarchical Injectors ⭐⭐⭐⭐

Angular's DI is **tree-shaped**, mirroring (mostly) the component tree:

```
Platform Injector (very rarely touched)
   └─ Root Injector (created at bootstrapApplication — appConfig.providers, providedIn:'root' services)
        └─ Route-level Injector (if a route/lazy-loaded config supplies its own `providers`)
             └─ Component Injector (created per component instance, if that component lists its own `providers`)
                  └─ Child Component Injector
                       └─ ...
```

A request for a dependency starts at the **requesting component's own injector** and walks
**upward** toward the root, stopping at the first injector that has a provider. This means:
- A service `providedIn: 'root'` is a **true app-wide singleton** — every component gets the same
  instance, because only the Root Injector has it registered.
- A service listed in a specific component's own `@Component({ providers: [...] })` gets a **new
  instance for every instance of that component** (and shared by all of *that* component's
  descendants) — this project doesn't use this pattern (every service here is `providedIn:
  'root'`), but it's a very common interview question: *"how would you get a fresh instance of a
  service per component instance instead of a global singleton?"* → put it in that component's own
  `providers` array.

## 5.5 `inject()` vs. Constructor Injection ⭐⭐⭐⭐⭐

```typescript
// Old style (still 100% valid)
export class TaskListComponent {
  constructor(private taskService: TaskService, private authService: AuthService) {}
}

// This project's style — inject() in field initializers
export class TaskListComponent {
  protected readonly store = inject(TaskStore);
  private readonly taskService = inject(TaskService);
  private readonly authService = inject(AuthService);
}
```

**WHY `inject()` (Angular 14+) and why this project uses it exclusively:**
- Works in **functional contexts** that have no constructor at all — guards
  (`export const authGuard: CanActivateFn = () => { const auth = inject(AuthService); ... }`),
  interceptors (`export const authInterceptor: HttpInterceptorFn = (req, next) => { const auth =
  inject(AuthService); ... }`), and route resolvers are all plain functions; constructor injection
  is structurally impossible there, so `inject()` had to exist for Angular to make guards/
  interceptors functional in the first place — this project's `auth.guard.ts`, `role.guard.ts`,
  and all four interceptors are functions using exactly this pattern.
- No need to repeat every dependency's type twice (once in the constructor parameter list, once
  implicitly as a class field) — `private readonly x = inject(X)` is one line.
- Reads top-to-bottom in class-field-declaration order, which many find easier to scan than a long
  constructor parameter list.
- Cleaner with many dependencies — no risk of constructor parameter lists wrapping awkwardly.

**HOW `inject()` works internally:** it reads from a thread-local-like "current injector" context
that Angular sets up while constructing a class (or while running a function via
`runInInjectionContext`). This is why `inject()` **does not work** inside `setTimeout` callbacks,
`.then()` callbacks, or plain event listener callbacks — by the time those run, the injection
context that was active during construction has been torn down. (Constructor injection has the
same fundamental limitation — you can't call `inject()`-equivalent logic outside construction
either — but this trips people up specifically with `inject()` because it *looks* like a normal
function call you could sprinkle anywhere.)

## 5.6 Singleton Services & `providedIn: 'root'` ⭐⭐⭐⭐⭐

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService { /* … */ }
```

**WHAT:** tells Angular's compiler to register this service with the **Root Injector**
automatically — you never need to list it in any `providers` array anywhere. The *first* time
anything injects it, Angular constructs one instance and reuses that exact instance for every
subsequent injection, app-wide, for the lifetime of the application.

**WHY `providedIn: 'root'` (vs. the old `NgModule.providers: [MyService]` pattern):**
- **Tree-shakable.** If nothing in the final bundle ever injects `AuthService`, the compiler can
  prove it's unused and drop it entirely. A service registered via an `NgModule`'s `providers`
  array is *always* included once that module is loaded, whether or not anything actually injects
  it — `providedIn: 'root'` ties the service's inclusion directly to whether it's *used*, not to
  whether some module happens to be imported.
- Every single service in this project uses `providedIn: 'root'` — `AuthService`, `TaskService`,
  `DashboardService`, `TaskStore`, `ConfirmDialogService`, all of them.

**Scopes summary:**

| `providedIn` value | Lifetime |
|---|---|
| `'root'` | One instance, app-wide, for the app's whole lifetime (this project's default for everything) |
| `'platform'` | Shared across multiple Angular apps on the same page (rare — micro-frontend scenarios) |
| A specific standalone component reference | New instance per lazy-loaded route boundary that uses it |
| (omitted) + listed in a component's own `providers` | New instance per component instance |

## 5.7 Why Store Services Feel Like "Global State" But Are Just DI

`TaskStore`, `ProjectStore`, `EmployeeStore` (`providedIn: 'root'`) hold signal-based in-memory
state. Because they're root-singletons, **every component that injects `TaskStore` shares the
exact same signals** — `TaskListComponent` and `TaskDetailComponent` both read from (and can both
write to, via `store.updateTask()`) the *same* underlying `_tasks` signal. This is why, in this
project, updating a task's status from `TaskDetailComponent`'s dropdown correctly and instantly
reflects everywhere else that reads the store — it's not "syncing" two copies of state, there was
only ever one copy, because DI gave every consumer the same singleton instance.

## 5.8 Angular DI vs. .NET DI — A Direct Comparison ⭐⭐⭐⭐

Since this project explicitly targets full-stack developers pairing with a .NET backend
(`CLAUDE.md`: "This frontend will later connect to a .NET 10 Web API"), this comparison is worth
knowing cold for an interview:

| | Angular DI | .NET (ASP.NET Core) DI |
|---|---|---|
| Registration | `@Injectable({ providedIn: 'root' })` (or explicit `providers: [...]`) | `services.AddSingleton<T>()` / `AddScoped<T>()` / `AddTransient<T>()` in `Program.cs` |
| Default lifetime | Singleton (`providedIn: 'root'`) unless scoped to a component | Must be **explicitly chosen** every time (Singleton/Scoped/Transient) |
| "Scoped" meaning | Scoped to an **injector** (component subtree, or lazy route) | Scoped to an **HTTP request** |
| Resolution | Hierarchical injector tree walk (component → parent → … → root) | Flat container, but child scopes (e.g. middleware pipeline) can override |
| How you ask for a dependency | `inject(Token)` or constructor param | Constructor param (there is no `inject()`-style function equivalent in typical ASP.NET Core DI) |
| Interface-based injection | Via injection *tokens* (`InjectionToken<T>`) since TS interfaces don't exist at runtime | Native — C# interfaces exist at runtime, register `services.AddScoped<IFoo, Foo>()` directly |
| Tree-shaking awareness | Yes — `providedIn: 'root'` lets unused services be dropped from the bundle | N/A — server-side, no "bundle size" concept |

**The single biggest conceptual gap** engineers moving between the two stacks hit: TypeScript
interfaces are **erased at compile time** — you cannot `inject(ITaskRepository)` the way you'd
`services.AddScoped<ITaskRepository, TaskRepository>()` in C#, because there's no `ITaskRepository`
object left at runtime to serve as a lookup key. Angular's answer is the **`InjectionToken`** — a
unique, runtime-real object created specifically to serve as a DI key when you want to depend on
an abstraction rather than a concrete class. This project doesn't need one anywhere (every service
here is injected by its own concrete class, e.g. `inject(TaskService)`, not through an interface
token), but knowing *why* `InjectionToken` exists — "TypeScript interfaces don't survive to
runtime, so you can't use one as a DI key the way you would a C# interface" — is a strong signal of
real understanding in an interview.

## 5.9 Common DI Interview Questions

- *"What happens if two different injectors in the hierarchy both provide the same token?"* → The
  **closest** injector to the requester wins; Angular never merges/overrides across levels for a
  single-value provider (multi-providers are the exception — they *do* collect across levels).
- *"Why can't you call `inject()` inside a `setTimeout`?"* → No active injection context at that
  point; capture what you need in a field *during* construction instead, or use
  `runInInjectionContext(injector, () => ...)` if you truly need to call `inject()` later, having
  captured the `Injector` itself (via `inject(Injector)`) earlier.
- *"What's the difference between `useClass` and `useExisting`?"* → `useClass` constructs a new
  instance of the given class; `useExisting` aliases an *already-registered* token to point at the
  same instance another token resolves to (no new construction).

---

# SECTION 6 — Services

## 6.1 Why Services Exist

A component's job is to **render UI and respond to user interaction** — not to know how to talk
to a REST API, not to own business rules that outlive a single page visit, not to duplicate
formatting logic five different ways across five different components. Services exist to hold
everything that *isn't* that:

- **Business logic** that has nothing to do with rendering (e.g., `permissions.util.ts`'s
  `canChangeTaskStatus()` — pure business rule, callable from any component that needs it).
- **The API layer** — every HTTP call in this app goes through a `*.service.ts`, never directly
  from a component.
- **State sharing** — a signal-based store service (`TaskStore`) is how multiple unrelated
  components (list, detail, board) see the same live data.
- **Utility logic** — cross-cutting helpers not tied to any one feature (`utils/functions.util.ts`'s
  `getInitials()`, used by both `DashboardService` and `ProfileMenuComponent`).

## 6.2 The API Layer Pattern (this project's convention)

Every feature has a thin `*.service.ts` whose only job is translating REST calls into typed
Observables:

```typescript
@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tasks`;

  getAll(projectId?: number): Observable<Task[]> {
    const filter: TaskListFilter = projectId ? { projectId } : {};
    return this.http.get<PagedResponse<Task>>(this.baseUrl, { params: buildParams(filter) })
      .pipe(map(res => res.data));
  }

  patchStatus(id: number, dto: PatchTaskStatusDto): Observable<Task> {
    return this.http.patch<ApiResponse<Task>>(`${this.baseUrl}/${id}/status`, dto)
      .pipe(map(res => res.data));
  }
}
```

**WHY this layer exists as a separate thing from the store:** `TaskService` knows *nothing* about
UI state (loading flags, current filters) — it's a pure "given these parameters, here's an
Observable of the response" translation layer, easily unit-testable by mocking `HttpClient`
alone. `TaskStore`, by contrast, *orchestrates* calls to `TaskService` and owns the resulting UI
state (loading/error/the filtered list). This separation means the same `TaskService` could be
reused by a completely different UI (a CLI tool, a different store implementation) without change.

## 6.3 State-Holding Services (Stores) ⭐⭐⭐⭐⭐

```typescript
@Injectable({ providedIn: 'root' })
export class TaskStore {
  private readonly _tasks   = signal<Task[]>([]);
  private readonly _loading = signal(false);
  readonly tasks   = this._tasks.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly filteredTasks = computed(() => { /* search + filter + sort chain over _tasks() */ });

  loadTasks(projectId?: number): void {
    this._loading.set(true);
    this.taskService.getAll(projectId).subscribe({
      next: tasks => { this._tasks.set(tasks); this._loading.set(false); }
    });
  }

  updateTask(updated: Task): void {
    this._tasks.update(list => list.map(t => t.id === updated.id ? updated : t));
  }
}
```

**The private-writable / public-readonly pattern** (used by every store in this project) is the
single most important convention to internalize: `_tasks` is a **private, writable** `signal()`;
`tasks` is a **public, readonly** view of it (`.asReadonly()`). Any component can *read*
`store.tasks()`, but **only the store itself** can call `.set()`/`.update()` on it. This is
encapsulation applied to state — exactly analogous to a private field + public getter in any OOP
language, and it prevents the classic bug where some far-away component mutates shared state
directly and nobody can figure out who changed it or when.

## 6.4 Service-to-Service Communication

Services can inject other services exactly like components do. `DashboardService` injects
`TaskService` and `ProjectService` (to build the employee-personalized dashboard from role-scoped
`GET /tasks`/`GET /projects` data, see `loadEmployeeDashboard()`); `AuthFeatureService` injects
`AuthService` (to write tokens after a successful login) and `TokenRefreshService` (to delegate
the actual refresh-token HTTP call, ensuring there's exactly **one** code path in the whole app
that ever calls `POST /auth/refresh` — a deliberate design choice documented directly in
`TokenRefreshService`'s comments to prevent a refresh-token-reuse race condition).

## 6.5 Best Practices (this project's conventions, made explicit)

1. **One HTTP-facing service per REST resource**, not one giant `ApiService` — `TaskService`,
   `TaskCommentService`, `TaskAttachmentService`, `TaskTimeLogService` are four separate services
   even though they're all "about tasks," because each maps to a distinct backend sub-resource.
2. **Services never import components.** Data flows from services → components, never the reverse
   — a service has no idea what UI is consuming it.
3. **Adapt at the service boundary, not in the component.** `DashboardService`'s
   `toDashboardSummary()`/`toRecentTask()` functions reshape raw backend DTOs into UI-friendly
   shapes *inside the service*, so every widget component downstream can stay blissfully unaware
   the backend's actual JSON shape is different from what they render.
4. **Every service is `providedIn: 'root'`** unless there's a specific, deliberate reason for a
   narrower scope (this project has no such case yet).
5. **Return Observables from services, subscribe in components/stores** — a service almost never
   calls `.subscribe()` on its own HTTP call; it returns the Observable and lets the *caller*
   decide when/how to subscribe (an exception: `NotificationBellComponent`'s polling merges
   multiple sources and subscribes internally, because polling *is* that component's own concern,
   not something a further caller needs to control).

---

# SECTION 7 — Routing

## 7.1 The Angular Router

**WHAT:** a client-side library that matches the browser's current URL against a configured route
table and swaps DOM content accordingly, without a full page reload (see 1.3).

**HOW it's wired up:** `provideRouter(routes, withPreloading(PreloadAllModules))` in
`app.config.ts` (see 1.8).

## 7.2 Route Configuration

A `Routes` array is a list of objects, each mapping a `path` to a component (or a nested `Routes`
array). This project's routes are split across many files — one `*.routes.ts` per feature — and
composed via `loadChildren` (see 2.10 for the full root table).

## 7.3 Lazy Loading vs. Eager Loading ⭐⭐⭐⭐⭐

**Eager loading:** the component/module ships in the **initial** bundle, downloaded before the app
even renders its first screen.

**Lazy loading:** the component/module's code is a **separate chunk**, only downloaded when the
router actually navigates to a route that needs it.

```typescript
{
  path: 'tasks',
  loadChildren: () => import('./features/tasks/tasks.routes').then(r => r.TASK_ROUTES)
}
```

**WHY lazy loading matters:** the initial bundle is what determines how long a user waits before
seeing *anything*. This project lazy-loads **every single feature** — Dashboard, Employees,
Projects, Tasks, Departments, Payroll, Reports, Notifications, Settings, even the entire
authenticated `ShellComponent` itself (`loadComponent` on the `''` route) — so someone who only
ever visits `/dashboard` never downloads the Payroll or Reports feature's code at all. Confirmed
directly in this project's own `ng build` output: `task-detail-component`, `security-settings-
component`, `dashboard-component` etc. each appear as separate "Lazy chunk files," not bundled
into the initial payload.

**`withPreloading(PreloadAllModules)` — a deliberate middle ground:** rather than *only* loading a
chunk the instant the user clicks a link (which can feel slow — click, then wait), this project
preloads every lazy chunk **in the background**, right after the initial route finishes rendering,
using idle browser time. The user gets a fast *first* paint (only the initial route's code loads
up front) but then near-instant subsequent navigations (everything else has already quietly
finished downloading by the time they click). The trade-off: more total bandwidth used even for
routes the user never visits — acceptable for an internal line-of-business app like this one,
possibly not for a public marketing site on mobile data.

## 7.4 Route Parameters vs. Query Parameters

- **Route parameter** (`:id`) — part of the URL *path*, identifies *which resource*:
  `/tasks/:id` → `/tasks/123`. Read via `route.snapshot.paramMap.get('id')`
  (`TaskDetailComponent.ngOnInit()`).
- **Query parameter** (`?key=value`) — optional, doesn't change *which* resource, just adds
  context/filters: `/tasks?projectId=5` (`TaskListComponent` reads this to pre-filter the list
  when arriving from a project's "View Tasks" quick action) and `/tasks/123?commentId=456` (this
  project's mention-notification deep link — `TaskDetailComponent` reads `commentId` to scroll to
  and highlight one specific comment, without it being a *different resource*, just extra
  navigation context).

## 7.5 Guards ⭐⭐⭐⭐⭐

**WHAT:** functions the Router calls **before** committing to a navigation, deciding whether it's
allowed to proceed.

### `CanActivate` (this project's `authGuard`, `roleGuard`)

```typescript
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  return router.createUrlTree(['/auth/login']);
};
```

**HOW it works internally:** the Router calls every guard on the matched route chain, in order,
**before** creating any component for that route. A guard returns `true` (proceed), `false` (abort
navigation silently), or a `UrlTree` (abort and redirect instead — the modern preferred pattern
over the older `router.navigate()` + `return false` combo, since a `UrlTree` is returned
synchronously as *the actual navigation result* rather than triggering a second, separate
navigation).

`roleGuard` demonstrates **coarse, route-level authorization**:
```typescript
export const roleGuard: CanActivateFn = (route) => {
  const requiredRoles: string[] = route.data['roles'] ?? [];
  const userRole = inject(AuthService).getUserRole();
  if (requiredRoles.length === 0 || requiredRoles.includes(userRole)) return true;
  return inject(Router).createUrlTree(['/dashboard']);
};
```
used as `{ path: 'payroll', data: { roles: ['Admin','HR'] }, canActivate: [roleGuard] }` — this
project's docblocks are explicit that route guards can only express **"can this role reach this
screen at all"**, not fine-grained **per-record** ownership (e.g. "is this Manager the actual
manager of *this specific* project") — that finer-grained check happens server-side (403 on the
actual API call) and, for UX purposes only, client-side via `permissions.util.ts`'s functions like
`canEditProject()` (see Section 17.6).

### `CanDeactivate`

**WHAT:** the mirror image of `CanActivate` — runs **before leaving** a route, most commonly to
warn about unsaved changes ("are you sure you want to leave without saving?"). This project
doesn't currently implement one (its `ConfirmDialogService.confirmLeave()` pre-built dialog exists
specifically anticipating this use case, per its docblock, but no route currently wires up a
`CanDeactivate` guard calling it — a good example of infrastructure built ahead of a feature that
hasn't been wired in yet).

### `CanMatch`

**WHAT:** newer than `CanActivate` — decides whether a route **definition** is even eligible to
match a URL at all, evaluated *before* Angular commits to that route over another candidate route
with the same path. Useful when you have two different route configs that could match the same
URL and want to pick between them based on a runtime condition (e.g., feature flags). This project
doesn't need it (no two routes share a path), but it's worth knowing the distinction for
interviews: `CanActivate` assumes the route already "won" the match and asks "are you allowed to
enter it"; `CanMatch` asks "should this route even be considered a candidate in the first place."

## 7.6 Navigation — `RouterLink` vs. `Router.navigate()`

- **`RouterLink`** (declarative, in templates) — `<a routerLink="/employees/create">`. Preferred
  for anything a user clicks — real `<a>` tags, so "open in new tab," middle-click, and keyboard
  navigation all work natively (`quick-actions.component.html`'s comment calls this out
  explicitly).
- **`Router.navigate()` / `Router.navigateByUrl()`** (imperative, in TypeScript) — used after an
  action completes, e.g. `TaskDetailComponent.onDelete()`: `this.router.navigate(['/tasks'])`
  after a successful delete, or `NotificationBellComponent.onNotificationClick()`:
  `this.router.navigateByUrl(notification.link)` when a notification is clicked (navigating to a
  URL that arrived as a *string* at runtime, not known at template-authoring time — exactly why
  the imperative form exists alongside the declarative one).

## 7.7 `ActivatedRoute`

**WHAT:** an injectable that gives the current component access to the *specific* route that
matched it — its params, query params, and any static `data`. `.snapshot` gives a one-time
read (used throughout this project for values that don't need to react to further in-page
navigation, e.g. `TaskDetailComponent`'s `commentId`/`id` reads); the reactive `.paramMap`/
`.queryParamMap` **Observables** are the alternative when a component needs to react to the *same*
route changing its params without being destroyed/recreated (e.g., navigating from `/tasks/1` to
`/tasks/2` directly — Angular reuses the component instance by default when only params change, so
`.snapshot` alone would show stale data on the second navigation; this project's detail components
mitigate this by not needing it — every detail-page navigation in practice comes from a fresh list
click, and the codebase's existing docblocks note this as a known, accepted simplification rather
than an oversight).

## 7.8 Nested Routes ⭐⭐⭐⭐

This project has **three levels** of `<router-outlet>**:
```
App's <router-outlet>              → ShellComponent (or the auth routes)
  ShellComponent's <router-outlet>  → whichever feature matched (DashboardComponent, TaskListComponent, …)
    SettingsShellComponent's <router-outlet> → ProfileSettingsComponent / SecuritySettingsComponent / …
```
`settings.routes.ts` demonstrates this: `SETTINGS_ROUTES` has its own `children` array
(`profile`, `security`, `preferences`, `notifications`, `general`), rendered inside
`SettingsShellComponent`'s own `<router-outlet>` — the settings tab bar stays visible while only
the inner content swaps, exactly the same pattern as the outer shell (navbar/sidebar stay, content
swaps) but one level deeper.

## 7.9 Route Order Matters

`{ path: 'create', ... }` is always declared **before** `{ path: ':id', ... }` in this project's
route arrays (`projects.routes.ts`, `departments.routes.ts`) — the Router matches top-to-bottom
and stops at the first match; if `:id` came first, navigating to `/projects/create` would match
`:id` (treating the literal string `"create"` as an id) and never reach the actual create-form
route. This is one of the most common Angular routing bugs, and a favorite interview question:
*"why does route order matter?"*

---

# SECTION 8 — Forms

## 8.1 Template-Driven vs. Reactive Forms

| | Template-Driven | Reactive (this project's default) |
|---|---|---|
| Form model lives in | The template (`[(ngModel)]`) | The component class (`FormGroup`) |
| Validation | Directives in the template (`required`, `minlength`) | Validator functions in the class |
| Type safety | Weak — the "model" is implicit, inferred from the template | Strong — `FormGroup<{...}>` is a real TypeScript type |
| Testability | Harder — need to render the template to test validation | Easy — construct/assert the `FormGroup` in isolation, no DOM needed |
| Dynamic forms (fields added/removed at runtime) | Awkward | Natural (`FormArray`, `addControl`) |
| This project's usage | A few simple search inputs via `ngModel` | Every real form: login, task/project/employee create-edit, all Settings screens, the Log Time modal |

`CLAUDE.md` mandates Reactive Forms explicitly ("Use typed Reactive Forms"), and the codebase
follows this consistently.

## 8.2 `FormGroup`, `FormControl`, `FormBuilder`

```typescript
protected readonly logTimeForm = this.fb.group({
  hours:       [0, [Validators.required, Validators.min(0), Validators.max(24)]],
  minutes:     [0, [Validators.required, Validators.min(0), Validators.max(59)]],
  description: ['', [Validators.required, Validators.maxLength(500)]]
}, { validators: atLeastSomeTime });
```
(`task-detail.component.ts`)

- **`FormControl`** — wraps a single value + its validation state (`valid`, `touched`, `errors`).
- **`FormGroup`** — a named collection of `FormControl`s (or nested `FormGroup`s/`FormArray`s),
  aggregating their validity (a `FormGroup` is invalid if *any* child control is invalid).
- **`FormBuilder`** (`inject(FormBuilder)`, aliased `fb`) — a convenience factory so you don't
  write `new FormGroup({ hours: new FormControl(0, [...]) })` by hand; `fb.group({...})` is
  equivalent but far less verbose, and (in modern Angular) infers a strongly-typed `FormGroup<T>`
  automatically from the initial values/validators you pass in.

## 8.3 `FormArray`

**WHAT:** a `FormGroup`-like collection, but for a **dynamic list** of controls (add/remove at
runtime) rather than a fixed, named set. This project doesn't currently need one (no form here has
a "repeat this group of fields N times" UI), but the concept is a common interview topic: *"how
would you build a form where the user can add/remove rows dynamically (e.g., multiple phone
numbers)?"* → `FormArray`, with `.push(this.fb.group({...}))` / `.removeAt(index)`, iterated in
the template via `@for (control of formArray.controls; track $index)`.

## 8.4 Validators — Built-in, Custom, Async

**Built-in:** `Validators.required`, `.min()`, `.max()`, `.minLength()`, `.maxLength()`,
`.email()`, `.pattern()` — used throughout (`profile-settings.component.ts`'s
`Validators.required` on `firstName`/`lastName`, `security-settings.component.ts`'s
`Validators.minLength(8)` on the new password).

**Custom — group-level (cross-field) validator:**
```typescript
function atLeastSomeTime(control: AbstractControl): ValidationErrors | null {
  const hours = Number(control.get('hours')?.value) || 0;
  const minutes = Number(control.get('minutes')?.value) || 0;
  return hours + minutes > 0 ? null : { noTimeLogged: true };
}
```
(`task-detail.component.ts`) — a validator is just a function `(control: AbstractControl) =>
ValidationErrors | null`. Returning `null` means valid; returning an object means invalid, keyed
by an arbitrary error name (`noTimeLogged`) the template checks: `logTimeForm.errors?.
['noTimeLogged']`. This one is attached at the **`FormGroup` level** (not a single control),
because "at least one of two sibling fields must be non-zero" is inherently a cross-field rule —
a single `FormControl`'s own validator can only see its own value.

**Async validators:** a validator returning an `Observable<ValidationErrors | null>` instead of a
synchronous value — the canonical use case is server-side uniqueness checks (e.g., "is this email
already taken?"). This project doesn't use one (email/username uniqueness is checked server-side
on submit instead, surfaced via the shared `ApiError`/field-error mapping — see `getFieldError()`
in `core/utils/api-error.util.ts`), but it's a common interview topic: async validators run
*after* all synchronous validators pass, and the control is marked `PENDING` while the async
check is in flight.

## 8.5 `valueChanges` / `statusChanges`

**WHAT:** every `AbstractControl` (control, group, or array) exposes `valueChanges` and
`statusChanges` as **Observables**, emitting every time the value/validity changes. This project's
`task-comments.component.ts` doesn't use a `FormControl` for the comment draft (it uses a plain
signal read via a native `(input)` event instead, for the specific reason that the `@mention`
autocomplete logic needs raw caret-position access a `FormControl`'s abstraction doesn't expose
directly) — but the *general* pattern (`form.get('search')!.valueChanges.pipe(debounceTime(300),
distinctUntilChanged())`) is exactly the shape `project-members.component.ts` uses for its member
search, just built on a plain RxJS `Subject` instead of a form control's built-in `valueChanges` —
worth knowing both approaches exist and achieve the same debounced-search result.

## 8.6 `patchValue` vs. `setValue` ⭐⭐⭐⭐

```typescript
this.form.patchValue(profile);          // profile-settings.component.ts — partial object is fine
this.form.setValue({ ... every key required ... });  // stricter — must supply ALL keys
```

**WHY this project uses `patchValue` almost everywhere:** `setValue()` throws at runtime if the
object you pass doesn't have **every single key** the `FormGroup` defines — brittle whenever the
source data (an API response) might have a slightly different shape or when you only want to
update *some* fields. `patchValue()` accepts a partial object and only updates the keys present,
silently leaving the rest untouched — exactly what `ngOnInit`'s "prefill from the JWT, then
override once the real profile loads" two-step pattern in `profile-settings.component.ts` needs
(the first `patchValue` sets `firstName`/`lastName`/`email` from the decoded token; the second,
later `patchValue` from the real `GET /users/me/profile` response overwrites those same fields
plus adds `phone`/`jobTitle`, which the JWT never had).

**When `setValue` is the right choice:** when you deliberately *want* the safety net of "if the
shape doesn't match exactly, fail loudly" — e.g. resetting a form to a known-complete default
object, as `preferences-settings.component.ts`'s `onResetDefaults()` does with `form.reset({...
all ten keys explicitly ...})` (technically `.reset()`, which behaves like `setValue` for
type-strictness purposes, not `.patchValue()`).

## 8.7 Enabling/Disabling Controls

```typescript
protected readonly form = this.fb.group({
  appName: [{ value: 'Employee Management System', disabled: !this.canEdit }, Validators.required],
  // ...
});
```
(`general-settings.component.ts`) — passing `{ value, disabled }` instead of a bare value disables
a control from creation. **WHY disable instead of just hiding the field or ignoring its value on
submit:** a disabled control (a) visually and semantically communicates "you can't edit this" to
the user via native browser disabled styling/behavior, (b) is **excluded** from `form.value` (only
`form.getRawValue()` includes disabled controls' values) — this project relies on exactly that
distinction: `general-settings.component.ts`'s `onSubmit()` uses `getRawValue()` specifically so a
non-Admin viewer's disabled-but-still-populated fields are included when read back, even though
they can't be edited.

## 8.8 A Complete Reactive Forms Interview Answer

*"Walk me through how Reactive Forms validation works end-to-end."* → A `FormControl` holds a
value and a list of `ValidatorFn`s. On every value change (user input, or programmatic
`setValue`/`patchValue`), Angular re-runs every validator against the current value, collects any
non-null results into the control's `.errors` object, and recomputes `.valid`/`.invalid`. A parent
`FormGroup`'s own validity is derived: invalid if *any* child is invalid (plus its own group-level
validators, like `atLeastSomeTime` above). The **template** doesn't drive any of this — it only
*reads* `.invalid`/`.touched`/`.errors` to decide whether to show an error message
(`logTimeForm.get('description')?.invalid && ...touched`) and calls `.markAllAsTouched()` on
submit-with-invalid-data specifically so validation messages that are normally hidden until a
field is blurred/touched become visible immediately (every form in this project does this exact
`if (form.invalid) { form.markAllAsTouched(); return; }` guard at the top of its submit handler).

---

# SECTION 9 — HTTP Communication

## 9.1 `HttpClient`

**WHAT:** Angular's built-in HTTP library (`@angular/common/http`), providing typed methods for
every HTTP verb, all returning **Observables**, not Promises.

```typescript
private readonly http = inject(HttpClient);

getAll(projectId?: number): Observable<Task[]> {
  return this.http.get<PagedResponse<Task>>(this.baseUrl, { params: buildParams(filter) })
    .pipe(map(res => res.data));
}
```

**HOW Angular fetches API data internally, end to end:**
1. `http.get<T>(url, options)` doesn't make the request immediately — it returns a **cold**
   Observable (see 10.4) that does nothing until subscribed.
2. When something subscribes (a component's `.subscribe({...})` call, or the Router/`async` pipe,
   or — in this project's case — a `TaskStore` method calling `.subscribe()` internally), Angular
   constructs an `HttpRequest` object and passes it into the **interceptor chain** (see Section
   18) — a sequence of functions, each able to inspect/modify the request, then call `next(req)`
   to pass it to the next link in the chain.
3. The **last** link in the chain is Angular's internal `HttpXhrBackend` (or `HttpFetchBackend`,
   depending on configuration), which actually performs the browser `XMLHttpRequest`/`fetch` call.
4. The browser sends the real network request; when a response arrives, it flows **back up**
   through the same interceptor chain in **reverse order** (each interceptor gets a chance to
   inspect/transform the *response* too, not just the request).
5. The Observable emits the parsed response body (already JSON-parsed, typed as `T`) and then
   **completes** — this is a crucial distinction from a raw `fetch()` Promise: an `HttpClient`
   Observable emits *and completes*, so subscribers know unambiguously "this call is done, no more
   values coming," which is exactly what lets operators like `switchMap` cleanly cancel/replace it
   (see 10.15).
6. If the server responds with a non-2xx status, the Observable instead emits an **error**
   (through `catchError`/the `error` callback), wrapped as an `HttpErrorResponse`.

## 9.2 Every HTTP Verb, With Project Examples

```typescript
// GET  — TaskService.getAll()
this.http.get<PagedResponse<Task>>(this.baseUrl, { params })

// POST — TaskCommentService.add() / AuthFeatureService.login()
this.http.post<ApiResponse<TaskCommentDto>>(url, { text, mentionedEmployeeIds })

// PUT  — ProjectService.update() (full replace)
this.http.put<ApiResponse<Project>>(`${baseUrl}/${id}`, dto)

// PATCH — TaskService.patchStatus() (partial update — only the status field)
this.http.patch<ApiResponse<Task>>(`${baseUrl}/${id}/status`, { status })

// DELETE — ProjectService.delete()
this.http.delete<void>(`${baseUrl}/${id}`)
```

**PUT vs. PATCH — a very common interview question:** `PUT` semantically means "replace this
resource entirely" (the caller must supply every field — `UpdateTaskDto extends CreateTaskDto`
plus `loggedHours`/`status`); `PATCH` means "apply this partial change" (only `{ status }` for a
Kanban drag — nothing else about the task needs to be resent). This project deliberately uses
`PATCH /tasks/{id}/status` for status changes specifically *because* sending a full `PUT` just to
change one field is wasteful and, in this codebase's real history, was the literal root cause of a
production bug (documented in `task-detail.component.ts`'s comments): the old "Log Time" feature
reused the full `PUT` endpoint (Admin/Manager-only server-side) to increment `loggedHours`, which
silently 403'd for any Employee — exactly the kind of bug a dedicated `PATCH`/`POST` sub-resource
endpoint (or in that case, an entirely new endpoint) avoids.

## 9.3 Typed Responses & the Generic `ApiResponse<T>` Envelope

```typescript
export interface ApiResponse<T> { data: T; message?: string; /* … */ }
export interface PagedResponse<T> extends ApiResponse<T[]> { totalCount: number; page: number; pageSize: number; }
```
(`core/models/api-response.model.ts`)

Every backend endpoint in this project wraps its real payload inside `{ data: ... }` (a common,
sensible backend convention — it leaves room to add envelope-level metadata like pagination info
or a message without breaking the payload's own shape). Every service in this codebase does the
exact same two-step dance: type the raw HTTP call as `Observable<ApiResponse<T>>`, then
`.pipe(map(res => res.data))` to unwrap it — so every service's **public** method signature is
just `Observable<T>`, and no component anywhere in the app needs to know the envelope exists.
This is the HTTP-layer equivalent of the Adapter pattern discussed in Section 2.6.

## 9.4 Error Handling, Retry, Timeout

**Error handling** in this project is centralized (see Section 19) rather than repeated in every
`.subscribe({ error: ... })` — `errorInterceptor` catches 403/404/409/423/500 globally and
surfaces a toast; components' own `error:` callbacks handle only what's genuinely
component-specific (e.g., `TaskDetailComponent`'s delete failure just resets a local `deleting`
signal so the button re-enables — the toast for *what* went wrong is already handled upstream).

**Retry** — RxJS's `retry()` operator (see 10.20) would resend a failed request N times
automatically. This project doesn't apply blanket retries (many of these calls are
non-idempotent — retrying a `POST /tasks/{id}/comments` on a network blip could double-post a
comment — so a blanket retry would be actively dangerous without also handling idempotency), but
understanding *when* retry is safe (idempotent GET/PUT/DELETE, not POST) is a strong interview
signal.

**Timeout** — RxJS's `timeout()` operator would error out a request that takes too long. Not
explicitly configured in this project (relies on the browser's own default XHR timeout behavior
and the backend's own responsiveness), but worth knowing the operator exists and where you'd add
it (in the shared `buildParams`/service layer, or as another functional interceptor).

## 9.5 Headers & Params

```typescript
function buildParams(filter: TaskListFilter): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(filter)) {
    if (value !== undefined && value !== null && value !== '') {
      params = params.set(key, String(value));
    }
  }
  return params;
}
```
(`task.service.ts`) — `HttpParams` is **immutable**: `.set()` returns a **new** `HttpParams`
instance rather than mutating the existing one (the same immutability discipline this codebase
applies to signals — see Section 11.2). Headers work identically (`HttpHeaders`, also immutable),
though this project sets its one cross-cutting header (`Authorization: Bearer <token>`) entirely
inside `authInterceptor`, not per-call — see Section 18.

---

# SECTION 10 — RxJS

## 10.1 Why RxJS, and Why Angular Chose It

Angular apps are fundamentally **event-driven and asynchronous**: HTTP responses arrive
asynchronously, user input happens asynchronously, timers fire asynchronously, and often you need
to *combine* several of these (e.g., "when the user stops typing for 300ms, cancel any in-flight
search and fire a new one"). Promises can express "one async value, eventually" but have no
built-in vocabulary for *cancellation*, *multiple values over time*, or *composing* many async
sources together. RxJS provides exactly that vocabulary — Angular's `HttpClient`, `Router` events,
reactive forms' `valueChanges`, and (historically) `EventEmitter` are all built on it.

## 10.2 Observable, Observer, Subscription — the Core Trio

- **Observable** — a *description* of a stream of values over time (0, 1, or many), plus how it
  eventually completes or errors. Creating one does **nothing** by itself — it's inert until
  subscribed (see 10.4, "cold").
- **Observer** — the object with `next`/`error`/`complete` callbacks that *reacts* to values the
  Observable produces. In this project, almost every `.subscribe({...})` call supplies a partial
  Observer (just `next` and `error`, rarely `complete` since HTTP Observables complete
  automatically and there's usually nothing extra to do at that exact moment).
- **Subscription** — the live, running connection created by calling `.subscribe()`. Holds a
  `.unsubscribe()` method to sever that connection early (stop future emissions, cancel any
  in-flight work the Observable was doing on your behalf, e.g. abort an in-flight XHR).

```typescript
this.taskService.getAll().subscribe({
  next: tasks => { this.allTasks.set(tasks); this.loading.set(false); },
  error: (err: Error) => { this.error.set(err.message); this.loading.set(false); }
});
```
(`task-board.component.ts`)

## 10.3 The `pipe()` Operator Chain

**WHAT:** `.pipe(op1, op2, op3)` composes multiple **operators** (pure functions that take an
Observable and return a new, transformed Observable) into a single readable chain, applied
left-to-right.

```typescript
this.projectService.getMembers(id)
  .pipe(map(members => members.some(m => m.id === empId)))
```

## 10.4 Cold vs. Hot Observables ⭐⭐⭐⭐

- **Cold:** the underlying work (the HTTP call, the timer) starts **fresh, independently, for each
  new subscriber**. `HttpClient` Observables are cold — this is precisely why forgetting to
  `.subscribe()` an HTTP call means the request is **never sent at all** (a classic beginner bug:
  building `const obs = http.get(...)` and never subscribing produces zero network activity —
  nothing "happens" until subscription).
- **Hot:** the underlying work happens **regardless of subscribers**, and subscribers just "tap
  into" whatever's currently playing — like a live radio broadcast. `Subject`s (10.5) are hot by
  nature; the Router's `router.events` stream (consumed in `ShellComponent`'s constructor via
  `this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(...)`) is hot — a
  late subscriber would simply miss any navigation events that already happened before it
  subscribed.

## 10.5 Subjects — `Subject`, `BehaviorSubject`, `ReplaySubject`, `AsyncSubject`

| Type | Behavior | Project usage |
|---|---|---|
| `Subject<T>` | Hot, multicasts values to current subscribers only; new subscribers get nothing from before they subscribed | `project-members.component.ts`'s `search$ = new Subject<string>()` — each keystroke pushes a new search term into the stream via `.next(value)` |
| `BehaviorSubject<T>` | Like `Subject`, but always holds a **current value**; new subscribers immediately receive the latest value on subscribe | Not used directly in this codebase — **signals have effectively replaced this role** (a `signal()` is conceptually a `BehaviorSubject` that's simpler to read (`sig()` vs `sub.value`/subscribing) and integrates natively with change detection — see Section 11.9) |
| `ReplaySubject<T>(n)` | Buffers the last `n` values, replays them to every new subscriber | Not used in this codebase |
| `AsyncSubject<T>` | Only emits the **final** value, and only once the source completes | Not used in this codebase |

**WHY `project-members.component.ts` uses a raw `Subject` instead of just calling
`employeeService.search(query)` directly on every keystroke:** a plain `Subject` is the on-ramp
into the `debounceTime`/`distinctUntilChanged`/`switchMap` pipeline (10.15) — you need *something*
Observable to push discrete "the user typed this" events into before you can apply time-based
operators to it; a template `(input)` event alone isn't an Observable.

## 10.6 Subscription Lifecycle & Why You Must Unsubscribe ⭐⭐⭐⭐⭐

**The core problem:** a `Subscription` keeps a live reference from the Observable's producer back
to your callback (`next`/`error`). If the component that created the subscription is destroyed
(route navigation away, `@if` becoming false) but the subscription is **never torn down**, two bad
things happen:
1. **Memory leak** — the destroyed component (and everything it closes over) can't be
   garbage-collected, because the still-running subscription holds a live reference to it.
2. **Zombie callbacks** — if the Observable eventually emits, your `next` callback still runs,
   potentially calling `.set()` on a signal belonging to a component instance that's no longer on
   screen — at best wasted work, at worst a subtle bug (e.g., navigating away from a list quickly,
   then a slow response from the *old* page silently updates state nobody's looking at, or worse,
   *interferes* with the new page if the store is shared).

**HTTP calls are usually "safe" by luck, not by design** — since they complete after one emission,
a single un-unsubscribed HTTP `.subscribe()` leaks only until that one response arrives (a small,
bounded leak), which is why beginners often don't notice the problem with simple HTTP calls. The
*real* danger is anything **long-lived or repeating**: `router.events`, a polling `interval()`, a
`FormGroup.valueChanges` stream that lives as long as the form does — these leak **forever** if
not cleaned up, because they never complete on their own.

## 10.7 `takeUntil` ⭐⭐⭐⭐

**WHAT:** an operator that unsubscribes from the source the moment a **second** ("notifier")
Observable emits.

```typescript
this.destroy$ = new Subject<void>();
someObservable$.pipe(takeUntil(this.destroy$)).subscribe(...);
// ...
ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
```

This is the **classic, pre-Angular-16** pattern for tying a subscription's lifetime to a
component's lifetime. This project doesn't use raw `takeUntil` anywhere — every long-lived
subscription instead uses the newer `takeUntilDestroyed()` (next section), which is `takeUntil`
specialized to Angular's own `DestroyRef`, removing the boilerplate of manually managing a
`destroy$` Subject and remembering to `.next()`/`.complete()` it in `ngOnDestroy`. Knowing
*both* is important for interviews — `takeUntilDestroyed()` is what you write in new Angular 16+
code, but `takeUntil(destroy$)` is what you'll see in the vast majority of existing/legacy Angular
codebases, and understanding one explains the other.

## 10.8 `take`, `first`

- **`take(n)`** — completes the Observable after exactly `n` emissions.
- **`first()`** (optionally with a predicate) — completes after the *first* emission (matching the
  predicate, if given), erroring if the source completes with no matching emission first
  (`first(predicate, defaultValue)` avoids that error by supplying a fallback).

Neither appears explicitly in this codebase (HTTP Observables already complete after one
emission, so wrapping them in `take(1)` would be redundant), but both are extremely common
interview questions, often paired with: *"what's the difference between `take(1)` and `first()`
for an Observable that might complete with zero emissions?"* → `take(1)` completes silently with
no emissions if the source completes empty; `first()` (with no default) **errors**
(`EmptyError`) in that same case.

## 10.9 `takeUntilDestroyed()` ⭐⭐⭐⭐⭐

```typescript
this.notificationService.getUnreadCount()
  ... .pipe(startWith(0), switchMap(...), takeUntilDestroyed())
  .subscribe(count => this.unreadCount.set(count));
```
(`notification-bell.component.ts`)

```typescript
this.http.get<ApiResponse<DashboardSummaryDto>>(this.baseUrl)
  .pipe(takeUntilDestroyed(this.destroyRef))
  .subscribe({ ... });
```
(`dashboard.service.ts`) — note the **explicit `this.destroyRef`** argument here: `DashboardService`
is a `providedIn: 'root'` singleton, not a component, so calling `takeUntilDestroyed()` with no
argument (which relies on an *ambient* injection context, only available during a component's/
directive's own construction) would throw — a service must inject its own `DestroyRef` explicitly
and pass it in.

**WHY this exists:** it's `takeUntil` (10.7) with the "notifier" wired automatically to the
current component/directive's destruction (via `DestroyRef`, see 3.3's `ngOnDestroy` discussion) —
no manual `destroy$` Subject, no manual `ngOnDestroy` boilerplate. This project uses it everywhere
a subscription needs to outlive a single emission but must not outlive its owning
component/service.

## 10.10 `switchMap` ⭐⭐⭐⭐⭐

**WHAT:** maps each source emission to a **new inner Observable**, subscribing to it — and
**cancels/unsubscribes the previous inner Observable** the instant a new source emission arrives.

```typescript
merge(interval(POLL_INTERVAL_MS), windowFocus$)
  .pipe(startWith(0), switchMap(() => this.notificationService.getUnreadCount()), takeUntilDestroyed())
  .subscribe(count => this.unreadCount.set(count));
```
(`notification-bell.component.ts`) — every poll tick (or window focus event) triggers a *new*
`getUnreadCount()` call; if a previous call is still in flight when the next tick fires,
`switchMap` cancels it (the HTTP request is aborted client-side) rather than letting two responses
race and potentially resolve out of order.

```typescript
this.search$.pipe(
  debounceTime(300), distinctUntilChanged(),
  switchMap(query => query.trim() ? this.employeeService.search(query) : [])
).subscribe(results => { /* … */ });
```
(`project-members.component.ts`) — the canonical **typeahead search** pattern: if the user types
another character before the previous search's response arrives, `switchMap` throws away the stale
in-flight request and starts a fresh one for the latest query, so the results the user eventually
sees always match what they *most recently* typed, never a stale, out-of-order response.

**WHEN to use `switchMap`:** whenever a *newer* request should always supersede an older one —
search-as-you-type, "reload this resource" buttons, anything where an in-flight older request's
result would just be wasted/wrong if it arrived after a newer one. **WHEN NOT to use it:** for
sequences where you need **every** inner Observable to actually complete (e.g., submitting a form
— you don't want a rapid double-click to *cancel* the first submission mid-flight and leave the
backend in an ambiguous state; `exhaustMap`, 10.13, is the right tool there instead).

## 10.11 `mergeMap` (a.k.a. `flatMap`)

**WHAT:** maps each source emission to an inner Observable, subscribing to **all** of them
**concurrently**, merging their emissions as they arrive (no cancellation, no queuing — everything
runs in parallel).

Not used directly in this codebase (no scenario here needs "fire N independent requests from a
stream of triggers, let them all run in parallel and merge results as they land"), but a common
interview comparison target against `switchMap`/`concatMap`/`exhaustMap` — see the comparison
table in 10.14.

## 10.12 `concatMap`

**WHAT:** maps each source emission to an inner Observable, but subscribes to them **one at a
time, in order** — the next inner Observable only starts once the previous one completes.

Not used directly in this codebase, but the right tool whenever **order matters and nothing
should be dropped or run concurrently** — e.g., a queue of sequential save operations that must
each finish before the next starts.

## 10.13 `exhaustMap`

**WHAT:** maps each source emission to an inner Observable, but **ignores new source emissions
entirely while a previous inner Observable is still running** (the opposite instinct from
`switchMap`, which cancels the old one instead).

The **canonical use case** — and a very common interview question — is a **submit button**: you
want a second click *while the first submission is still in flight* to be **ignored**, not
cancel-and-restart (`switchMap` would be wrong here — it could abandon a submission that already
reached the server) and not queued-and-resent (`concatMap` would double-submit). This project
achieves the same *outcome* through explicit signal guards instead of `exhaustMap` — every submit
handler in the codebase follows the pattern `if (this.saving()) return;` at the top (e.g.
`TaskDetailComponent.submitLogTime()`: `if (!t || this.loggingTime() || this.logTimeForm.invalid)
{ ... return; }`), which is functionally equivalent to `exhaustMap`'s ignore-while-busy behavior,
just expressed imperatively with a boolean signal + `[disabled]` binding rather than an RxJS
operator. Knowing **both** ways to solve the same problem — and being able to explain the
trade-off (`exhaustMap` is more "RxJS-idiomatic" for a pure event-stream pipeline; the signal-guard
approach is simpler to reason about when the rest of the component is already signal-based, as
every component in this project is) — is exactly the kind of judgment a 2–3 year interview probes
for.

## 10.14 `switchMap` vs `mergeMap` vs `concatMap` vs `exhaustMap` — Comparison Table ⭐⭐⭐⭐⭐

| Operator | New inner subscription while one is active | Use case | Project analogy |
|---|---|---|---|
| `switchMap` | **Cancels** the old, switches to the new | Search-as-you-type, "always want the latest" | `project-members.component.ts` search, `notification-bell.component.ts` polling |
| `mergeMap` | Runs **both concurrently** | Independent parallel work, order doesn't matter | (not used here) |
| `concatMap` | **Queues** — waits for the old to finish first | Order-sensitive sequential work | (not used here) |
| `exhaustMap` | **Ignores** the new until the old finishes | Prevent double-submit | Achieved via `saving()`/`loggingTime()` boolean-signal guards instead, throughout this codebase |

## 10.15 `forkJoin` ⭐⭐⭐⭐

**WHAT:** takes multiple Observables, waits for **all of them to complete**, then emits **once**
with an array/object of their final values (like `Promise.all`, but for Observables).

```typescript
forkJoin([this.taskService.getAll(), this.projectService.getAll()])
  .pipe(takeUntilDestroyed(this.destroyRef))
  .subscribe({
    next: ([tasks, projects]) => { /* build the personalized employee dashboard from both */ }
  });
```
(`dashboard.service.ts`'s `loadEmployeeDashboard()`) — two independent, unrelated API calls
(role-scoped tasks and role-scoped projects) both need to finish before the combined,
employee-personalized dashboard summary can be built; `forkJoin` is exactly "run these in
parallel, give me both results together once they're both done."

**WHEN NOT to use `forkJoin`:** if any one of the inner Observables never completes (e.g., a
`Subject` that just keeps emitting, or an Observable you expect to emit multiple values over
time), `forkJoin` **never emits at all** — a very common gotcha. `forkJoin` is specifically for
"a fixed number of one-shot async operations," not general stream combination.

## 10.16 `combineLatest`

**WHAT:** subscribes to multiple Observables and re-emits a combined array/object **every time any
one of them emits**, once all of them have emitted at least once.

Not directly used in this codebase, but the natural interview counterpart to `forkJoin`: *"when
would you use `combineLatest` instead of `forkJoin`?"* → when you need the **latest** value from
each of several **ongoing** streams every time any one changes (e.g., combining a search-term
stream with a filter-dropdown stream to re-run a search whenever *either* changes), not "wait for
N one-shot things to all finish once."

## 10.17 `zip`

**WHAT:** pairs up emissions **by index** across multiple Observables — the *n*-th emission of the
combined stream uses the *n*-th emission from each source, waiting for the slowest source's *n*-th
value before emitting. Rarely needed in typical CRUD-app work (this codebase has no use for it);
mentioned here because interviewers sometimes ask you to distinguish it from `combineLatest`
(index-paired vs. always-latest).

## 10.18 `withLatestFrom`

**WHAT:** on every emission from the **primary** source, combines it with the **most recent**
value from one or more **secondary** sources (secondary emissions alone don't trigger anything —
only the primary source drives emissions). A common real use: "on every click of this button, grab
the current value of that other stream too." Not used in this codebase.

## 10.19 `shareReplay` ⭐⭐⭐⭐⭐

**WHAT:** multicasts a source Observable to multiple subscribers, **replaying** the last `n`
(commonly 1) emissions to any subscriber that arrives *after* the value was produced — turns a
cold Observable "hot-ish" and prevents the same expensive source operation (e.g., an HTTP call)
from being re-triggered independently by every new subscriber.

**This project's real, production-grade use case — single-flight token refresh
(`core/services/token-refresh.service.ts`):**

```typescript
private refreshInFlight$: Observable<TokenResponseDto> | null = null;

refreshAccessToken(): Observable<TokenResponseDto> {
  if (this.refreshInFlight$) {
    return this.refreshInFlight$;             // ride along on the SAME in-flight refresh
  }
  this.refreshInFlight$ = this.http.post<ApiResponse<TokenResponseDto>>(`${this.baseUrl}/refresh`, { refreshToken })
    .pipe(
      map(res => res.data),
      tap(tokens => this.authService.setTokens(tokens.accessToken, tokens.refreshToken)),
      shareReplay(1),                          // multicast the ONE real HTTP call to every concurrent caller
      finalize(() => { this.refreshInFlight$ = null; })  // next 401 after this settles starts a FRESH refresh
    );
  return this.refreshInFlight$;
}
```

**The exact bug this solves:** the backend **rotates** refresh tokens — every successful
`/auth/refresh` call revokes the token just used and issues a new one; presenting an
already-used refresh token twice is treated as theft and revokes the whole session. If two widgets
both 401 at nearly the same moment (their access token expired while both were mid-request), a
**naive** interceptor would fire **two independent** `POST /auth/refresh` calls with the same
still-valid-at-that-instant refresh token — the first rotates it, the second (now presenting an
already-used token) gets rejected as reuse, and the user is force-logged-out for no real reason.
`shareReplay(1)` fixes this by ensuring **every** concurrent 401 handler that calls
`refreshAccessToken()` while a refresh is already in flight receives the **exact same Observable**
— one real HTTP call, multicast to all of them — instead of each independently subscribing and
triggering its own separate request. `finalize()` (10.21) then clears the cached Observable once
that one attempt settles (success or failure), so the *next* 401, sometime later, correctly starts
a brand-new refresh rather than replaying a now-stale one forever.

**How this relates to the signal-store caching discussed elsewhere in this codebase:** `TaskStore`/
`ProjectStore` achieve a *similar-feeling* "don't refetch, share what we already have" outcome, but
via a completely different mechanism — a signal holding the **already-resolved** value, not an
Observable multicasting an **in-flight** request. `shareReplay` specifically solves the "multiple
callers, at the same moment, need to share one *pending* async operation" problem — which a plain
signal, on its own, can't express (a signal has no concept of "currently loading, please wait for
the value that's about to arrive," only "here is the value right now"). This project's stores side-
step that specific problem by exposing an explicit `loading` signal alongside the data — a
different, complementary solution to a closely related need.

## 10.20 `debounceTime`, `distinctUntilChanged` ⭐⭐⭐⭐⭐

```typescript
this.search$.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(query => query.trim() ? this.employeeService.search(query) : [])
)
```
(`project-members.component.ts`)

- **`debounceTime(ms)`** — waits for a **pause** of `ms` milliseconds of *silence* on the source
  before emitting the most recent value (discarding everything emitted during the pause window).
  Prevents firing a search request on literally every keystroke.
- **`distinctUntilChanged()`** — suppresses an emission if it's identical (by default, `===`) to
  the immediately preceding one. Prevents, e.g., re-searching for the exact same term twice in a
  row (typing a character then immediately backspacing it, landing back on the same string).

**WHY both together, not just one:** `debounceTime` alone would still re-fire if the user pauses,
types the *same* thing they already searched, and pauses again; `distinctUntilChanged` alone would
still fire on every keystroke (it only compares consecutive values, doesn't wait for a pause).
Combined, they express "wait until the user stops typing, and only then, only if the result
actually changed."

## 10.21 `tap`, `map`, `filter`, `catchError`, `finalize`

- **`map`** — transform each emitted value (pure, synchronous). Used in essentially every service
  in this codebase to unwrap `ApiResponse<T>` → `T` (see 9.3).
- **`filter`** — drop emissions that don't match a predicate. `shell.component.ts`:
  `this.router.events.pipe(filter(e => e instanceof NavigationEnd))` — the Router's `events`
  stream emits *many* different event types per navigation (`NavigationStart`, `RoutesRecognized`,
  `NavigationEnd`, etc.); `filter` narrows it to just the one this component cares about.
- **`tap`** — perform a **side effect** without transforming the emitted value (logging,
  analytics, imperatively syncing something outside the stream). `AuthFeatureService.login()`:
  `tap(tokens => this.authService.setTokens(tokens.accessToken, tokens.refreshToken))` — storing
  the tokens is a side effect that shouldn't change what value flows downstream to the next
  operator in the chain.
- **`catchError`** — intercept an error and either recover (return a **new** Observable, e.g. a
  fallback value) or re-throw a transformed error. This project's `errorInterceptor` uses
  `catchError` at the HTTP-interceptor level (see Section 18/19) rather than scattering it across
  every individual service call, so error-to-toast mapping lives in exactly one place.
- **`finalize`** — runs a callback when the Observable completes **or** errors — the RxJS
  equivalent of a `finally` block. `token-refresh.service.ts` uses it precisely for this "no
  matter how this settles, clean up" guarantee: `finalize(() => { this.refreshInFlight$ = null;
  })` — the cached in-flight refresh Observable (10.19) must be cleared whether the refresh
  **succeeded** or **failed**, or the next 401 would either replay a stale success forever or get
  stuck permanently reusing a failed attempt. Most *other* `.subscribe({next, error})` call sites
  in this codebase instead set a loading signal to `false` in **both** the `next` and `error`
  callbacks individually — functionally identical to `finalize`, just written twice; a good "how
  would you simplify this" interview answer is exactly "replace the duplicated
  `loading.set(false)` in both callbacks with a single `.pipe(finalize(() =>
  this.loading.set(false)))` before the `.subscribe()` — `token-refresh.service.ts` already does
  exactly this for its own cleanup need."

## 10.22 `startWith`, `merge`, `interval` — Polling Pattern

```typescript
merge(
  interval(POLL_INTERVAL_MS),
  new Observable<void>(sub => {
    const handler = () => sub.next();
    window.addEventListener('focus', handler);
    return () => window.removeEventListener('focus', handler);
  })
).pipe(startWith(0), switchMap(() => this.notificationService.getUnreadCount()), takeUntilDestroyed())
 .subscribe(count => this.unreadCount.set(count));
```
(`notification-bell.component.ts`) — a genuinely instructive real-world RxJS composition:
- **`interval(ms)`** emits an incrementing number every `ms` milliseconds, forever (until
  unsubscribed) — the polling timer.
- The second Observable is a **custom Observable built from scratch** with `new Observable(sub =>
  {...})` — it wires a native `window.addEventListener('focus', ...)` listener and calls
  `sub.next()` every time the window regains focus, returning a **teardown function** (the
  function returned from the subscriber callback is RxJS's contract for "how do I clean this up
  when unsubscribed" — here, that's exactly `removeEventListener`).
- **`merge(...)`** combines both into one stream: "either a timer tick OR a window-focus event
  should trigger a re-check."
- **`startWith(0)`** makes the combined stream emit **immediately** on subscribe (rather than
  waiting for the *first* timer tick, which could be up to `POLL_INTERVAL_MS` away) — so the
  unread count loads right away, then again on the normal poll/focus cadence.
- **`switchMap`** then turns each of those trigger-ticks into an actual `getUnreadCount()` HTTP
  call, cancelling any still-in-flight previous check if a new trigger fires first.
- **`takeUntilDestroyed()`** ties the whole thing to the component's lifetime, so the polling timer
  and the focus listener both stop the instant the navbar (and its bell) is destroyed — without
  this, the `setInterval`-backed `interval()` and the `addEventListener` would both run **forever**,
  a textbook memory/resource leak (see 10.6).

## 10.23 Real-World Interview Questions on This Section

- *"What's the difference between a cold and a hot Observable, and why does it matter for
  `HttpClient`?"* → see 10.4; the practical consequence is "an un-subscribed HTTP call never
  fires."
- *"How would you implement a debounced search that cancels stale in-flight requests?"* → walk
  through `project-members.component.ts`'s exact `debounceTime` → `distinctUntilChanged` →
  `switchMap` chain.
- *"Your component subscribes to an Observable in `ngOnInit` but never unsubscribes — what's the
  actual, concrete consequence?"* → answer with the two distinct failure modes from 10.6 (memory
  leak vs. zombie callbacks), not just "it's bad practice."
- *"Why would you choose `exhaustMap` over `switchMap` for a form submit button?"* → 10.13's
  submit-button example, and be ready to explain why this project solves the same problem with a
  boolean signal guard instead.
- *"What does `forkJoin` do if one of its inner Observables never completes?"* → it never emits at
  all — a very commonly-missed gotcha.

---

# SECTION 11 — State Management & Signals

## 11.1 The Three Levels of State in This Project

1. **Component-local state** — belongs to one component instance, never shared. E.g.
   `DashboardComponent.activityFeedOpen = signal(false)` — "is this component's own activity
   panel expanded" has no meaning to any other component, so it lives right on the component, not
   in a service.
2. **Feature-scoped shared state (Stores)** — `TaskStore`, `ProjectStore`, `EmployeeStore` — shared
   across every component *within* a feature (list, detail, board) but not meaningfully needed
   outside it.
3. **App-wide state** — `AuthService.currentUser`/`isAuthenticated` — needed by guards,
   interceptors, the navbar, and virtually every feature; lives in `core/`.

**WHY not one giant global store (like a single NgRx store) for everything:** for an app this
shape (CRUD-heavy, feature-siloed, no deeply cross-cutting real-time state), a single monolithic
store adds indirection (actions, reducers, selectors) without buying much — every one of this
project's stores already gets "single source of truth," "encapsulated mutation," and "reactive
reads" for free from signals, without any of NgRx's boilerplate. See 11.10 for when a heavier tool
*would* be the right call.

## 11.2 `signal()`, `WritableSignal`, Immutability ⭐⭐⭐⭐⭐

**WHAT:** `signal(initialValue)` creates a **reactive container for a single value**. Reading it
(`mySignal()`) both returns the current value *and*, if called during a `computed()`/`effect()`/
template evaluation, registers that caller as a **dependent** — so the signal system knows exactly
who needs to be notified when the value changes.

```typescript
private readonly _tasks = signal<Task[]>([]);
```

**WRITING** — three ways:
```typescript
this._tasks.set(newArray);                                   // replace entirely
this._tasks.update(list => list.map(t => t.id === id ? updated : t)); // derive from current value
this._loading.update(v => !v);                                // toggle
```

**WHY this codebase never mutates arrays/objects in place** (never `list.push(x)`, always
`.update(list => [...list, x])` or `.map()`/`.filter()` returning a **new** array): signals detect
changes by comparing the **new value to the old one** (by default, `Object.is` — reference
equality for objects/arrays). Mutating an array in place (`.push`) doesn't change its *reference*,
so the signal would never notice anything changed at all, and nothing would re-render — a subtle,
common bug. Every store in this project (`TaskStore.updateTask()`, `ProjectStore`, `EmployeeStore`)
consistently returns brand-new arrays from every `.update()` call for exactly this reason.

## 11.3 `computed()` ⭐⭐⭐⭐⭐

**WHAT:** a **derived**, **read-only**, **lazily-evaluated**, **memoized** signal — its value is
calculated from other signals by a pure function.

```typescript
protected readonly hasData = computed(() => this.dashService.summary() !== null || this.dashService.employeeSummary() !== null);
protected readonly stats   = computed(() => this.dashService.summary()?.stats);
```
(`dashboard.component.ts`)

- **LAZY:** the function passed to `computed()` doesn't run at creation time, and doesn't run
  again just because a dependency changed — it only (re-)runs the **next time something actually
  reads** the computed signal. If nothing ever reads `hasData()`, its factory function never runs
  at all, no matter how many times `dashService.summary()` changes underneath it.
- **MEMOIZED:** if none of its tracked dependencies have changed since the last read, `computed()`
  returns the **cached** value instantly, without re-running the function — even if it's read from
  five different places in the same render, the underlying computation only runs once per actual
  change.
- **TRACKED automatically:** you never declare a computed signal's dependencies explicitly (unlike,
  say, a React `useMemo`'s dependency array) — Angular's signal runtime watches exactly which
  signals were **read** during the last execution of the function and subscribes to precisely
  those, no more, no less. If a `computed()`'s function has an `if` branch that sometimes reads
  signal A and sometimes reads signal B, its dependency set can even change dynamically between
  runs.

**WHY `computed()` over a plain method call for the same logic (`stats(): DashboardStats { return
... }`, called as `{{ stats() }}` in the template):** a plain method is **re-invoked on every
single change-detection check**, regardless of whether its inputs changed — `computed()` is
invoked **only when a dependency actually changed AND something reads it**. For anything even
mildly expensive, this is a real, measurable performance difference, not just style — and it's a
very common Angular interview question: *"what's the difference between calling a method vs. a
computed signal in a template?"*

## 11.4 `effect()` ⭐⭐⭐⭐

**WHAT:** a function that re-runs **automatically** whenever any signal it reads changes, *purely
for side effects* (not for producing a value other code depends on).

```typescript
constructor() {
  effect(() => {
    const summary = this.dashService.summary();
    if (summary) {
      console.log(`[Dashboard] Loaded — employees: ${summary.stats.totalEmployees}, ...`);
    }
  });
}
```
(`dashboard.component.ts`)

**WHEN to use `effect()`:** logging/analytics, syncing a signal's value to `localStorage`,
triggering imperative third-party APIs (a chart library, a map widget) that have no signal-native
integration. **WHEN NOT to use it (a very common interview trap):**
- **Never derive a value inside an `effect()` that other code needs to read** — that's exactly
  what `computed()` is for. An `effect()` that does `this.someOtherSignal.set(...)` based on
  reading a different signal is a **smell** — it creates an implicit, indirect dependency chain
  that's harder to trace than an explicit `computed()`. Angular will even throw at runtime if an
  effect writes to a signal it *also reads*, specifically to prevent infinite loops (unless you
  explicitly opt in via `{ allowSignalWrites: true }`, a strong signal something unusual is going
  on).
- This project's effects are **exclusively used for logging/diagnostics** (`dashboard.component.ts`
  has three: logging on successful load (admin path), logging on successful load (employee path),
  and logging on error) — never for deriving app state, exactly matching the guidance above.

**HOW it runs internally:** like `computed()`, an effect auto-tracks whatever signals it reads
during its last execution. Unlike `computed()`, it's **eager** in the sense that it runs once
immediately upon creation (during the constructor, in an injection context) and then again,
**asynchronously** (batched via a microtask, after Angular has finished processing the current
round of signal writes — not synchronously inside the `.set()` call itself), every time a tracked
dependency changes.

## 11.5 Signal Inputs — Recap and Extension

Covered in depth in 3.9. Additional detail: `input<T>(defaultValue)` vs. `input.required<T>()` —
the required variant produces a **compile-time error** if a template using that component doesn't
bind it, which is strictly stronger than the old `@Input() foo!: T` (definite-assignment
assertion) pattern, which only ever gave you a runtime `undefined` if forgotten, never a build
failure. `TaskAttachmentsComponent.taskId = input.required<number>()` and
`TaskCommentsComponent.taskId`/`projectId = input.required<number>()` are both examples — these
components are *meaningless* without those ids, so making the binding mandatory at compile time is
strictly better than hoping every call site remembers.

## 11.6 Signal-Based Store Pattern — The Full Picture ⭐⭐⭐⭐⭐

```typescript
@Injectable({ providedIn: 'root' })
export class TaskStore {
  private readonly _tasks         = signal<Task[]>([]);
  private readonly _loading       = signal(false);
  private readonly _searchQuery   = signal('');
  private readonly _statusFilter  = signal<TaskStatus | 'All'>('All');

  readonly tasks   = this._tasks.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly filteredTasks = computed(() => {
    let result = this._tasks();
    const query = this._searchQuery().toLowerCase();
    if (query) result = result.filter(t => t.title.toLowerCase().includes(query));
    if (this._statusFilter() !== 'All') result = result.filter(t => t.status === this._statusFilter());
    return result;
  });

  loadTasks(projectId?: number): void {
    this._loading.set(true);
    this.taskService.getAll(projectId).subscribe({
      next: tasks => { this._tasks.set(tasks); this._loading.set(false); }
    });
  }

  setSearchQuery(query: string): void { this._searchQuery.set(query); }
  updateTask(updated: Task): void {
    this._tasks.update(list => list.map(t => t.id === updated.id ? updated : t));
  }
}
```

**Every element of this pattern, explained:**
- **Private writable, public readonly** (see 6.3) — encapsulation.
- **One `computed()` chain does search + filter + sort in a single reactive pipeline** —
  `filteredTasks` automatically re-derives whenever `_tasks`, `_searchQuery`, or `_statusFilter`
  changes, and **nothing else needs to manually call "re-filter now"** — that's the entire point
  of a reactive dependency graph over an imperative one.
- **Actions are plain methods** (`loadTasks`, `setSearchQuery`, `updateTask`) — not "dispatched
  actions" through a reducer (contrast with Redux/NgRx) — a component just calls
  `store.setSearchQuery(value)` directly.
- **Singleton via `providedIn: 'root'`** (Section 5.6/5.7) is what makes this "shared state" at
  all — every component injecting `TaskStore` gets the exact same signals.

## 11.7 Signal vs. RxJS Observable — The Core Comparison ⭐⭐⭐⭐⭐

| | Signal | Observable |
|---|---|---|
| Always has a current value? | Yes — reading it (`sig()`) is synchronous and always returns *something* right now | Not necessarily — you must subscribe to receive values, and there may be no "current" value until the first emission |
| How you read it | Call it: `sig()` | Subscribe: `.subscribe(v => ...)`, or via `async` pipe in a template |
| Composition | `computed()` (synchronous, pure derivations) | `.pipe(operators)` (huge operator vocabulary — async, time-based, cancellation, retries, etc.) |
| Cancellation / async orchestration | Not built for this — signals hold *values*, not asynchronous *processes* | This is RxJS's whole reason for existing — `switchMap`, `debounceTime`, `takeUntil`, etc. |
| Multiple values over time from one "subscription" | N/A — a signal is a value slot, updated by whoever calls `.set()`; there's no single ongoing "stream" to multiple values | Core design — an Observable *is* a stream of values over time |
| Change detection integration | Native — Angular's renderer tracks signal reads directly | Needs the `async` pipe (auto subscribe/unsubscribe) or manual subscription + manual signal/property update |
| Error channel | None built in — you handle errors wherever you produce the value | Built in (`error` callback / `catchError`) |

**WHEN to use each (and how this project actually draws the line):** **HTTP calls, timers,
DOM/browser events, and anything inherently asynchronous-over-time** are modeled as Observables
(`HttpClient`, `router.events`, the notification poll). **The *result* of that asynchronous work,
once it lands, is stored in a signal** (`this._tasks.set(tasks)` inside an HTTP `.subscribe()`
callback) so the rest of the app can read it synchronously and reactively without needing to know
or care that it originally came from an async source. This project's entire architecture is this
one sentence, repeated everywhere: **RxJS gets data in; signals hold and distribute it once it's
here.**

## 11.8 `WritableSignal` vs. `Signal` (readonly) — the TypeScript Types

`signal<T>(initial)` returns a `WritableSignal<T>` (has `.set()`/`.update()`/`.asReadonly()`).
`.asReadonly()` returns a plain `Signal<T>` — callable (`sig()`) but with no mutating methods at
all, which is what makes the private-writable/public-readonly pattern (11.6) actually
*type-safe*, not just a naming convention: a consumer holding only the public `tasks: Signal<Task[]>`
genuinely **cannot** call `.set()` on it — TypeScript itself rejects the attempt at compile time.

## 11.9 Signals Replaced Most of `BehaviorSubject`'s Historical Role

Before Angular Signals (Angular 16+), the *idiomatic* way to build exactly the store pattern in
11.6 was a `BehaviorSubject<T>` per piece of state, exposed as `.asObservable()`, read in templates
via the `async` pipe. Signals are a strict ergonomic upgrade for this specific use case: no `async`
pipe subscription management needed in templates, no need to remember `BehaviorSubject` always
needs an *initial* value (a very common footgun — a plain `Subject` has no "current value" concept
at all, so using one for state that should always have a "current" reading was itself already a
common bug source), and composition via `computed()` is simpler to write and reason about than
`combineLatest([...]).pipe(map(...))` chains. RxJS Subjects remain the right tool for genuinely
*event-stream* scenarios (10.5), not "state with a current value" scenarios — which is exactly the
distinction 11.7's table draws.

## 11.10 When a Heavier State Management Library (NgRx/Akita) *Would* Be Justified

Even though this project doesn't need one, a strong interview answer explains *when you would*
reach for something heavier than "signals + services": genuinely complex, deeply cross-cutting
state with non-trivial history/undo requirements, a need for time-travel debugging across a large
team, or state transitions that themselves need to be testable/replayable as discrete, named
events independent of any UI. For a CRUD-shaped, feature-siloed app like this one, that complexity
isn't present, and introducing it would be exactly the kind of premature abstraction `CLAUDE.md`
itself warns against ("Never generate unnecessary code").

---

# SECTION 12 — Pipes

## 12.1 Built-in Pipes

`DatePipe` (`{{ date | date:'h:mm a' }}` in `dashboard.component.html`) is the only Angular
built-in pipe imported anywhere in this codebase — most other formatting (see below) is done via
**custom** pipes or plain `Intl` calls instead, a deliberate choice explained in 12.4.

## 12.2 Custom Pipes

```typescript
@Pipe({ name: 'dateFormat', standalone: true })
export class DateFormatPipe implements PipeTransform {
  private readonly formatOptions: Record<'short'|'medium'|'long', Intl.DateTimeFormatOptions> = { /* … */ };
  transform(value: string | Date | null | undefined, format: 'short'|'medium'|'long' = 'medium'): string {
    if (!value) return '—';
    return new Intl.DateTimeFormat('en-US', this.formatOptions[format]).format(new Date(value));
  }
}
```
(`shared/pipes/date-format.pipe.ts`), used as `{{ t.dueDate | dateFormat:'medium' }}`
(`task-detail.component.html`). `shared/pipes/currency-format.pipe.ts` follows the identical shape
for money values.

**WHAT a pipe is:** a class with a `transform(value, ...args)` method, registered under a `name`
used in templates via the `|` syntax. **WHY use one instead of a component method:** a pipe is
*declaratively* reusable across any template (`{{ x | dateFormat }}` anywhere), and — critically —
**pure pipes are memoized by Angular's change detection** in a way a plain method call in a
template is not (see 12.3).

## 12.3 Pure vs. Impure Pipes ⭐⭐⭐⭐

- **Pure** (the default — `@Pipe({ name: '...', pure: true })`, or simply omitted since `true` is
  the default): Angular only re-runs `transform()` when the **input reference** changes (primitive
  value change, or a *new* object/array reference — not a mutation of the same object/array).
  Extremely cheap to leave in a template because it's essentially memoized exactly like
  `computed()` (11.3) is.
- **Impure** (`{ pure: false }`): re-runs on **every single change-detection cycle**, regardless of
  whether the input actually changed — necessary only for pipes whose output can change without
  the input reference changing (e.g., a pipe that reads `Date.now()` internally, or one that needs
  to observe mutations inside an array Angular's default equality check wouldn't catch). Both
  pipes in this project are pure (the default) — appropriate, since date/currency formatting is a
  pure function of its input value.

**Interview trap:** *"Why is Angular's built-in `AsyncPipe` special — is it pure or impure?"* → It
must be **impure**, because its whole job is to emit new values over time from the *same*
Observable/Promise *reference* — a pure pipe would never re-run once given the same input
reference, so `async` couldn't possibly work if it were pure.

## 12.4 WHY This Project Prefers Custom Pipes/`Intl` Over Extra Built-ins

`recent-employees.component.ts`'s `formatDate()` deliberately uses `Intl.DateTimeFormat` as a
**plain class method** rather than importing `DatePipe`, with an explicit comment: *"avoid
importing DatePipe as a dependency — Intl is built into every modern browser (ES2015+), zero
bundle cost."* This is a nuanced, defensible trade-off worth understanding for interviews: a
built-in pipe still costs *some* bundle size/import surface, and for a **dumb/presentational**
component (3.10) that already has zero injected services, adding an `imports: [DatePipe]` purely
for one date format is arguably more overhead than a three-line private method. This is not
"pipes are bad" — it's "match the tool to the component's own stated design goal (zero
dependencies)."

## 12.5 Performance & When to Use a Pipe vs. a Computed Signal

For values derived from **signals**, prefer `computed()` (11.3) — it's the natively
signal-integrated, memoized equivalent. Pipes remain the right tool specifically for
**template-only, presentation-focused transforms** applied inline to a value you're already
displaying (formatting a date/currency at the point of interpolation) — using a pipe there is more
concise than defining a dedicated `computed()` signal for every single formatted field on a page.

---

# SECTION 13 — Directives

## 13.1 The Three Categories

| Category | Job | Examples |
|---|---|---|
| **Component** | A directive *with* a template — everything in Section 3 is technically a directive subtype | `TaskDetailComponent`, `NavbarComponent` |
| **Structural** | Adds/removes DOM based on a condition — historically prefixed `*`, now mostly superseded by `@if`/`@for`/`@switch` (Section 4.6) | `HasRoleDirective` (`shared/directives/has-role.directive.ts`) |
| **Attribute** | Changes the appearance/behavior of an *existing* element without adding/removing it | `HighlightDirective` (`shared/directives/highlight.directive.ts`) |

## 13.2 Custom Structural Directive — `HasRoleDirective`

**WHAT it does conceptually:** an alternative to `@if (authService.getUserRole() === 'Admin')`
sprinkled through every template — instead, `*appHasRole="'Admin'"` (or the modern `@if`-block
equivalent form) reads more declaratively at the call site and centralizes the role-check logic in
one directive instead of repeating `authService.getUserRole() === X` across dozens of templates.

**HOW a structural directive works internally:** it injects `TemplateRef<unknown>` (a reference to
the `<ng-template>` the structural-directive syntax implicitly wraps its host element in) and
`ViewContainerRef` (the DOM location it can insert/remove views from), then calls
`viewContainerRef.createEmbeddedView(templateRef)` to render the content, or
`viewContainerRef.clear()` to remove it — exactly the same underlying mechanism `@if` itself
compiles down to (Section 4.8).

## 13.3 Custom Attribute Directive — `HighlightDirective`

**WHAT/WHY:** applies a visual style to its host element based on some input/condition, without
ever adding/removing the element itself from the DOM — the defining distinction from a structural
directive.

## 13.4 `Renderer2`

**WHAT:** Angular's abstraction over direct DOM manipulation (`renderer.setStyle(el, 'color',
'red')` instead of `el.style.color = 'red'`). **WHY it exists instead of just touching
`nativeElement` directly:** Angular is designed to be renderer-agnostic in principle (server-side
rendering, web workers, native mobile via NativeScript historically) — code that talks to
`Renderer2` instead of the raw DOM works correctly across all of those; code that reaches directly
into `ElementRef.nativeElement` and mutates it **only works when there's a real DOM available**,
which breaks silently (or throws) under server-side rendering. This project's custom directives
would use `Renderer2` for any DOM manipulation, for exactly that platform-safety reason —
consistent with the general Angular best practice of avoiding direct DOM access wherever an
Angular-native abstraction (binding, `Renderer2`, `HostBinding`) can achieve the same result.

## 13.5 `ElementRef`

**WHAT:** a thin wrapper giving direct access to a component/directive's host DOM element
(`elementRef.nativeElement`). **This project's actual usage** — `NotificationBellComponent` and
`ProfileMenuComponent` both `inject(ElementRef<HTMLElement>)` specifically to implement
**click-outside-to-close** dropdown behavior:

```typescript
private readonly elementRef = inject(ElementRef<HTMLElement>);

@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent): void {
  if (this.open() && !this.elementRef.nativeElement.contains(event.target as Node)) {
    this.open.set(false);
  }
}
```

**WHEN direct DOM access via `ElementRef` is acceptable, vs. when it's an anti-pattern:** reading
(`.contains()`, measuring dimensions) is generally fine and hard to avoid for this exact
click-outside pattern — there's no Angular-native abstraction for "did the user click outside my
own host element." **Directly *mutating* styles/attributes via `nativeElement.style.x = y`**,
however, is exactly what `Renderer2`/property bindings should do instead (see 13.4) — this
project's own use of `ElementRef` is read-only for a hit-test, never used to imperatively style
anything, which is the disciplined, defensible way to reach for it.

## 13.6 `HostBinding` / `HostListener` ⭐⭐⭐⭐

**`@HostListener`** — declaratively attaches an event listener to the directive/component's **own
host element** (or, as above, to `document`/`window` via the `'document:click'`/`'window:resize'`
target-prefix syntax) without manually calling `addEventListener` and managing teardown yourself.

```typescript
@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent): void { /* … */ }
```

**`@HostBinding`** — the inverse: binds a **property of the host element itself** to a class
field, so setting the field imperatively updates the host's DOM property/attribute/class. Not used
explicitly anywhere in this codebase (its templates achieve the equivalent effect through ordinary
property/class bindings on the component's *own* template root element instead, e.g. `[class.
sidebar-collapsed]` directly in `sidebar.component.html`) — but understanding it matters for
interviews: `@HostBinding('class.active') isActive = false;` inside a directive achieves the same
outcome as a component's own template binding a class to itself, just from a *directive* (which
has no template of its own to bind from) rather than a component.

**WHY `@HostListener`/`@HostBinding` over raw `Renderer2`/`addEventListener` calls in a
`constructor`/`ngOnInit`:** they're declarative (visible right next to the field/method they
affect, easy to scan), and Angular manages their lifecycle automatically — no manual
`removeEventListener` in `ngOnDestroy` needed, unlike the manual `window.addEventListener` pattern
`ShellComponent` uses for resize (which specifically **couldn't** use `@HostListener('window:
resize')` as elegantly here since it needs conditional logic beyond a single line, though it
still could have — a good example of "there's often more than one valid way to wire up a browser
event in Angular, and the codebase doesn't dogmatically pick one exclusively").

---

# SECTION 14 — TypeScript for Angular

Angular is written in, and designed around, TypeScript — you cannot separate "Angular interview
prep" from "TypeScript interview prep" at the 2–3 year level. This section teaches every TS
feature used in this codebase, where it's used, and why.

## 14.1 Interfaces vs. Type Aliases

```typescript
export interface Task {                  // interface — used for every "object shape" in this project
  id: number; title: string; status: TaskStatus; assigneeId: number; /* … */
}
export type TaskStatus = 'Todo' | 'InProgress' | 'InReview' | 'Done';  // type alias — used for unions
```

**WHY this project's convention is "`interface` for object shapes, `type` for unions/primitives/
utility compositions":** `interface`s can be **extended** (`interface B extends A`) and
**declaration-merged** (multiple `interface Foo {}` declarations combine — rarely used
deliberately, but a real capability `type` doesn't have); `type` aliases are the *only* way to
express a union (`'Todo' | 'InProgress' | ...`), an intersection, or a mapped/conditional type.
This project follows the community-standard convention exactly: every DTO/entity/model
(`Task`, `Project`, `Employee`, `CurrentUserDto`) is an `interface`; every status/role/priority
enum-like value (`TaskStatus`, `UserRole`, `ProjectPriority`) is a `type` union.

## 14.2 Union Types — This Project's Enum Replacement ⭐⭐⭐⭐

```typescript
export type UserRole = 'Admin' | 'HR' | 'Manager' | 'Employee';
```

**WHY string-literal unions instead of TypeScript's native `enum`:** this project uses **zero**
`enum`s anywhere. This is a deliberate, common modern-TypeScript choice: native TS `enum`s compile
to actual runtime JavaScript objects (extra bundle weight, and reverse-mapping quirks for numeric
enums), whereas a union of string literals is a **pure compile-time construct** — it exists only
for the type-checker and disappears entirely at runtime, with zero bundle cost, while still giving
you full autocomplete and exhaustiveness checking. The `Record<TaskStatus, {...}>` pattern used
throughout this project's status-badge configs (`statusConfig` in `task-detail.component.ts`,
`task-list.component.ts`, `task-board.component.ts`) is only possible/type-safe *because*
`TaskStatus` is a proper literal union — if a fifth status were ever added, every one of those
`Record<TaskStatus, ...>` object literals would fail to compile until updated, an intentional
**exhaustiveness safety net**.

## 14.3 Generics ⭐⭐⭐⭐⭐

```typescript
export interface ApiResponse<T> { data: T; message?: string; }
export function toRecentTask(t: Task): RecentTask { /* … */ }
getById(id: number): Observable<Employee> { /* … */ }
```

**WHAT:** a generic lets a type/function/class be parameterized over *another* type, so the same
code works correctly and type-safely for many different concrete types without duplicating it.
**WHY it's everywhere in this codebase:** `ApiResponse<T>`/`PagedResponse<T>` (Section 9.3) are the
single most-used generic in the app — every service's HTTP call is typed as
`Observable<ApiResponse<SomeSpecificType>>`, and TypeScript verifies, at compile time, that
`.pipe(map(res => res.data))` actually produces the right specific type downstream — a typo like
using `EmployeeService.getById()`'s result as if it were a `Project` would be a compile error, not
a runtime surprise.

## 14.4 Optional Properties, `Partial<T>`

```typescript
export interface CreateProjectDto {
  name: string; code: string; description?: string; /* … */
}
export interface UpdateUserProfileDto { firstName: string; lastName: string; phone: string | null; /* … */ }
```

`?` marks a property optional (`T | undefined`). `Partial<T>` (a built-in TypeScript **utility
type**) makes **every** property of `T` optional at once — this project's `patchValue()` calls
(Section 8.6) rely conceptually on this exact shape (`FormGroup.patchValue()` accepts a
`Partial<...>` of the form's value type internally).

## 14.5 `Readonly<T>` / `readonly`

```typescript
readonly tasks = this._tasks.asReadonly();     // Signal<T> — see Section 11.8
protected readonly canManageTasks = ['Admin', 'Manager'].includes(this.authService.getUserRole());
```

`readonly` on a class field means it can only be assigned **once**, at declaration or in the
constructor — used on virtually every injected service (`private readonly taskService =
inject(TaskService)`) and every signal in this codebase specifically to communicate "this
reference itself never gets reassigned" (the *signal's value* can still change via `.set()` — the
`readonly` keyword only protects the **class field's own reference** to the signal object, not the
signal's internal state, an important and commonly-confused distinction).

## 14.6 `Omit<T, K>` / `Pick<T, K>` / `Record<K, V>` ⭐⭐⭐⭐

```typescript
export interface UpdateProjectDto extends CreateProjectDto {
  status: ProjectStatus; progress: number; spent: number;
}
protected readonly statusConfig: Record<TaskStatus, { badge: string; label: string; icon: string }> = {
  Todo: { badge: 'bg-secondary', label: 'To Do', icon: 'bi-circle' },
  /* … one entry per TaskStatus, or this literal fails to compile … */
};
```

- **`Record<K, V>`** — an object type with keys of type `K`, all values of type `V`. This
  project's `statusConfig`/`priorityConfig` maps (in `task-detail`, `task-list`, `task-board`,
  `recent-tasks`, `recent-projects`) are all `Record<SomeUnion, ConfigShape>` — the single most
  common generic utility type in the codebase after `ApiResponse<T>`, precisely because it gives
  free exhaustiveness checking (14.2).
- **`Omit<T, K>`** — `T` minus the listed keys. Not directly used in this codebase's own type
  declarations (most DTOs are declared as their own fresh interfaces rather than derived via
  `Omit` from a base entity), but a very standard interview topic — e.g. "how would you type a
  `CreateTaskDto` that's just `Task` without `id`/`createdAt`?" → `Omit<Task, 'id' | 'createdAt' |
  ...>`.
- **`Pick<T, K>`** — the inverse: `T` narrowed to *only* the listed keys.

## 14.7 `keyof`, `typeof`

```typescript
export interface SortConfig<T> { field: keyof T; direction: 'asc' | 'desc'; }
```
(`utils/types.util.ts` — see 14.14's note on this file). `keyof T` produces a union of `T`'s
property names as string-literal types — e.g. `keyof Task` is `'id' | 'title' | 'status' | ...`.
`typeof` (in a *type* position, not a value position) extracts the **type** of a variable/const —
e.g. this project's `AVATAR_COLORS = ['primary', 'success', ...] as const` in
`dashboard.service.ts` combined with `typeof AVATAR_COLORS[number]` would give the literal union
of exact color strings (the codebase doesn't need this specific derived type here since it just
indexes into the array directly, but the `as const` assertion itself — see 14.12 — is exactly what
makes such a derivation possible if it were needed).

## 14.8 `never`, `unknown`, `any`, `void`

- **`never`** — the type of a value that **can never occur** (a function that always throws, or an
  exhaustive `switch`'s `default` branch after every case is handled). A strong interview answer:
  *"`never` is what makes exhaustiveness checking work — if you add a new member to a union and
  forget to handle it in a switch, TypeScript can flag the missing case specifically because the
  `default` branch's fall-through value stops being assignable to `never`."*
- **`unknown`** — the type-safe counterpart to `any`: you can assign anything to `unknown`, but you
  **cannot** use an `unknown` value for anything (call a method on it, access a property) until
  you've **narrowed** it with a type guard. This project's error-handling utility,
  `getFieldError()` (`core/utils/api-error.util.ts`), works with error shapes that are
  fundamentally "we don't know exactly what the server sent back" — the disciplined choice there
  is `unknown`/a well-typed `ApiError` interface with optional fields, rather than reaching for
  `any`.
- **`any`** — opts a value **out of type-checking entirely**. Used sparingly and deliberately in
  this codebase, almost always at an explicit boundary where TypeScript's own tooling can't help
  (`preferences-settings.component.ts`'s `fb.group<any>({...})`, with an explicit comment
  explaining it predates a later type-tightening pass and casts are contained right at that
  boundary — `patchValue()`/`getRawValue()` calls are cast immediately, not left to leak `any`
  through the rest of the component). **WHEN `any` is acceptable:** rapid prototyping, third-party
  libraries with poor/missing types, or (as here) a documented, contained legacy boundary — never
  as a default/first choice.
- **`void`** — a function's return type when it returns nothing meaningful (`toggleSidebar():
  void`). Distinct from `undefined` as a *value* type — `void` specifically communicates "the
  return value isn't meant to be used," which is why `output<void>()` (Section 3.6) uses `void` as
  its generic parameter for events that carry no payload (`menuToggled`, `closeRequested`).

## 14.9 Function Types

```typescript
readonly closed = output<void>();
private resolver?: (value: boolean) => void;   // ConfirmDialogComponent
```

A function type describes a function's parameter and return types as a type annotation, without
implementing it — `(value: boolean) => void` in `ConfirmDialogComponent` is exactly what makes the
Promise-based dialog API work: `show()` stores the *resolver function* from a `new Promise<boolean>
((resolve) => { this.resolver = resolve; })`, later calling `this.resolver(result)` when the user
clicks Confirm/Cancel — a direct, practical use of a stored function-typed field to bridge
imperative UI events into a Promise.

## 14.10 Mapped Types

```typescript
export type DeepPartial<T> = { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]; };
```
(`utils/types.util.ts`) A **mapped type** iterates over every key of an existing type (`[P in
keyof T]`) and transforms each property — here, recursively making every level of a nested object
optional. This is genuinely advanced TypeScript, worth understanding structurally even though (per
14.14) this specific file is unused: it's the *pattern* — "iterate over `keyof T`, apply a
transformation" — that shows up in real utility-type interview questions (*"implement your own
version of `Partial<T>`"* is a extremely common senior-level TS interview question, and the answer
is exactly this mapped-type shape, minus the recursion).

## 14.11 Conditional Types

```typescript
export type KeysOfType<T, TProp> = { [K in keyof T]: T[K] extends TProp ? K : never }[keyof T];
```
(`utils/types.util.ts`) A **conditional type** (`X extends Y ? A : B`) branches at the type level
based on whether one type is assignable to another. This specific one, combined with the
`[keyof T]` index at the end, extracts *only the property names of `T` whose value type matches
`TProp`* — e.g. `KeysOfType<Task, string>` would resolve to `'title' | 'projectName' |
'assigneeName' | ...`, every string-typed field. A genuinely advanced pattern (`infer`,
distributive conditional types over unions, and this "filter by mapped-type + never + index"
combo) that's a strong signal of TypeScript depth in an interview, even if you never need to write
one day-to-day.

## 14.12 `as const`

```typescript
const AVATAR_COLORS = ['primary', 'success', 'warning', 'info', 'danger', 'secondary'] as const;
```
(`dashboard.service.ts`) Without `as const`, this array's inferred type would be the widened
`string[]` — any string could be pushed/assigned. `as const` locks it down to a **readonly tuple
of exact literal values** (`readonly ["primary", "success", ...]`), which is both a genuine
immutability guarantee (TypeScript rejects `.push()`/reassignment) and enables precise literal-type
derivation (`typeof AVATAR_COLORS[number]` — see 14.7).

## 14.13 Classes, Access Modifiers, Inheritance

```typescript
export class TaskStore {
  private readonly _tasks = signal<Task[]>([]);   // private — only this class
  readonly tasks = this._tasks.asReadonly();       // public (default) — every consumer
  protected readonly canManageTasks = /* … */;     // protected — this class + subclasses (rare in this codebase, no inheritance used)
}
```

- **`private`** — accessible only within the declaring class. This project defaults to `private`
  for injected services/internal signals a component's own template never needs
  (`TaskDetailComponent.taskService`).
- **`protected`** — accessible within the declaring class *and* subclasses. This project uses
  `protected` specifically for members a component's **own template** needs to read (Angular's
  template compiler can access `protected`/`public` members of the component class, but not
  `private` ones — `strictInputAccessModifiers` in `angularCompilerOptions`, on in this project's
  `tsconfig.json`, enforces this at compile time) — e.g. `protected readonly task = computed(...)`
  in `task-detail.component.ts`, read directly in `task-detail.component.html` as `task()`.
- **`public`** (default, rarely written explicitly) — accessible from anywhere, including other
  classes/files that import this one — used for a store's externally-consumed signals/methods
  (`tasks`, `loadTasks()`).
- **Inheritance (`extends`)** — not used for any *component* class in this codebase (favoring
  composition — smart/dumb component splitting, shared services — over class inheritance, which is
  itself a strong, deliberate architectural stance many senior engineers hold: inheritance
  hierarchies in UI frameworks tend to become brittle as requirements diverge between "subclasses"
  over time). It **is** used at the *type* level, though — `interface UpdateProjectDto extends
  CreateProjectDto { status: ...; }` (Section 14.6) — extending a data shape is a much safer use of
  inheritance than extending *behavior*.
- **Abstract classes** — not used anywhere in this codebase. Worth knowing the concept for
  interviews regardless: a class that can define some concrete members and some `abstract` members
  subclasses *must* implement, used when you want to share partial implementation across a family
  of related classes while still forcing each concrete subclass to fill in specifics — Angular's
  own internals use this pattern in places (though app-level code rarely needs to).

## 14.14 A Note on `utils/types.util.ts` — A Real Lesson in Technical Debt

This file defines a large family of generic utility types (`ApiResponse<T>`, `PagedResponse<T>`,
`DeepPartial<T>`, `KeysOfType<T, TProp>`, `StoreState<T>`, type guards like `isDefined()`,
`isString()`) — but **grep confirms nothing in the application actually imports from it anymore.**
The *real*, currently-used `ApiResponse<T>`/`PagedResponse<T>` types live in
`core/models/api-response.model.ts` with a slightly different (simpler, matching the real
backend's actual JSON envelope) shape. This file was written during an earlier "mock-data,
enterprise-patterns showcase" phase of the project (per `ENTERPRISE_REFACTORING_SUMMARY.md`), and
was superseded once the app was wired to a real backend — but never deleted.

**This is worth understanding, not hiding:** it's a completely realistic example of what happens
in real production codebases as they evolve — a well-intentioned abstraction gets superseded by a
simpler, backend-driven reality, and cleanup lags behind. A strong interview answer to *"how do you
handle technical debt / dead code in a codebase?"* is exactly this kind of observation: identify it
via usage analysis (grep/IDE "find references," not guesswork), confirm it's truly unreferenced,
and either delete it or, if it documents a still-useful *pattern* worth keeping as a reference
(which arguably these advanced generic-type examples do), explicitly mark it as such rather than
leaving it ambiguous.

## 14.15 Decorators

`@Component`, `@Injectable`, `@Pipe`, `@Input` (legacy)/`@Output` — Angular uses TypeScript's
**experimental decorators** feature (`experimentalDecorators: true` in this project's
`tsconfig.json`) extensively. A decorator is a function that runs at class-definition time and can
attach metadata to (or otherwise modify) a class/property/method — Angular's compiler reads this
metadata (e.g., `@Component({ selector, template, ... })`) to know how to construct and render the
class. This project's near-total shift to signal-based `input()`/`output()` functions (Sections
3.9, 3.6) instead of `@Input()`/`@Output()` decorators is itself notable: those newer APIs need
**no decorator at all** — just a plain function call assigned to a `readonly` field — part of a
broader, ongoing Angular trend of preferring plain function-based APIs (`inject()`, `input()`,
`signal()`) over decorator-based ones wherever both can express the same idea, because plain
functions are easier for tooling (and for junior developers) to reason about than decorator magic.

## 14.16 Arrow Functions

Used pervasively — every RxJS operator callback, every `computed()`/`effect()` factory, every
`.map()`/`.filter()` callback in this codebase is an arrow function, not a traditional `function`
expression. **WHY specifically for class-context code:** arrow functions don't bind their own
`this` — they capture `this` **lexically** from their enclosing scope, which is exactly what's
needed when passing a callback into `.subscribe({ next: tasks => this._tasks.set(tasks) })` from
inside a class method — a traditional `function` expression there would have its own, different
`this` (usually `undefined` in strict mode), breaking the reference to the store's own signals
entirely. This is a very common junior-to-mid-level interview question: *"why do we use arrow
functions for callbacks inside Angular classes?"*

## 14.17 `async`/`await` vs. Promises vs. Observables in This Codebase

```typescript
async confirmDelete(task: { id: number; title: string }): Promise<void> {
  const confirmed = await this.confirmDialog.confirmDelete(task.title);
  if (!confirmed) return;
  this.taskService.delete(task.id).subscribe({ next: () => this.store.removeTask(task.id) });
}
```
(`task-list.component.ts`, after this session's `ConfirmDialogService` migration) — `async`/`await`
appears specifically at the **UI-confirmation boundary**: `ConfirmDialogService.confirm()` returns
a `Promise<boolean>` (deliberately — a modal dialog waiting for exactly one user decision is a
better fit for a Promise's "one value, eventually" semantics than an Observable's richer, more
general streaming API — see 14.18) — so every handler that shows a confirm dialog before acting is
itself `async`, `await`-ing that one Promise, then falling back to the *existing* `.subscribe()`-
based style for the actual (Observable-returning) HTTP call underneath. This project doesn't mix
paradigms carelessly — it's a **deliberate, narrow** use of `async`/`await` for exactly the one
kind of interaction (a modal's yes/no answer) where a Promise is genuinely the better fit, while
staying Observable-based for everything HTTP/streaming.

## 14.18 Promises vs. Observables — Why `ConfirmDialogService` Chose Promise

| | Promise | Observable |
|---|---|---|
| Values over time | Exactly one (or an error) | Zero, one, or many |
| Cancellable? | No (natively) | Yes (`.unsubscribe()`) |
| Lazy? | No — starts executing the instant it's created | Yes — does nothing until subscribed |
| Composability | `async`/`await`, `.then()` chains | The full RxJS operator library |
| `ConfirmDialogService.confirm()`'s fit | ✅ — "the user will click exactly one button, eventually" is precisely a single-value async result | Would work too, but `async`/`await` at every call site reads more naturally for "wait for this one yes/no answer before continuing" than a `.pipe(take(1))`-guarded subscription would |

## 14.19 Modules — `import`/`export`

Standard ES module syntax throughout — every file explicitly imports exactly what it needs
(`import { Task } from '../models/task.model'`) and exports exactly what other files should be
able to use (`export interface Task {...}`, `export class TaskService {...}`). This project has no
`index.ts` "barrel export" files re-exporting an entire folder's contents in one place — each
import is direct and specific, which (a) makes "find all usages" tooling more reliable and (b)
avoids a well-known tree-shaking pitfall where barrel files can accidentally pull in far more code
than a consumer actually needed, because bundlers sometimes can't prove *which* of the barrel's
re-exports are actually used.

---

# SECTION 15 — Change Detection (Zoneless)

**This section is the single most distinctive architectural fact about this codebase, and one of
the strongest things you can talk about in an interview** — this project uses
**`provideZonelessChangeDetection()`**, meaning **Zone.js is not part of this application at
all**. Most Angular tutorials, most existing Angular codebases you'll encounter in a job, and most
interview questions still assume Zone.js — so you need to understand **both**: the traditional
Zone.js model (because you'll work in codebases that use it) **and** this project's more modern
zoneless model (because that's the direction the whole framework is heading, and this project is
already there).

## 15.1 What "Change Detection" Actually Means

**WHAT:** the process by which Angular decides *when* to re-check a component's bindings (its
template expressions) against the current state of its class properties/signals, and update the
real DOM if anything changed. Angular doesn't magically know the instant you set `this.x = 5`
inside a plain (non-signal) class property — something has to trigger a check.

## 15.2 The Traditional (Zone.js) Model — How It Works

**WHAT Zone.js is:** a library that **monkey-patches** every async browser API — `setTimeout`,
`Promise.then`, `addEventListener`, `XMLHttpRequest`, etc. — so that Angular gets notified the
**instant any of them completes**, anywhere in the app, without you having to manually tell it.

**HOW it drives change detection:** Angular wraps the entire application inside an
`NgZone`. Whenever *anything* Zone.js has patched finishes (a click handler runs, an HTTP response
arrives, a timer fires), `NgZone` emits, and Angular runs a **full change detection pass**: it
walks the **entire component tree**, top to bottom, checking every component's bindings for
changes (unless that component is `OnPush` and none of its inputs changed — see 15.4).

```
User clicks a button
      │
      ▼
 Zone.js intercepts the click (it patched addEventListener)
      │
      ▼
 Your (click) handler runs, e.g. sets a plain property: this.count++
      │
      ▼
 Zone.js notices the patched task completed → notifies NgZone
      │
      ▼
 Angular runs change detection over the WHOLE component tree
 (skipping OnPush subtrees whose inputs/signals didn't change)
      │
      ▼
 Any binding whose computed value differs from last time → DOM updated
```

**WHY this was Angular's original design (and its real value):** it means you almost never had to
manually tell Angular "hey, something changed, please re-render" — literally any async operation
anywhere (even inside a third-party library, as long as it used a Zone.js-patched API) would
trigger a check automatically. This "it just works" magic was a genuine productivity win in
Angular's early years.

**WHY it's also a real cost, and why Angular is moving away from requiring it:**
- Every async event, however small, triggers a check of the **entire tree** (except `OnPush`
  subtrees) — wasteful at scale, since most of the time only one small part of the UI actually
  changed.
- Zone.js itself is a non-trivial chunk of bundle size and a runtime patching layer with real
  overhead, present in every app whether or not it's actually needed.
- It's "magic" in the pejorative sense too — debugging *why* a change-detection cycle ran (or
  didn't) means reasoning about which async API triggered it, which can be genuinely opaque.

## 15.3 This Project's Model — Zoneless, Signal-Driven ⭐⭐⭐⭐⭐

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),   // ← no Zone.js anywhere in this app
    /* … */
  ]
};
```

**WHAT changes without Zone.js:** Angular no longer gets a generic "something async happened
somewhere" notification. Instead, change detection is triggered by **precise, explicit
signals**:
1. **A signal's value changes** (`.set()`/`.update()`) — if a component's template (or a
   `computed()`/`effect()` it depends on) read that signal, Angular schedules a change-detection
   check for **exactly the components that could be affected** — not the whole tree.
2. Angular's own internal APIs that *know* something changed (e.g., binding a new value from an
   `input()`, an `async` pipe receiving a new emission) explicitly mark the relevant component
   dirty.
3. `ChangeDetectorRef.markForCheck()` / `ApplicationRef.tick()` called manually, for any remaining
   edge case not already covered by signals.

**WHY this is strictly better *when the app is fully signal-driven* (as this one is):** change
detection becomes **surgical** instead of tree-wide — Angular can, in principle, know *exactly*
which components' bindings could possibly have changed and only check those, because it's tracking
signal reads/writes directly rather than "something, somewhere, happened." This is faster, more
predictable, and removes an entire class of "why did this re-render / why didn't this re-render"
debugging mysteries, because the answer is always traceable to a specific signal write, not an
opaque Zone.js-patched async callback.

**The catch — and why this matters practically:** in a zoneless app, **mutating a plain class
property directly does *not* trigger a re-render**, because nothing signals-based observed that
mutation. This is *exactly* why this codebase's discipline of "everything reactive is a signal, and
everything is updated via `.set()`/`.update()`, never plain assignment to a property the template
reads" (Section 11.2) isn't just a style preference here — **it's structurally required** for the
app to function correctly at all. A plain `this.someProperty = x` inside a component whose template
reads `{{ someProperty }}` (not `{{ someSignal() }}`) would silently **never update the DOM** in
this app, because there's no Zone.js watching for it anymore. Every reactive value that a template
reads in this codebase is, without exception, a signal for precisely this reason.

## 15.4 `ChangeDetectionStrategy.Default` vs. `OnPush` ⭐⭐⭐⭐⭐

Even though this project is zoneless (so the *traditional* "OnPush skips a subtree during a
Zone.js-triggered tree-wide sweep" story doesn't literally apply the same way), **every single
component in this codebase still explicitly declares `changeDetection:
ChangeDetectionStrategy.OnPush`**. This is worth understanding precisely:

- **`Default`** — a component is eligible to be re-checked on *any* change-detection run,
  regardless of whether any of its own inputs changed.
- **`OnPush`** — a component is only re-checked when: (a) one of its `@Input()`/signal inputs
  receives a **new reference** (or, for signal inputs, the signal itself changed), (b) an event
  originated from within the component or one of its children (a `(click)` handler, etc.), (c) a
  signal the component's template reads directly changed, or (d) `markForCheck()`/`.detectChanges()`
  is called on it explicitly.

**WHY `OnPush` is still the explicit, correct choice even in a zoneless, signals-first app:** it's
not really "off" here so much as it's the **natural default** for a signals-driven component —
`OnPush` is precisely "only re-check when something this component actually cares about changed,"
which is exactly the granularity signals already provide. Declaring it explicitly is a form of
documentation/enforcement: it guarantees that if a developer *does* accidentally introduce a plain
mutated property read directly in a template, it silently fails to update — surfacing the bug
immediately during development rather than only in a hypothetical future zoneless migration. Every
component in this codebase (`DashboardComponent`, `TaskDetailComponent`, `StatsCardComponent`,
literally all of them) sets this explicitly.

## 15.5 `markForCheck()` vs. `detectChanges()`

- **`markForCheck()`** — tells Angular "this `OnPush` component (and its ancestors, up to the
  nearest point Angular will actually run a check from) needs to be included in the **next**
  change-detection pass." Doesn't run anything immediately.
- **`detectChanges()`** — runs change detection **synchronously, right now**, for this component
  and its descendants, regardless of the normal scheduling.

This codebase doesn't call either directly anywhere — a strong sign the signals-first design is
working as intended: `markForCheck()`/`detectChanges()` are the *manual escape hatches* you reach
for when a piece of state changed **outside** the signal system's visibility (e.g., a raw
third-party callback mutating something the template reads) — needing them is usually itself a
signal (pun intended) that something isn't fully signal-driven yet. Still essential interview
knowledge: *"you have an `OnPush` component whose data changed but the view isn't updating — what
do you check?"* → is the source of the change a signal the template reads, or a plain mutation
Angular has no visibility into; if the latter, `markForCheck()` is the fix (or, better, refactor
the state to a signal).

## 15.6 Performance Comparison Table

| | Zone.js (`Default` strategy) | Zone.js (`OnPush` everywhere) | Zoneless + Signals (this project) |
|---|---|---|---|
| What triggers a CD pass | Any patched async API, anywhere | Same trigger, but `OnPush` subtrees are skipped unless their own inputs/events changed | A specific signal write |
| Granularity of "what gets checked" | Whole tree | Whole tree minus untouched `OnPush` subtrees | Precisely the components dependent on the signal that changed |
| Bundle cost | + Zone.js library | + Zone.js library | No Zone.js at all |
| "Why did this re-render?" debuggability | Hard — could be any async event anywhere | Better, but still "some Zone.js event happened" | Best — traceable to an exact `.set()`/`.update()` call |
| Risk of silent non-updates | Low (Zone.js catches almost everything) | Moderate (must remember `OnPush`'s input-reference rules) | Real, but *contained* by discipline: templates must read signals, not plain properties |

## 15.7 Interview Questions on This Section

- *"What is Zone.js and what problem does it solve?"* — 15.2.
- *"What does `provideZonelessChangeDetection()` actually remove, and what has to be true about
  your app for it to work correctly?"* — 15.3; the app must be signal-driven for template-read
  state.
- *"Why does this project set `OnPush` on every component even though it's zoneless?"* — 15.4;
  it's the natural, explicit expression of "only re-check what a signal says changed," and a
  guardrail against accidental non-signal template reads.
- *"A component's template shows stale data after a signal update — what are the possible
  causes?"* — either the template is reading a plain property instead of calling the signal
  (`{{ x }}` instead of `{{ x() }}`), or the update mutated an object/array in place instead of
  producing a new reference (Section 11.2), so the signal's own internal equality check never
  detected a change to begin with.

---

# SECTION 16 — Performance Optimization

## 16.1 Lazy Loading — Recap

Covered in depth in Section 7.3. The single highest-leverage performance technique in this
codebase: every feature is a separate downloadable chunk, confirmed directly in this project's own
`ng build` output.

## 16.2 `track` in `@for` — Recap

Covered in depth in Section 4.6. Mandatory in the new control-flow syntax; prevents wholesale DOM
recreation on every array update.

## 16.3 `OnPush` + Signals — Recap

Covered in depth in Section 15.4–15.6. The combination this entire codebase is built around.

## 16.4 Signals' Built-In Memoization as a Performance Feature

`computed()` (Section 11.3) is lazy and memoized *by construction* — this alone eliminates an
entire category of performance bugs that plague codebases relying on plain getter methods called
directly from templates (`{{ someExpensiveMethod() }}`), which re-run on **every** change
detection check regardless of whether their inputs changed. `DashboardComponent`'s `stats`,
`employees`, `projects`, `tasks`, `hasData` are all `computed()` for exactly this reason — cheap to
read as many times as the template wants, expensive work (if any) only happens once per actual
underlying change.

## 16.5 Virtual Scroll

**WHAT:** rendering only the DOM nodes for items currently **visible** in a scrollable list
(plus a small buffer), recycling DOM nodes as the user scrolls, instead of rendering every item in
a potentially huge list up front. Angular CDK ships `<cdk-virtual-scroll-viewport>` for this. **Not
used in this codebase** — every list here (`task-list`, `employee-list`, `project-list`) uses
ordinary `@for` over a fully-rendered array, appropriate at this project's realistic data volumes
(dozens to low hundreds of rows, with server-side pagination already handling the larger case —
see `ProjectService.getPaged()`/`TaskService.getPaged()`). **WHEN it would become worth adding:**
if any list needed to render many hundreds/thousands of DOM rows simultaneously without
pagination — a common follow-up interview question after discussing `track`: *"what's the next
level up from `trackBy` for list performance?"*

## 16.6 Pure Pipes — Recap

Covered in Section 12.3. Memoized by default, cheap to leave in templates.

## 16.7 Caching / Memoization at the Store Level

`TaskStore`/`ProjectStore`/`EmployeeStore` fetch their full list **once** and hold it in a signal
— every component reading `store.tasks()` shares that one cached fetch, rather than each
independently re-requesting the same data (Section 10.19's discussion of `shareReplay` vs. the
signal-store pattern achieving the same *caching* outcome by construction).

## 16.8 Code Splitting — Recap

This is what lazy loading (16.1) *is*, from the bundler's point of view — each `loadComponent`/
`loadChildren` boundary becomes a genuine, separately-downloadable JavaScript chunk, confirmed
concretely in this project's build output (`dashboard-component`, `task-detail-component`,
`security-settings-component`, etc., each its own file).

## 16.9 Image Optimization

Angular ships `NgOptimizedImage` (the `ngSrc` directive) for automatic responsive
images/lazy-loading/preconnect hints on `<img>` tags. **Not used in this codebase** — the app's
images are almost entirely small, user-uploaded avatar photos (max 2MB, validated client-side in
`profile-settings.component.ts`) and Bootstrap Icons (an icon font/SVG sprite, not `<img>` tags at
all) — genuinely low-value to add `NgOptimizedImage` for at this project's current image usage
profile, but worth knowing it exists and what problem it solves (responsive `srcset` generation,
automatic `loading="lazy"`, avoiding layout shift) for a system with heavier image needs (a
product catalog, a media gallery).

## 16.10 Bundle Optimization

Covered implicitly throughout: standalone components (1.11) + `providedIn: 'root'` (5.6) +
feature-provider functions (1.8) are all, at their core, **tree-shaking enablers** — every one of
them exists partly so the production bundler can prove "this code is genuinely unused, safe to
delete," which is the single biggest lever for reducing what actually ships to the browser.

## 16.11 A Complete "How Would You Optimize This App" Interview Answer

A strong, structured answer, in priority order for *this specific codebase*: (1) it already lazy-
loads every feature and uses signals+`OnPush`+zoneless everywhere — the foundational architecture
is already performance-oriented; (2) the next real lever would be **virtual scroll** if any list
grows beyond what server-side pagination comfortably handles; (3) **`NgOptimizedImage`** if the
app ever gains heavier image content; (4) auditing whether any `computed()` chains are doing more
work than necessary inside their `filteredTasks`-style search/filter/sort pipelines (Section 11.6)
as data volumes grow — those are `O(n)` per keystroke today, fine at hundreds of rows, worth
revisiting well before tens of thousands.

---

# SECTION 17 — Authentication

## 17.1 JWT — What It Is and How This Project Uses It

**WHAT:** a JSON Web Token — a self-contained, cryptographically signed string encoding a set of
claims (`sub`, `email`, `role`, `exp`, ...) as its payload. The server signs it; any party can
**decode** the payload (it's just base64), but only the server (holding the signing secret) can
**verify** it's authentic and untampered.

```typescript
export interface DecodedAccessToken {
  sub: string; name: string; email: string; role: UserRole; jti: string; exp: number;
}

private decodeToken(token: string | null): DecodedAccessToken | null {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload)) as DecodedAccessToken;
  } catch { return null; }
}
```
(`core/services/auth.service.ts`) — this is a **client-side decode only, never trusted as
verification** (the comment directly above `_currentUser` in `auth.service.ts` says exactly this).
The frontend reads the role/expiry out of the token purely to drive **UX** decisions (what to show,
what to grey out) — every actually-sensitive operation is re-checked, and re-authorized, **on the
server**, which alone holds the ability to verify the signature. This distinction — "client-side
JWT decode is for UX, server-side verification is for security" — is one of the most important,
most-tested pieces of security understanding in any Angular-with-auth interview.

## 17.2 Login Flow — End to End

```
User submits login form
        │
        ▼
AuthFeatureService.login({ email, password })
        │  POST /auth/login  →  { accessToken, refreshToken, expiresAt }
        ▼
tap(tokens => authService.setTokens(...))     ← stores both tokens in sessionStorage + signals
        │
        ▼
switchMap(() => this.getCurrentUser())         ← GET /auth/me, right away
        │
        ▼
tap(user => authService.setCurrentUser(user))  ← populates CurrentUserDto (id, role, employeeId, ...)
        │
        ▼
Caller's .subscribe() fires — component navigates to /dashboard
```

(`features/auth/services/auth-feature.service.ts`) — the docblock is explicit about **why**
`login()` chains straight into `getCurrentUser()` before ever letting the caller's subscription
complete: the JWT itself carries no `employeeId` claim, but ownership-scoped UI checks (Section
17.6 — "is this project mine?") need it, so a separate `GET /auth/me` fetch populates
`AuthService.currentUser` before the login flow is considered "done" — guaranteeing any
component that navigates the instant `login()` emits already has a fully-populated
`CurrentUserDto` available, with no separate loading state to coordinate.

## 17.3 Token Storage — WHY `sessionStorage`, Not `localStorage`

```typescript
private readonly _accessToken = signal<string | null>(sessionStorage.getItem(ACCESS_TOKEN_KEY));
```
(`auth.service.ts`) — `sessionStorage` is scoped to **one browser tab** and is cleared the moment
that tab closes; `localStorage` persists indefinitely across tabs and browser restarts until
explicitly cleared. This project's choice of `sessionStorage` is a deliberate security/UX
trade-off: a stolen/leaked token from `sessionStorage` has a much smaller exploitable window
(gone the instant the tab closes) than one sitting in `localStorage` potentially for weeks — at
the cost of requiring a fresh login in every new tab (no "stay logged in across tabs" for free).
**Neither** is immune to XSS (any injected script running on the page can read either storage) —
the *only* storage mechanism genuinely resistant to XSS token theft is an `HttpOnly` cookie set by
the server (unreadable from JavaScript at all), which this project doesn't use, a fair and common
interview follow-up: *"is `sessionStorage`/`localStorage` safe for tokens? What would be safer?"*

## 17.4 Refresh Tokens — Why They Exist and How This Project Handles Rotation

**WHY a short-lived access token + a separate, longer-lived refresh token, instead of one
long-lived token:** if the access token used on every API call is short-lived (~15 minutes,
noted in `security-settings.component.ts`'s comments), a leaked one is only useful to an attacker
for a short window. The refresh token exists solely to silently obtain new access tokens without
forcing the user to re-enter credentials every 15 minutes — and (per `token-refresh.service.ts`'s
docblock) this backend **rotates** it on every use specifically so a stolen-and-reused *old*
refresh token is detectable (presenting an already-used one is treated as theft, revoking the
whole session). See Section 10.19 for the full single-flight `shareReplay` mechanics that make
this rotation scheme safe under concurrent requests.

## 17.5 Guards — Recap

Covered in depth in Section 7.5. `authGuard` (redirects to `/auth/login` if not authenticated) and
`roleGuard` (redirects to `/dashboard` if the route's required role doesn't match) are both
**route-level, coarse** authorization.

## 17.6 Role-Based Access & Per-Record Permission Checks ⭐⭐⭐⭐⭐

This project draws a sharp, well-documented line between two **distinct kinds** of authorization
check, and understanding this distinction is one of the best "architectural maturity" signals you
can demonstrate in an interview:

**1. Route-level / coarse role gating** — "can this role reach this screen at all" —
`roleGuard`/`canManageTasks`-style role-only booleans (`['Admin', 'Manager'].includes
(authService.getUserRole())`) sprinkled through list/detail components to show/hide Edit/Delete
buttons.

**2. Per-record ownership checks** — "does *this specific* Manager actually manage *this specific*
project" — `core/utils/permissions.util.ts`:
```typescript
export function canEditProject(projectManagerId: number, user: CurrentUserDto | null): boolean {
  if (!user) return false;
  if (user.role === 'Admin') return true;
  if (user.role === 'Manager') return user.employeeId === projectManagerId;
  return false;
}
export function canChangeTaskStatus(taskAssigneeId: number, taskProjectManagerId: number, user: CurrentUserDto | null): boolean {
  if (!user) return false;
  if (user.role === 'Admin') return true;
  if (user.role === 'Manager') return user.employeeId === taskProjectManagerId;
  if (user.role === 'Employee') return user.employeeId === taskAssigneeId;
  return false;
}
```

**WHY the split is necessary — and explicitly documented as such in this codebase's own
comments:** a route guard runs **once, before the component even loads** — it has no idea, and
*can't* easily know, which specific record the user will end up looking at, so it can only express
"can a Manager reach the project-edit URL pattern at all." Whether *this* Manager owns *this*
project is a **per-record** fact only knowable once the actual data has loaded — hence a
`computed()` signal like `project-detail.component.ts`'s `canEdit = computed(() =>
canEditProject(this.project()?.managerId ?? -1, this.authService.currentUser()))`, re-evaluated
once the specific project's `managerId` is known.

**The single most important sentence to internalize (and say out loud in an interview) about
these functions:** *"these are UX-only, not a security boundary — the backend re-checks all of
this server-side regardless, returning 403 if bypassed."* `permissions.util.ts`'s own docblock
states this explicitly. **No client-side check, no matter how sophisticated, can be trusted as
actual security** — a user can open DevTools and call the underlying service method directly,
bypassing every button's `[disabled]`/`@if`. These functions exist purely so the UI *looks*
correct (hiding an Edit button someone can't actually use, rather than showing it and then
erroring), never as the app's actual authorization mechanism.

## 17.7 A Complete "Explain Your Auth Architecture" Interview Answer

Login → `POST /auth/login` returns an access+refresh token pair → stored in `sessionStorage` +
signals in `AuthService` → immediately followed by `GET /auth/me` to populate the full
`CurrentUserDto` (role + employeeId, which the JWT itself doesn't carry) → every subsequent HTTP
call has the access token attached by `authInterceptor` → a 401 anywhere triggers
`tokenRefreshInterceptor`'s single-flight refresh-and-retry (Section 18.4), transparent to the
calling code → route guards enforce coarse "can this role reach this screen" checks → per-record
ownership checks (`permissions.util.ts`) refine that at the component level once specific record
data is loaded, purely for UX, with the server as the actual, final authority on every write.

---

# SECTION 18 — Interceptors

## 18.1 What an Interceptor Is and How It Works Internally

**WHAT:** a function (the modern **functional** form — `HttpInterceptorFn`, this project's
exclusive style; the older class-based `HttpInterceptor` interface still exists but isn't used
here) that sits in the middle of every `HttpClient` request, able to inspect/modify the outgoing
`HttpRequest` and the incoming response (or error).

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // ... inspect/clone req ...
  return next(req);   // pass control to the next link in the chain
};
```

**HOW the chain works internally — the single most commonly misunderstood part of interceptors:**
`provideHttpClient(withInterceptors([a, b, c]))` registers interceptors in **array order for the
outgoing request**, but because each interceptor's `next(req)` call returns an **Observable that
resolves later** (whenever the response eventually arrives), the **response** flows back through
the exact same chain in **reverse order**:

```
Request:   authInterceptor → errorInterceptor → tokenRefreshInterceptor → loggingInterceptor → [real HTTP call]
Response:  authInterceptor ← errorInterceptor ← tokenRefreshInterceptor ← loggingInterceptor ← [real HTTP call]
```

This project's `app.config.ts` comment makes this explicit and uses it deliberately:
`tokenRefreshInterceptor` is registered **after** `errorInterceptor` in the array — meaning on the
way **back**, `tokenRefreshInterceptor` (closer to the real HTTP call) sees a raw 401 **first**
and gets the chance to silently resolve it (refresh + retry) **before** `errorInterceptor`'s
generic status-code handling ever sees it at all. If the order were reversed, every 401 would
first hit `errorInterceptor`'s generic error mapping (which has no special 401 case — see 18.3 —
because it's not supposed to handle 401 at all) before `tokenRefreshInterceptor` ever got a chance
to fix it silently.

## 18.2 This Project's Full Interceptor Chain, In Order

```typescript
provideHttpClient(
  withInterceptors([
    authInterceptor,          // ① attach Bearer token
    errorInterceptor,         // ② normalize non-2xx responses into ApiError, toast for 403/409/500
    tokenRefreshInterceptor,  // ③ own 401: silent refresh + retry, or logout
    loggingInterceptor        // ④ innermost — request/response timing logs
  ])
)
```

## 18.3 `authInterceptor` — JWT Attachment

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (isPublicAuthEndpoint(req.url)) return next(req);   // login/refresh/forgot-password/etc. — no token to attach yet
  const token = inject(AuthService).getAccessToken();
  if (token) {
    return next(req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) }));
  }
  return next(req);
};
```

**WHY `req.clone()` instead of mutating `req` directly:** `HttpRequest` objects are **immutable**
by design (the same discipline as `HttpParams`/signals elsewhere in this codebase, Section 9.5) —
`.clone({...})` returns a **new** request with the given overrides, leaving the original untouched.
This matters because the same original `req` object may need to be inspected unmodified by
*other* logic (retries, logging) further down/up the chain.

**`isPublicAuthEndpoint()`** (`core/utils/auth-endpoints.ts`) — a small allowlist check excluding
login/refresh/forgot-password/reset-password/verify-email from getting a (nonexistent, at that
point) Bearer token attached — attaching a stale/absent token to a login request would be
meaningless at best.

## 18.4 `tokenRefreshInterceptor` — Silent 401 Recovery

Covered in full mechanical detail in Section 17.4/10.19. The key interceptor-specific insight:
**the original failed request is retried transparently** — `req.clone({ headers:
req.headers.set('Authorization', ...new token...) })` then `next(retried)` — so the component that
originally made the call **never even knows** a 401/refresh/retry cycle happened; its
`.subscribe({ next: ... })` just eventually receives the successful response, as if the access
token had been valid all along.

## 18.5 `errorInterceptor` — Global Error Normalization

```typescript
switch (err.status) {
  case 403: errorHandler.notify('warning', problem?.detail || "You don't have permission to do that."); break;
  case 409: errorHandler.notify('warning', message); break;
  case 500: errorHandler.notify('danger', GENERIC_SERVER_ERROR_MESSAGE); break;
  default: /* 400/401/404/423 — handled inline by the specific screen, not globally */ break;
}
return throwError(() => Object.assign(new Error(message), { status: err.status, fieldErrors: problem?.errors }));
```

**WHY only 403/409/500 get a global toast, and everything else is deliberately left to the calling
component:** a 400 (validation error) needs to show up **next to the specific invalid field**, not
as a generic toast — that's what `getFieldError()` (Section 19.3) and each form's own
`error`/`fieldErrors` handling is for. A 404 on a detail page means "this specific resource is
gone" — better shown as that page's own inline error state (`TaskDetailComponent`'s `@else if
(error())` branch) than a floating toast. A 423 (locked) is specific to the login form's own
lockout messaging. 403/409/500, by contrast, are **generically actionable** regardless of which
screen triggered them ("you don't have permission," "conflict, try again," "something broke") —
exactly the shape of error worth centralizing into one component (the global toast, mounted once
in `ShellComponent`) instead of duplicating similar messaging logic across every single screen.

**`throwError(() => apiError)`** — every interceptor that needs to *let the error continue
propagating* (rather than fully recovering from it) re-throws via `throwError(() => ...)`, the
RxJS-idiomatic way to produce an Observable that immediately errors — passing a **factory
function**, not the error value directly, so a fresh error object is created for each subscriber
(relevant for multicast scenarios like `shareReplay`, Section 10.19, though not strictly needed
for this project's single-subscriber HTTP calls — still the correct, idiomatic form regardless).

## 18.6 `loggingInterceptor` — Request/Response Timing

The **innermost** interceptor in this project's chain (last in the array, meaning closest to the
real network call) — deliberately positioned there so its `Date.now()` timing brackets the
**actual network round-trip**, not any time spent inside `authInterceptor`/`errorInterceptor`/
`tokenRefreshInterceptor`'s own (comparatively trivial) synchronous logic.

## 18.7 Interview Questions on This Section

- *"Explain the order interceptors run in, for both the request and the response."* — 18.1's
  diagram; this is asked constantly and very frequently gotten wrong (people assume response order
  matches request order, when it's actually reversed).
- *"Why would you put a retry/refresh interceptor before or after a generic error-handling
  interceptor?"* — 18.1's concrete explanation of why `tokenRefreshInterceptor` sits after
  `errorInterceptor` in the array specifically so it sees 401s first on the way back.
- *"How do you attach an auth token to every request without repeating that logic in every
  service?"* — `authInterceptor`, 18.3.
- *"Why use `req.clone()` instead of mutating the request?"* — immutability, 18.3.

---

# SECTION 19 — Error Handling

## 19.1 The Layers of Error Handling in This Project

```
┌─────────────────────────────────────────────────────────────┐
│ provideBrowserGlobalErrorListeners()  — uncaught JS exceptions /
│   unhandled promise rejections anywhere in the app (last resort) │
├─────────────────────────────────────────────────────────────┤
│ errorInterceptor — normalizes every non-2xx HTTP response into  │
│   one ApiError shape; global toast for 403/409/500              │
├─────────────────────────────────────────────────────────────┤
│ tokenRefreshInterceptor — owns 401 specifically (silent recovery)│
├─────────────────────────────────────────────────────────────┤
│ Component-level `error: (err) => this.error.set(err.message)`   │
│   — inline, screen-specific error display (400 field errors,    │
│   404 not-found states, 423 login lockout)                      │
└─────────────────────────────────────────────────────────────┘
```

## 19.2 Global Error Handler — `provideBrowserGlobalErrorListeners()`

**WHAT:** registers window-level `error`/`unhandledrejection` listeners so a genuinely uncaught
exception anywhere in the app (a bug, not an HTTP failure) is captured rather than silently
swallowed by the browser console alone. This is the **true last line of defense** — everything
above it in the stack (interceptors, component-level `error` callbacks) is for *expected*,
*handleable* failure modes (a 403, a validation error); this catches genuine bugs.

## 19.3 HTTP Errors — `ApiError` and Field-Level Errors

```typescript
export function getFieldError(fieldErrors: Record<string, string[]> | undefined, field: string): string | undefined {
  // case-insensitive lookup — backend sometimes returns PascalCase (FluentValidation), sometimes camelCase
  /* ... */
}
```
(`core/utils/api-error.util.ts`) — every `ApiError` this app's services eventually throw
(constructed by `errorInterceptor`, Section 18.5) carries an optional `fieldErrors:
Record<string, string[]>` alongside the generic `.message` — a form's submit handler checks for a
field-specific error first (e.g. `security-settings.component.ts`'s `changePassword()`: `const
currentErr = getFieldError(err.fieldErrors, 'currentPassword')`) and only falls back to showing
the generic message if no field-specific one exists — exactly the difference between "Current
password is incorrect" appearing right next to that one input vs. a vague top-of-form banner.

## 19.4 RxJS Errors — `catchError`, Re-throwing vs. Recovering

Covered mechanically in Section 10.21/18.5. The core decision every `catchError` makes: **recover**
(return a new Observable — e.g., a fallback empty array so the stream still completes normally) or
**re-throw** (propagate the error further up, as `errorInterceptor` and `tokenRefreshInterceptor`
both do after doing their own side-effect work). This project's interceptors always re-throw
(they normalize/react to the error, but the ultimate calling component still needs to know the
call failed, to update its own loading/error signals) — a good interview distinction: *"when would
`catchError` swallow an error vs. re-throw it?"* → swallow when there's a sensible fallback value
that lets the rest of the app behave as if nothing failed; re-throw when the caller genuinely needs
to know and react.

## 19.5 Component-Level Errors

Every list/detail component in this codebase follows the identical, simple pattern:
```typescript
this.taskService.getAll().subscribe({
  next: tasks => { this.allTasks.set(tasks); this.loading.set(false); },
  error: (err: Error) => { this.error.set(err.message); this.loading.set(false); }
});
```
paired with a template `@if (error()) { <div class="alert alert-danger">{{ error() }}</div> }`
branch. Simple, consistent, and deliberately **not** over-engineered with a shared "error boundary"
component — for a CRUD app of this shape, per-screen inline error state is more than sufficient,
and consistent enough across every component that a developer never has to relearn the pattern
moving between features.

## 19.6 Production Error-Handling Best Practices Demonstrated Here

1. **Normalize once, at the interceptor boundary** — every component downstream deals with one
   consistent `ApiError` shape, never a raw `HttpErrorResponse`.
2. **Route errors to the right *level* of UI** — global toast for app-wide-actionable errors,
   inline state for screen-specific ones, field-level messages for validation — never one
   one-size-fits-all error display.
3. **Never expose raw server error details for 500s** — `GENERIC_SERVER_ERROR_MESSAGE =
   'Something went wrong. Please try again.'` is shown for every 500, regardless of what the
   server's actual exception message was, specifically to avoid leaking internal implementation
   details (stack traces, SQL fragments) to the end user — a real security/UX best practice, not
   just a style choice.
4. **Auto-dismiss transient notices** (`ErrorHandlerService`'s `AUTO_DISMISS_MS = 6000`) so a toast
   doesn't linger forever and clutter the UI.

---

# SECTION 20 — Testing

## 20.1 This Project's Actual Test Runner — Vitest, Not Karma/Jasmine ⭐⭐⭐⭐

```json
// angular.json
"test": { "builder": "@angular/build:unit-test" }
```
```json
// package.json devDependencies
"vitest": "^4.0.8", "jsdom": "^28.0.0"
```

**This is a genuinely important, up-to-date fact to know cold:** historically, `ng test` ran
**Karma** (a real-browser test runner) executing **Jasmine** (the assertion/spec-writing
framework) — this is what the overwhelming majority of existing Angular tutorials, courses, and
codebases still use, and what most interviewers still default to asking about. This project uses
Angular's newer **unified builder** (`@angular/build:unit-test`), backed by **Vitest** running
against **jsdom** (a JavaScript DOM implementation, not a real browser) instead. The *authoring*
API (`describe`, `it`, `expect`) is intentionally Jasmine/Jest-compatible-looking, so existing
Angular testing knowledge transfers almost entirely — but the underlying execution engine, speed
characteristics (Vitest is dramatically faster, especially on re-runs, via native ESM + smart
re-execution), and configuration surface (no more `karma.conf.js`) are different, and worth
mentioning explicitly if a codebase (like this one) has already made this move.

```typescript
// src/app/app.spec.ts — this project's one example test
describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('...');
  });
});
```

## 20.2 `TestBed` — The Core Angular Testing Utility

**WHAT:** Angular's test-specific dependency injection/component-creation harness — it lets you
configure a **miniature, isolated Angular application** (import just the pieces a test needs,
optionally override/mock specific providers) and create real component instances (`fixture =
TestBed.createComponent(MyComponent)`) with real change detection, without needing a full app
bootstrap.

Since every component in this codebase is **standalone**, `TestBed.configureTestingModule({
imports: [App] })` works by importing the component **directly** — no test-only `NgModule`
wrapper needed, one more place standalone components simplify things versus the old NgModule-based
testing setup (which needed a `declarations: [MyComponent]` + often a whole separate testing
module).

## 20.3 Unit Testing a Component

A component test typically: (1) configures `TestBed` with the component (and any real or mocked
dependencies), (2) creates a `ComponentFixture`, (3) optionally calls `fixture.detectChanges()` to
trigger an initial render, (4) asserts against either the component **instance** directly
(`fixture.componentInstance.someSignal()`) or the rendered **DOM**
(`fixture.nativeElement.querySelector(...)`).

**A realistic example for this codebase — testing `RecentTasksComponent` (Section 3.10's
"dumb"/presentational example):**
```typescript
it('shows the empty state when no tasks are passed', () => {
  const fixture = TestBed.createComponent(RecentTasksComponent);
  fixture.componentRef.setInput('tasks', []);
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('All caught up! No tasks.');
});
```
**WHY presentational components (Section 3.10) are dramatically easier to unit test than smart
ones:** no services to mock, no `HttpClient` to fake — you set signal inputs directly
(`fixture.componentRef.setInput(...)`, the modern API for setting a signal `input()` from a test,
since you can't just assign to `component.tasks` the way you could an old `@Input()` property) and
assert on the render. This is precisely the payoff of the smart/dumb split discussed in Section
3.10 — it's not just an architectural nicety, it directly determines how much test setup a given
component needs.

## 20.4 Unit Testing a Service

Services with no Angular-specific dependencies (pure logic, like `permissions.util.ts`'s
functions) need **no `TestBed` at all** — just call them directly:
```typescript
it('lets a Manager edit only their own project', () => {
  const manager: CurrentUserDto = { role: 'Manager', employeeId: 7, /* … */ } as CurrentUserDto;
  expect(canEditProject(7, manager)).toBe(true);
  expect(canEditProject(8, manager)).toBe(false);
});
```
Services that inject `HttpClient` (e.g. `TaskService`) are tested via `TestBed` +
`provideHttpClientTesting()` (or the equivalent for this project's builder), which swaps the real
`HttpClient` backend for a controllable `HttpTestingController` — tests assert an expected request
was made (`httpMock.expectOne('/api/v1/tasks')`) and manually `.flush()` a fake response, rather
than hitting a real network.

## 20.5 Mocking Dependencies

The standard Angular pattern: override a provider in `TestBed.configureTestingModule({ providers:
[{ provide: TaskService, useValue: fakeTaskService }] })`, where `fakeTaskService` is a
hand-written object (or a spy library's mock) exposing just the methods the component under test
actually calls, each returning a controllable `Observable` (commonly `of(fakeData)` from RxJS, or
an RxJS `Subject` when a test needs to control *timing* — e.g., asserting a loading spinner shows
*before* the fake Observable emits).

## 20.6 What Isn't Tested Yet in This Project (and Why That's Worth Saying Honestly)

This codebase has exactly **one** spec file (`app.spec.ts`, the CLI-generated default) — no
component, service, or store in the entire application has dedicated unit tests beyond that. This
is a completely realistic state for a fast-moving practice/learning project, and — same as Section
14.14's "dead code" discussion — worth being able to discuss **honestly and specifically** in an
interview rather than glossing over: *"if I were prioritizing test coverage for this codebase
today, I'd start with `permissions.util.ts` (pure functions, zero setup, highest logic-density per
line, and the exact kind of function where a subtle boolean-logic bug would be genuinely
dangerous), then the store `computed()` chains (`TaskStore.filteredTasks` — deterministic,
pure-ish derivations, easy to assert against fixture data), before investing in full component
rendering tests."* Being able to name a **concrete, reasoned testing priority order** for a real,
imperfect codebase is a far stronger interview signal than reciting generic "always write tests"
platitudes.

---

# SECTION 21 — ~100 Interview Questions

Every answer below is intentionally concise — cross-reference the section noted for the full
depth-and-project-example version. Read these **after** the sections above, not instead of them.

## Beginner (1–15)

**1. What is Angular?** A TypeScript-first, opinionated, batteries-included SPA framework (1.1).

**2. What's the difference between AngularJS and Angular?** AngularJS (1.x) used `$scope` and
two-way `ng-model` binding with no real component model; Angular (2+) is a full rewrite around
components, TypeScript, and unidirectional data flow.

**3. What is a component?** A class + template pair controlling a DOM subtree (3.1).

**4. What is a module vs. a standalone component?** See the full comparison table, 1.12.

**5. What is data binding? Name the four types.** Interpolation, property, event, two-way (4.1–4.4).

**6. What is `@Input`/`input()`?** How a parent passes data down to a child (3.5, 3.9).

**7. What is `@Output`/`output()`?** How a child emits an event up to its parent (3.6).

**8. What's the difference between `[value]="x"` and `value="x"` in a template?** Property binding
vs. attribute — see 4.2.1's deep dive, including this exact codebase's real `<select>` bug caused
by exactly this distinction (Section 21's "Real Production Problems" #4 below).

**9. What is `ngOnInit` and why not just use the constructor?** 3.3 — inputs aren't guaranteed set
yet inside the constructor.

**10. What is a service?** A class holding logic/state that isn't UI rendering (Section 6).

**11. What is Dependency Injection?** Section 5.1 — a class declares what it needs, an Injector
supplies it.

**12. What is `providedIn: 'root'`?** App-wide singleton, tree-shakable (5.6).

**13. What is routing, and what's `<router-outlet>`?** Client-side URL-to-component mapping; the
outlet is where the matched component renders (Section 7, 1.9).

**14. What are Reactive Forms?** `FormGroup`/`FormControl` defined in the component class, not the
template (8.1).

**15. What is `HttpClient` and what does it return?** Angular's typed HTTP library; every method
returns a cold Observable (9.1, 10.4).

## Intermediate (16–35)

**16. Explain the full Angular component lifecycle in order.** 3.3/3.4's mnemonic and diagram.

**17. What's the difference between `ngOnChanges` and a signal input read in `computed()`?** 3.3's
`ngOnChanges` section — signal inputs make most `ngOnChanges` use cases unnecessary.

**18. What's the difference between `@ViewChild` and `@ContentChild`?** 3.8 — own template vs.
parent-projected content.

**19. What is content projection / `ng-content`?** 3.11, with this project's `ModalComponent`
named-slot example.

**20. Explain hierarchical dependency injection.** 5.4's tree diagram — closest injector with a
matching provider wins.

**21. What's the difference between `inject()` and constructor injection?** 5.5 — `inject()` works
in functional contexts (guards/interceptors) that have no constructor at all.

**22. What's a route guard, and name the four types discussed.** `CanActivate`, `CanDeactivate`,
`CanMatch` (7.5), plus `CanActivateChild` (same idea as `CanActivate`, applied to a route's
children specifically — not used in this codebase, whose `authGuard` on the parent shell route
already covers every child).

**23. What's the difference between a route parameter and a query parameter?** 7.4.

**24. Why does route order matter in a `Routes` array?** 7.9 — first match wins; `create` must
precede `:id`.

**25. What is lazy loading and why does it matter?** 7.3 — separate downloadable chunks, smaller
initial bundle.

**26. What does `withPreloading(PreloadAllModules)` do?** 1.8/7.3 — background-preloads every lazy
chunk after the first route renders.

**27. Explain `FormBuilder` vs. manually constructing `FormGroup`/`FormControl`.** 8.2.

**28. What's the difference between `patchValue` and `setValue`?** 8.6 — partial vs.
all-keys-required.

**29. How do you write a custom cross-field validator?** 8.4's `atLeastSomeTime` example — a
function on the `FormGroup`, not a single control.

**30. What is `HttpParams`/`HttpHeaders` immutability, and why does it matter?** 9.5 — `.set()`
returns a new instance; matches the same immutability discipline as signals.

**31. What's the difference between `PUT` and `PATCH`, and why does this project use both?** 9.2 —
full replace vs. partial update; grounded in the real Log Time bug (21's Production Problems #2).

**32. What is a cold vs. hot Observable?** 10.4 — and the practical consequence: an
un-subscribed `HttpClient` call never fires.

**33. What's the difference between `Subject` and `BehaviorSubject`?** 10.5's table — and why
signals have mostly replaced `BehaviorSubject`'s role in new code (11.9).

**34. Why must you unsubscribe from a long-lived Observable?** 10.6 — memory leaks + zombie
callbacks, with the crucial nuance that short-lived HTTP subscriptions "leak" only briefly by
comparison.

**35. What does `takeUntilDestroyed()` do, and when do you need to pass it an explicit
`DestroyRef`?** 10.9 — automatic in a component/directive's own injection context; explicit
`DestroyRef` required inside a `providedIn: 'root'` service (exactly `dashboard.service.ts`'s
`takeUntilDestroyed(this.destroyRef)`).

## Advanced (36–60)

**36. Explain `switchMap` vs. `mergeMap` vs. `concatMap` vs. `exhaustMap` with a real use case for
each.** 10.10–10.14's full comparison table and this project's search/polling examples.

**37. What does `forkJoin` do if one of its sources never completes?** 10.15 — it never emits at
all, a common gotcha.

**38. When would you choose `combineLatest` over `forkJoin`?** 10.16 — ongoing streams needing
"latest of each" vs. a fixed set of one-shot operations.

**39. What is `shareReplay(1)` actually solving, with a concrete example?** 10.19 — this project's
single-flight token refresh, in full detail, including the exact race condition it prevents.

**40. What is a signal, and how is it different from a plain class property?** 11.2 — reads
register dependents; writes notify them; a plain property has no such tracking.

**41. Why does `computed()` need no explicit dependency array, unlike (say) React's `useMemo`?**
11.3 — Angular auto-tracks whatever signals were actually read during the last execution.

**42. When should you use `effect()`, and what's the most common misuse of it?** 11.4 — side
effects only, never deriving a value other code depends on (that's `computed()`'s job); Angular
will even throw if an effect writes to a signal it also reads, without an explicit opt-in.

**43. Explain the private-writable/public-readonly store pattern and why it matters.** 6.3/11.6 —
encapsulation, exactly analogous to a private field + public getter.

**44. Signal vs. Observable — when do you use each, and how does this project draw the line?**
11.7 — "RxJS gets data in, signals hold and distribute it once it's here."

**45. What is Zone.js, and what problem does it solve?** 15.2.

**46. What does `provideZonelessChangeDetection()` remove, and what discipline does an app need
for it to work correctly?** 15.3 — every template-read reactive value must be a signal, because
plain-property mutations are invisible to a zoneless app.

**47. Why does this project set `OnPush` on every component even though it's zoneless?** 15.4 — the
natural expression of "only recheck what a signal says changed," and a guardrail against
accidental non-signal template reads.

**48. What's the difference between `markForCheck()` and `detectChanges()`?** 15.5.

**49. Explain the full interceptor request/response order, precisely.** 18.1's diagram — request
in array order, response in **reverse** array order; this project's deliberate
`tokenRefreshInterceptor`-after-`errorInterceptor` ordering exploits exactly this.

**50. Why clone an `HttpRequest` instead of mutating it?** 18.3 — immutability, same discipline as
`HttpParams`/signals.

**51. What TypeScript feature makes `Record<TaskStatus, {...}>`-style config maps in this project
"exhaustive," and why does that matter?** 14.2/14.6 — string-literal unions; TypeScript rejects the
object literal at compile time if a member of the union is missing a key.

**52. What's the difference between `unknown` and `any`, and when would you choose each?** 14.8.

**53. Explain mapped types and conditional types with this project's own `DeepPartial<T>`/
`KeysOfType<T, TProp>` examples.** 14.10/14.11.

**54. Why does this project use zero native TypeScript `enum`s?** 14.2 — bundle-cost-free
string-literal unions instead, with identical (or better) type safety.

**55. Explain the `@if (x(); as y)` narrowing pattern and why it's better than a manual `!`
non-null assertion.** 4.6 — TypeScript's control-flow analysis understands the block-scoped
narrowing natively.

**56. Why is `track` mandatory in `@for`, and what breaks if you `track $index` on a reorderable
list?** 4.6 — identity-based diffing vs. position-based diffing; local DOM state (open dropdowns,
input focus/cursor) can get silently reassigned to the wrong item.

**57. Explain the Adapter pattern this project uses for backend DTOs, with a concrete example.**
2.6/9.3 — `DashboardService`'s `toDashboardSummary()` reshaping raw `DashboardSummaryDto` into the
widget-facing `DashboardSummary`.

**58. Why does `AuthFeatureService.login()` chain directly into `getCurrentUser()` before letting
the caller's subscription complete?** 17.2 — the JWT carries no `employeeId`; ownership-scoped UI
checks need it populated before any post-login navigation.

**59. Explain the two distinct layers of authorization this project implements, and why neither
alone is sufficient.** 17.6 — route-level coarse role guards vs. per-record ownership functions in
`permissions.util.ts`; neither is a substitute for server-side enforcement.

**60. What's the actual difference between client-side JWT decoding and JWT verification, and why
does it matter?** 17.1 — decode is public/trivial (base64), verification requires the signing
secret only the server has; client-side decode is UX-only.

## Scenario-Based (61–70)

**61. "A list re-renders every single row on every update, even though only one item changed —
diagnose it."** Missing or wrong `track` in `@for` (4.6); or the store is somehow mutating the
array in place rather than producing a new reference (11.2), so the WHOLE list's identity looks
"changed" even though only one item's data actually did.

**62. "Users report a `<select>` dropdown shows the wrong option after a successful save,
even though the underlying data updated correctly (confirmed by other UI on the same page)."** The
exact bug fixed in this project's `task-detail.component.ts` — `[value]` bound directly on the
`<select>` doesn't reliably re-sync after the *browser's own* notion of "selected" has been set by
user interaction; move the binding to `[selected]` on each `<option>` instead.

**63. "An Employee-role user gets a 403 clicking a button that's visible and enabled for them."**
Client-side visibility (`@if`/`[disabled]`) is out of sync with the server's actual authorization
rule — exactly this project's real Log Time bug: the button was unconditionally visible, but the
underlying endpoint was Admin/Manager-only server-side. Fix: align the client-side gate with the
real authorization rule (17.6), and/or build a dedicated endpoint whose authorization actually
matches the intended UX (documented in this project's own `PartNineBEChannges.md`).

**64. "A dark-themed sidebar's background stops partway down the page, leaving a visible gap
before the footer, even though the CSS rules for `.sidebar` look correct."** Check whether the
styled element is actually the flex item, or whether it's nested inside an unstyled component
*host* element (this exact project's real bug — Section 15/2's `app-sidebar { display: contents;
}` fix) that isn't stretching, silently breaking the intended `align-items: stretch` behavior one
level up.

**65. "A component's view doesn't update after data clearly changed in the debugger."** In this
project specifically: is the template reading a signal (`x()`) or a plain property (`x`)? Given
zoneless change detection (15.3), a plain property mutation is invisible to the renderer entirely.

**66. "Two rapid form submissions both reach the server."** No guard against concurrent submission
— add a `saving()`-style boolean signal check at the top of the handler (10.13's `exhaustMap`
discussion, and this project's actual convention of doing this via signal guards rather than an
RxJS operator).

**67. "A search box fires a network request on every keystroke, and results sometimes arrive out
of order relative to what the user most recently typed."** Missing `debounceTime` +
`distinctUntilChanged` + `switchMap` (10.10/10.20) — exactly the pattern
`project-members.component.ts` implements correctly.

**68. "After logging out and back in as a different user, some UI briefly shows the previous
user's data."** Likely a signal/store not being reset on logout, or a stale subscription outliving
the component that should have owned it (10.6) — check `AuthService.logout()`'s scope of what it
actually clears, and audit for any `providedIn: 'root'` store holding user-specific data that
persists across a login/logout cycle.

**69. "A new field was added to a `TaskStatus`-like union, and now a status-badge feature is
missing that status."** Was a `Record<TaskStatus, {...}>` (14.6) config map used for the lookup?
If so, TypeScript should have already flagged the missing key at compile time — if it didn't,
check whether the map was typed loosely (e.g., as a plain object without the `Record<...>`
annotation), losing the exhaustiveness guarantee.

**70. "An interceptor added later isn't seeing requests another interceptor is making."** Check
registration order in `withInterceptors([...])` (18.1/18.2) — and whether the earlier interceptor
is even calling `next(req)` at all (an interceptor that fails to call `next()` short-circuits the
entire rest of the chain).

## Debugging (71–80)

**71. How do you inspect exactly which signal caused a component to re-render?** There's no
built-in "why did this render" panel the way some other frameworks offer, but you can add a
diagnostic `effect()` reading the suspect signal(s) and logging, or use Angular DevTools' profiler
(records change-detection cycles and, in recent versions, signal updates).

**72. An HTTP call never seems to fire — what's the first thing to check?** Is it actually
subscribed? (10.4 — cold Observables do nothing until subscription; a very common bug is building
the Observable and never calling `.subscribe()`.)

**73. A guard seems to be skipped entirely — why?** Check it's actually registered on the route
(`canActivate: [...]`) and that route-matching order (7.9) isn't causing a *different* route
(without the guard) to match first.

**74. `inject()` throws "must be called from an injection context" — why, and how do you fix
it?** Called outside construction (inside a `setTimeout`/`.then()`/event listener) — 5.5; capture
the dependency in a field during construction instead, or use `runInInjectionContext`.

**75. A `FormGroup`'s `.value` is missing a field you know has data in it.** The control is
disabled (8.7) — disabled controls are excluded from `.value`; use `.getRawValue()` instead.

**76. An `@for` block throws "must contain exactly one track expression" or similar at build
time.** `track` is mandatory in the new control-flow syntax (4.6) — this is a *compile-time*
enforcement, unlike the old `*ngFor`'s silently-optional `trackBy`.

**77. A component injected via `TestBed` fails because a service it depends on tries to make a
real HTTP call.** Missing a mock/override for that provider (20.5) — either provide a fake
implementation or use the HTTP testing controller instead of the real `HttpClient` backend.

**78. Angular throws `NG0100: Expression has changed after it was checked` — what does that
actually mean?** A value read during change detection changed again as a *side effect of that same
check* (commonly, a method call in a template that returns a new object/array reference every
call, or a value set inside `ngAfterViewInit` that the same pass already rendered) — Angular
detects the second, contradictory value and flags it specifically to catch this class of bug in
development.

**79. A memory profiler shows components not being garbage-collected after navigating away.**
Check for un-torn-down subscriptions (10.6/10.9) or lingering `addEventListener`s not paired with
a `DestroyRef.onDestroy()`/returned cleanup (3.3's `ngOnDestroy` discussion, `ShellComponent`'s
resize-listener example).

**80. A `PATCH` request succeeds (200) but the UI doesn't reflect the change.** Check whether the
success handler actually updates the relevant signal/store (`store.updateTask(updated)`) — a
common mistake is updating local component state instead of the shared store the rest of the app
actually reads from (6.3/11.6).

## Performance (81–88)

**81. What's the single biggest performance lever available in a large Angular app, and does this
project use it?** Lazy loading (7.3/16.1) — yes, every feature here is a separate chunk.

**82. Why is calling a plain method directly in a template worse than a `computed()` signal for
the same derived value?** 11.3/4.10 — re-invoked on every change-detection check regardless of
whether inputs changed; `computed()` is memoized and only re-runs when a tracked dependency
actually changed.

**83. When would you reach for virtual scrolling, and why doesn't this project use it yet?** 16.5 —
worth adding once a list needs to render far more rows than server-side pagination comfortably
handles; not yet needed at this project's realistic data volumes.

**84. Why does `OnPush` matter even in a zoneless app?** 15.4/15.6 — it's not really "off," it's
the natural granular-recheck default a signals-first app already wants.

**85. What's the performance risk of `ngDoCheck`, specifically?** 3.3 — runs on every single
change-detection cycle, for every instance; anything nontrivial inside it multiplies across every
pass, unlike a lazily-evaluated `computed()`.

**86. How does `shareReplay` improve performance/correctness for concurrent callers?** 10.19 — one
real HTTP call multicast to every concurrent subscriber instead of N independent, redundant calls
— this project's token-refresh race-condition fix is a real-world instance of exactly this.

**87. Why prefer `patchValue` for a large form pre-filled from an API response, performance-wise
as well as correctness-wise?** 8.6 — beyond avoiding a runtime throw, it avoids needing to
reconstruct/pass a full, exactly-shaped object just to update a subset of fields.

**88. What's the tree-shaking benefit of `providedIn: 'root'` and standalone components together,
concretely?** 1.11/5.6 — if a service/component is never actually injected/imported anywhere in the
final bundle, the compiler can prove it and drop it entirely, unlike NgModule-declared providers
which ship whenever their containing module loads, whether used or not.

## Architecture & Code Review (89–96)

**89. Explain Feature-First vs. Layer-First architecture, and why this project chose the
former.** 2.1.

**90. What's the rule for what belongs in `core/` vs. `shared/`?** 2.2/2.3 — singletons/cross-
cutting concerns vs. reusable, presentational, business-logic-free UI.

**91. Why does this project split "smart" and "dumb" components, concretely, using the dashboard
as an example?** 3.10's full tree diagram and comparison table.

**92. In a code review, you see a component directly calling `HttpClient` instead of going
through a service — what would you flag, and why?** Violates the API-layer-in-services convention
(6.2) — makes the component untestable without a real/mocked HTTP backend, duplicates URL-building
logic, and couples UI rendering code to network concerns.

**93. In a code review, you see `*ngFor` without `trackBy` in a PR touching this codebase — what
would you flag?** This codebase uses the new `@for` syntax exclusively, which makes `track`
*mandatory* at compile time (4.6) — seeing `*ngFor` at all in a PR here would itself be worth
flagging as inconsistent with the established convention, separate from the missing-`trackBy`
concern that syntax has historically enabled.

**94. In a code review, you see a service holding a `BehaviorSubject` for simple current-value
state — what would you suggest?** Given this codebase's established signals-first convention
(11.9), suggest a plain `signal()` instead — simpler read syntax, no subscription management in
consuming templates, native change-detection integration.

**95. In a code review, you see a permission check like `if (user.role === 'Manager')` duplicated
across five components instead of a shared function — what would you flag?** Extract it into
`permissions.util.ts` (17.6) — this project already has an established pattern for exactly this,
and duplicated authorization logic is a maintenance/consistency risk (a change to the rule now
needs five edits, easy to miss one).

**96. Why does this project's `PartEigthBEChanges.md`/`PartNineBEChannges.md`-style documentation
pattern matter architecturally?** It draws an explicit line between "what the frontend can/does do
today" and "what requires a backend contract change," preventing frontend code from silently
faking a capability the backend doesn't actually support yet (or shipping something that will
break once the backend catches up) — a real-world pattern for frontend/backend teams iterating in
parallel.

## Real Production Problems From This Codebase (97–103)

**97. The "half sidebar" CSS bug.** Root cause: `<app-sidebar>`'s host element (not the `<aside
class="sidebar">` inside it) was `.ems-body`'s actual flex item, and the unstyled host didn't
stretch, so its content-sized `<aside>` inside it left a visible gap. Fix: `app-sidebar { display:
contents; }`. **The general lesson:** when a component-wrapped element's CSS "should obviously
work" but doesn't visually, check whether you're styling the actual box the layout system is
positioning, or a *descendant* of it — see the full write-up if this exact scenario comes up.

**98. The "Employee can't log time" bug.** The Log Time feature reused a full `PUT /tasks/{id}`
(Admin/Manager-only server-side) instead of a dedicated, correctly-authorized endpoint — a
textbook case of client-side UI (a visible, enabled button) not matching server-side authorization
reality (17.6/21-Q63). Fixed by designing a proper `POST /tasks/{id}/time-logs` endpoint with
authorization matching the actual intended UX, documented for the backend team rather than
silently worked around client-side.

**99. The `<select>` `[value]` binding bug.** Covered in full in Q62/4.6 — `[value]` on a
`<select>` built from `@for` options doesn't reliably re-sync after the browser's own selection
state diverges from Angular's last-written value; `[selected]` per-`<option>` is the reliable fix.

**100. The missing mention-notification link bug.** `NotificationService.NotifyUserAsync`'s email
path had a `link` parameter available but never used it in the actual email body — a good example
of a "the data is right there, just not wired to the final output" bug, the kind static analysis
won't catch (the parameter genuinely was used, just only for the in-app `Notification` row, not
the email) but a careful reading of the actual method body immediately reveals.

**101. Native browser dialogs (`confirm()`/`prompt()`/`alert()`) used throughout a codebase
that already has a proper, unused `ConfirmDialogService`.** A realistic "built the right
infrastructure, never finished wiring it up everywhere" situation — 14 separate call sites across
this codebase needed the exact same mechanical fix (inject the service, `await` its Promise,
branch on the boolean) once someone actually went looking for every `confirm(` call via a global
search rather than assuming it had already been done.

**102. An admin dashboard showing organization-wide data to every role, including Employees who
should only see their own work.** Not a "bug" exactly, but a missing role-awareness feature — the
underlying `GET /api/v1/dashboard` endpoint had no per-role scoping at all. Solved on the frontend
by *not* using that endpoint for the Employee role at all, instead composing an equivalent
personalized view from two endpoints (`GET /tasks`, `GET /projects`) that **were already** properly
role-scoped server-side — a good example of working around a backend gap using capabilities that
already exist elsewhere in the API, while still documenting the ideal long-term fix for the
backend team rather than treating the workaround as permanent.

**103. A utility file (`utils/types.util.ts`) full of well-written, advanced TypeScript patterns
that turned out to be completely unused.** 14.14 — a realistic technical-debt scenario, and a good
prompt for demonstrating you'd verify with actual usage-search tooling before either deleting it
or continuing to build on top of it.

---

# SECTION 22 — Project-Specific Concept Map

## 22.1 Component/Service Reference Table

| File | Why it exists | Key Angular concepts | RxJS operators | Lifecycle hooks |
|---|---|---|---|---|
| `app.ts` | Root component, hosts the router outlet | Standalone component, `RouterOutlet` | — | — |
| `app.config.ts` | Wires every app-wide provider | Feature providers, functional interceptors, zoneless CD | — | — |
| `AuthService` | Token/session state singleton | `providedIn:'root'`, signals, `computed()` | — | — |
| `AuthFeatureService` | Real auth API surface | DI composition (wraps `AuthService`+`TokenRefreshService`) | `map`, `tap`, `switchMap` | — |
| `TokenRefreshService` | Single-flight token refresh | DI, immutability | `map`, `tap`, `shareReplay`, `finalize`, `throwError` | — |
| `authInterceptor`/`errorInterceptor`/`tokenRefreshInterceptor`/`loggingInterceptor` | Cross-cutting HTTP concerns | Functional interceptors, `inject()` in a non-class context | `catchError`, `switchMap`, `throwError`, `tap` | — |
| `authGuard`/`roleGuard` | Route-level authorization | Functional guards, `CanActivateFn`, `UrlTree` redirects | — | — |
| `TaskStore`/`ProjectStore`/`EmployeeStore` | Feature-scoped shared state | `providedIn:'root'`, private-writable/public-readonly signals, `computed()` chains | (delegates HTTP to the matching `*.service.ts`) | — |
| `TaskService`/`ProjectService`/etc. | Typed REST API layer | Generics (`Observable<T>`, `ApiResponse<T>`), `HttpParams` immutability | `map` | — |
| `DashboardComponent` | Smart/container for the dashboard page | `computed()`, `effect()`, role-based branching, signal inputs to children | (delegates to `DashboardService`) | constructor-based init (no `ngOnInit` needed) |
| `DashboardService` | Dashboard data + adapter layer | `providedIn:'root'`, DTO→UI-shape adapter functions, `takeUntilDestroyed(this.destroyRef)` | `forkJoin`, `takeUntilDestroyed` | — |
| `StatsCardComponent`/`RecentTasksComponent`/etc. | Dumb/presentational widgets | Signal `input()`, `OnPush`, zero injected services | — | — |
| `TaskDetailComponent` | Smart component for one task | `computed()` over a store, Reactive Forms (`FormGroup`+custom validator), `ModalComponent` content projection | (delegates to services) | `ngOnInit` |
| `TaskCommentsComponent` | Comment thread + @mention autocomplete | `input.required()`, `@ViewChild`, manual caret-position DOM work | — | `ngOnInit`, (implicitly `AfterViewInit`-timed via `@ViewChild` usage) |
| `NotificationBellComponent` | Polling unread-count + dropdown | `@HostListener`, `ElementRef`, `providedIn:'root'` service | `merge`, `interval`, `startWith`, `switchMap`, `takeUntilDestroyed` | `ngOnInit` |
| `ProfileMenuComponent` | Click-outside-to-close account menu | `@HostListener('document:click')`, `ElementRef`, `computed()` | — | — |
| `SidebarComponent` | Role-filtered navigation | `computed()` over `AuthService.currentUser`, role-array filtering | — | — |
| `AvatarCropModalComponent` | Reusable image-crop-before-upload | `@ViewChild`, Canvas 2D API, Pointer Events, `output<Blob>()` | — | `ngOnInit`, `ngOnDestroy` |
| `ConfirmDialogService`/`ConfirmDialogComponent` | Reusable Promise-based confirm dialog, replacing `confirm()` | `createComponent()` (dynamic component creation), Promise-wrapping a UI interaction | — | — |
| `date-format.pipe.ts`/`currency-format.pipe.ts` | Reusable, memoized formatting | Pure pipes | — | — |
| `permissions.util.ts` | Per-record authorization rules | Pure functions, no Angular dependencies at all | — | — |

## 22.2 Complete Request Lifecycle Walkthrough #1 — Dashboard Load (Admin Path)

```
1. Router matches /dashboard → lazy-loads dashboard.routes.ts → DashboardComponent
2. DashboardComponent's constructor runs:
     - inject(DashboardService), inject(AuthService)
     - isEmployee computed once (role check)
     - three effect()s registered (logging, admin path / employee path / errors)
     - this.dashService.loadDashboard() called (role !== 'Employee')
3. DashboardService.loadDashboard():
     - _loading.set(true)
     - http.get<ApiResponse<DashboardSummaryDto>>('/api/v1/dashboard')
         → authInterceptor attaches Bearer token
         → errorInterceptor/tokenRefreshInterceptor pass through (no error)
         → loggingInterceptor times the call
         → real network request to the backend
     - .pipe(takeUntilDestroyed(this.destroyRef)) — service-level cleanup ties this to the SERVICE's
       lifetime (root singleton — effectively "the whole app session"), not the component's
     - .subscribe({ next: res => { _summary.set(toDashboardSummary(res.data)); _loading.set(false); } })
4. toDashboardSummary() (the Adapter, Section 2.6/9.3) reshapes the raw DTO into widget-facing shapes
5. _summary signal updates → every computed() reading it (stats, employees, projects, tasks,
   hasData in DashboardComponent) is marked dirty
6. Because this app is zoneless (Section 15.3), Angular schedules a change-detection check for
   EXACTLY the components whose template reads one of those now-dirty computed signals — not a
   tree-wide sweep
7. DashboardComponent's template re-renders: skeleton (@if !hasData()) replaced by real stat cards,
   quick actions, recent employees/tasks/projects — each dumb child component receives its slice
   via a signal input ([employees]="employees()")
8. effect() (registered in step 2) runs asynchronously after the signal settle, logging the load
```

## 22.3 Complete Request Lifecycle Walkthrough #2 — Changing a Task's Status

```
1. User selects a new option in TaskDetailComponent's status <select>
2. (change) fires → onStatusChange(event) reads event.target.value as TaskStatus
3. Guard: if (!t || changingStatus() || newStatus === t.status) return;  ← prevents redundant/concurrent calls
4. changingStatus.set(true)
5. taskService.patchStatus(t.id, { status: newStatus })
     → PATCH /api/v1/tasks/{id}/status
     → authInterceptor attaches token; loggingInterceptor times it; (no error path taken)
6. .subscribe({ next: updated => { store.updateTask(updated); changingStatus.set(false); } })
7. TaskStore.updateTask(updated):
     _tasks.update(list => list.map(t => t.id === updated.id ? updated : t))   ← NEW array reference
     if (_selectedTask()?.id === updated.id) _selectedTask.set(updated)         ← also updates the detail signal
8. TaskDetailComponent's `task = computed(() => store.selectedTask())` is now dirty
9. Template re-renders: the header badge ([class]="statusConfig[t.status].badge") updates because
   it reads t.status from the SAME computed signal that just changed
10. The <select>'s [selected] binding on each <option> (Section 21 Q62's fix) re-evaluates per
    option, correctly reflecting the new t.status this time
```

## 22.4 Complete Request Lifecycle Walkthrough #3 — Login

Fully detailed already in Section 17.2 — included here for completeness of "the full list of
walkthroughs," not repeated verbatim.

## 22.5 How to Use Section 22 in an Interview

If asked "walk me through what happens when [some action] occurs in your app," the shape of the
answer is always the same three-part structure demonstrated above: **(1) what triggers it
(event/lifecycle/route), (2) what Angular/RxJS machinery carries the request to the backend and
the response back, (3) how the response becomes new signal state and what that state change causes
to re-render.** Being able to produce this structure for *any* interaction in a codebase you know
well is a far stronger signal than memorizing definitions in isolation.

---

# SECTION 23 — Learning Roadmap

## Level 1 — Must Know (before any Angular interview at all)

- Components, templates, `@if`/`@for`/`@switch` ⭐⭐⭐⭐⭐ (Sections 3, 4)
- `@Input()`/`input()`, `@Output()`/`output()`, component communication ⭐⭐⭐⭐⭐ (3.5–3.9)
- Services + `providedIn: 'root'` ⭐⭐⭐⭐⭐ (Sections 5, 6)
- Basic routing, route params, lazy loading ⭐⭐⭐⭐⭐ (Section 7)
- Reactive Forms basics — `FormGroup`, `FormControl`, `Validators` ⭐⭐⭐⭐⭐ (Section 8)
- `HttpClient` basics — GET/POST, typed responses ⭐⭐⭐⭐⭐ (Section 9)
- The component lifecycle, in order ⭐⭐⭐⭐⭐ (3.3)

## Level 2 — Interview Ready (2–3 years experience target)

- Full RxJS operator vocabulary — `switchMap` family, `forkJoin`, `debounceTime` ⭐⭐⭐⭐⭐ (Section 10)
- Signals — `signal()`, `computed()`, `effect()`, and Signal-vs-Observable judgment ⭐⭐⭐⭐⭐ (Section 11)
- Guards (`CanActivate`/`CanDeactivate`/`CanMatch`) and interceptors, including chain order ⭐⭐⭐⭐⭐ (7.5, Section 18)
- `OnPush` change detection and why it matters ⭐⭐⭐⭐⭐ (15.4)
- TypeScript generics, utility types, union types as enum-replacements ⭐⭐⭐⭐ (Section 14)
- Smart vs. dumb component architecture ⭐⭐⭐⭐ (3.10)
- JWT auth flow, token storage trade-offs, refresh-token rotation ⭐⭐⭐⭐⭐ (Section 17)
- Error handling layering (global/interceptor/component/field) ⭐⭐⭐⭐ (Section 19)

## Level 3 — Production Level

- Zoneless change detection and what it demands of an app's architecture ⭐⭐⭐⭐⭐ (Section 15)
- `shareReplay`/single-flight patterns for real concurrency bugs ⭐⭐⭐⭐⭐ (10.19, 17.4)
- Feature-First architecture and the `core`/`shared`/`features` boundary rules ⭐⭐⭐⭐ (Section 2)
- Per-record authorization vs. route-level authorization, and why client-side checks are UX-only ⭐⭐⭐⭐⭐ (17.6)
- Diagnosing real bugs from first principles (host-element flex-item bugs, `[value]`-on-`<select>`
  sync bugs, PUT-vs-PATCH authorization mismatches) ⭐⭐⭐⭐⭐ (Section 21's "Real Production Problems")
- Testing strategy and priority — what to test first in an imperfect, real codebase ⭐⭐⭐ (Section 20)

## Level 4 — Senior Angular Developer

- Explaining *why* Angular's DI, change detection, and signal system are built the way they are —
  not just what they do (Sections 5, 11, 15 in full)
- Recognizing and articulating technical debt (dead utility files, unfinished infrastructure like
  an unwired `ConfirmDialogService`) without either ignoring it or over-reacting to it (14.14, 21 Q101)
- Making and defending architectural trade-off calls — signals vs. NgRx (11.10), `sessionStorage`
  vs. `localStorage` vs. `HttpOnly` cookies (17.3), when virtual scroll/`NgOptimizedImage` genuinely
  earn their complexity vs. when they don't (Section 16)
- Designing a clean frontend/backend contract boundary and documenting exactly what's needed from
  the other side, the way this project's own `PartEigthBEChanges.md`/`PartNineBEChannges.md` do
- Comfortably walking through a complete request lifecycle, end to end, for any feature in a
  codebase you've actually worked in (Section 22)

## Most Frequently Asked Topics — The ⭐⭐⭐⭐⭐ List, Consolidated

1. Component lifecycle hooks, in order
2. `@Input`/`@Output` and parent-child communication
3. Dependency Injection — hierarchy, `providedIn`, `inject()`
4. Change detection — `OnPush`, Zone.js, and (increasingly, as more teams adopt it) zoneless/signals
5. RxJS — `switchMap` vs. `mergeMap` vs. `concatMap` vs. `exhaustMap`, unsubscribe/memory leaks
6. Signals — `signal()`/`computed()`/`effect()`, and when to use them vs. Observables
7. Routing — guards, lazy loading, route params vs. query params
8. Reactive Forms — validation, `FormGroup`/`FormArray`, `patchValue` vs. `setValue`
9. HTTP interceptors — order of execution, JWT attachment, global error handling
10. Authentication — JWT storage, refresh tokens, role-based access

---

## Closing Note

Every code example in this document is real, taken directly from this repository — not adapted
from a tutorial. When you're asked an Angular question in an interview, you now have two answers
available: the textbook definition, **and** a concrete example of exactly how (and why) this
project actually implements it, including the real bugs that got found and fixed along the way.
The second kind of answer is what separates "I read about this" from "I've actually built with
this" — lean on it.

