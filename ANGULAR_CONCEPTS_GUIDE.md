# 🎓 Angular 22 Concepts - Interview Preparation Guide

This document explains all Angular concepts used in this project with WHY explanations for interviews.

---

## 📚 TABLE OF CONTENTS

1. [Reactive Forms](#reactive-forms)
2. [Signals](#signals)
3. [Component Communication](#component-communication)
4. [Dependency Injection](#dependency-injection)
5. [Routing & Lazy Loading](#routing--lazy-loading)
6. [Feature-First Architecture](#feature-first-architecture)
7. [Angular 22 New Control Flow](#angular-22-new-control-flow)
8. [TypeScript Best Practices](#typescript-best-practices)
9. [State Management Patterns](#state-management-patterns)
10. [Observable Patterns](#observable-patterns)

---

## 1. Reactive Forms

### What Are Reactive Forms?

Reactive forms use an **explicit, model-driven approach** to manage form state and validation in TypeScript code.

### Code Example

```typescript
// task-form.component.ts
export class TaskFormComponent {
  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.group({
    title:          ['', [Validators.required, Validators.maxLength(200)]],
    description:    ['', Validators.maxLength(1000)],
    priority:       ['Medium' as TaskPriority, Validators.required],
    projectId:      [0, [Validators.required, Validators.min(1)]],
    dueDate:        ['', Validators.required],
    estimatedHours: [0, [Validators.required, Validators.min(1)]]
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // Show all errors
      return;
    }
    const dto = this.form.getRawValue(); // Get form data
    // ... save logic
  }
}
```

### WHY Use Reactive Forms?

1. **Explicit Control**: Form structure defined in TypeScript (testable, refactorable)
2. **Type Safety**: Strongly typed with TypeScript interfaces
3. **Validation**: Declarative validators, easy to compose custom validators
4. **Dynamic Forms**: Easy to add/remove controls programmatically
5. **Immutability**: Form state changes are trackable and reversible
6. **Testing**: Unit testable without DOM

### Key Components

| Component      | Purpose                                     | Example                                   |
|----------------|---------------------------------------------|-------------------------------------------|
| `FormBuilder`  | Factory to create FormGroup/FormControl     | `fb.group({ name: [''] })`                |
| `FormGroup`    | Container for multiple FormControls         | Represents entire form                    |
| `FormControl`  | Single form field                           | `new FormControl('', Validators.required)`|
| `Validators`   | Built-in validation functions               | `required`, `min`, `max`, `maxLength`     |

### Validation Pattern

```typescript
// Check if field is invalid
isInvalid(fieldName: string): boolean {
  const field = this.form.get(fieldName);
  return !!(field?.invalid && field?.touched);
}

// Get error message
getErrorMessage(fieldName: string): string {
  const field = this.form.get(fieldName);
  if (!field || !field.errors) return '';
  if (field.errors['required']) return `${fieldName} is required`;
  if (field.errors['maxLength']) return `${fieldName} is too long`;
  return 'Invalid value';
}
```

### HTML Binding

```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <input
    type="text"
    formControlName="title"
    [class.is-invalid]="isInvalid('title')">
  @if (isInvalid('title')) {
    <div class="invalid-feedback">{{ getErrorMessage('title') }}</div>
  }
</form>
```

### Interview Questions

**Q: Reactive vs Template-Driven Forms?**
- **Reactive**: Explicit, TypeScript-based, better for complex validation, dynamic forms, testable
- **Template-Driven**: Implicit, HTML-based, simpler for basic forms, less control

**Q: How do you create a custom validator?**
```typescript
function minDateValidator(minDate: Date): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = new Date(control.value);
    return value < minDate ? { minDate: { minDate, actual: value } } : null;
  };
}
```

---

## 2. Signals

### What Are Signals?

Signals are Angular's **new reactive primitive** (Angular 16+, mature in 22) that track state changes and automatically update dependent computations.

### Code Example

```typescript
// task.store.ts
export class TaskStore {
  // Private writable signals (internal state)
  private readonly _tasks = signal<Task[]>([]);
  private readonly _loading = signal(false);
  private readonly _searchQuery = signal('');

  // Public readonly signals (external access)
  readonly tasks = asReadonly(this._tasks);
  readonly loading = asReadonly(this._loading);

  // Computed signals (derived state, auto-updates)
  readonly filteredTasks = computed(() => {
    const query = this._searchQuery().toLowerCase();
    return this._tasks().filter(t =>
      t.title.toLowerCase().includes(query)
    );
  });

  // Actions (state updates)
  loadTasks(): void {
    this._loading.set(true);
    this.taskService.getAll().subscribe(tasks => {
      this._tasks.set(tasks);
      this._loading.set(false);
    });
  }

  setSearchQuery(query: string): void {
    this._searchQuery.set(query); // Triggers filteredTasks recalculation
  }
}
```

### WHY Use Signals?

1. **Automatic Dependency Tracking**: No manual subscriptions
2. **Fine-Grained Reactivity**: Only re-renders affected components
3. **Simpler Syntax**: `count()` instead of `count$.getValue()`
4. **Performance**: Change detection optimized at granular level
5. **Type Safety**: Better TypeScript inference than RxJS Subjects
6. **Immutability**: Readonly enforcement prevents accidental mutations

### Signal Types

| Type                | Purpose                              | Example                          |
|---------------------|--------------------------------------|----------------------------------|
| `signal<T>`         | Writable signal                      | `signal<number>(0)`              |
| `asReadonly()`      | Make signal readonly                 | `asReadonly(this._count)`        |
| `computed()`        | Derived signal (auto-recalculates)   | `computed(() => count() * 2)`    |
| `effect()`          | Side effect when signal changes      | `effect(() => console.log(val))`|

### Signal vs BehaviorSubject

```typescript
// OLD WAY: RxJS BehaviorSubject
private _tasks$ = new BehaviorSubject<Task[]>([]);
readonly tasks$ = this._tasks$.asObservable();

getTasks(): Task[] {
  return this._tasks$.getValue(); // Verbose
}

// NEW WAY: Signals
private readonly _tasks = signal<Task[]>([]);
readonly tasks = asReadonly(this._tasks);

// Access: this.tasks() - Clean!
```

### Interview Questions

**Q: When to use Signals vs RxJS?**
- **Signals**: Synchronous state, component-level state, derived calculations
- **RxJS**: Async streams, HTTP requests, complex event pipelines, debounce/throttle

**Q: Can Signals replace RxJS?**
- No, they complement each other. Use RxJS for HTTP, Signals for state.

---

## 3. Component Communication

### Patterns Used

#### 1. Store Pattern (Preferred in this project)

```typescript
// Smart Component (Container)
export class TaskListComponent {
  protected readonly store = inject(TaskStore);

  onSearch(query: string): void {
    this.store.setSearchQuery(query); // Update store
  }
}

// Template reads from store
{{ store.filteredTasks().length }} tasks
```

**WHY**: Single source of truth, unidirectional data flow, testable

#### 2. Input/Output (Traditional)

```typescript
// Child Component
export class TaskCardComponent {
  @Input() task!: Task;
  @Output() delete = new EventEmitter<number>();

  onDelete(): void {
    this.delete.emit(this.task.id);
  }
}

// Parent Template
<app-task-card
  [task]="task"
  (delete)="onTaskDelete($event)" />
```

#### 3. Service Communication

```typescript
// Shared Service
@Injectable({ providedIn: 'root' })
export class TaskService {
  private taskDeleted$ = new Subject<number>();
  
  onTaskDeleted = this.taskDeleted$.asObservable();
  
  notifyDelete(id: number): void {
    this.taskDeleted$.next(id);
  }
}
```

### Smart vs Dumb Components

| Type            | Responsibility                          | Example                 |
|-----------------|-----------------------------------------|-------------------------|
| **Smart**       | Inject services, manage state, logic    | `TaskListComponent`     |
| **Dumb**        | Receive data via @Input, emit via @Output | `TaskCardComponent`   |

**WHY**: Separation of concerns, reusability, testability

### Interview Questions

**Q: What's the difference between @Input and Signal Input?**
```typescript
// Old way
@Input() task!: Task;

// New way (Angular 17+)
task = input.required<Task>();
```

---

## 4. Dependency Injection

### What Is DI?

Angular's **Dependency Injection** system provides instances of classes (services) to components/services that need them, instead of manual instantiation.

### Code Example

```typescript
// Service
@Injectable({ providedIn: 'root' }) // Singleton
export class TaskService {
  private readonly http = inject(HttpClient);
  
  getAll(): Observable<Task[]> {
    return this.http.get<Task[]>('/api/tasks');
  }
}

// Component (Modern inject() syntax)
export class TaskListComponent {
  private readonly taskService = inject(TaskService);
  private readonly router = inject(Router);
  
  ngOnInit(): void {
    this.taskService.getAll().subscribe(tasks => {
      // ...
    });
  }
}

// Component (Constructor injection - older syntax)
export class TaskListComponent {
  constructor(
    private taskService: TaskService,
    private router: Router
  ) {}
}
```

### Injection Scopes

| Scope                     | Lifespan                        | Use Case                     |
|---------------------------|---------------------------------|------------------------------|
| `providedIn: 'root'`      | Application-wide singleton      | Services, Stores             |
| `providedIn: 'platform'`  | Shared across apps (microfrontends) | Rare                     |
| Component providers       | One instance per component      | Component-specific state     |

### WHY Use DI?

1. **Testability**: Mock services in unit tests
2. **Modularity**: Swap implementations easily
3. **Loose Coupling**: Components don't know how services are created
4. **Lifecycle Management**: Angular handles instantiation and cleanup

### inject() vs Constructor

```typescript
// Modern: inject()
export class MyComponent {
  private readonly svc = inject(MyService);
}

// Traditional: constructor
export class MyComponent {
  constructor(private svc: MyService) {}
}
```

**WHY use inject()**:
- Shorter syntax
- Works in functions (not just constructors)
- Can conditionally inject based on environment
- Required for functional guards/interceptors

### Interview Questions

**Q: How do you provide a service in a lazy-loaded module?**
```typescript
@Injectable() // No providedIn
export class FeatureService {}

// In routes
{ path: 'feature', loadComponent: ..., providers: [FeatureService] }
```

**Q: What's the difference between providedIn root vs component providers?**
- **root**: Single instance for entire app
- **component**: New instance for each component instance

---

## 5. Routing & Lazy Loading

### Lazy Loading Pattern

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'tasks',
    loadComponent: () =>
      import('./features/tasks/task-list/task-list.component')
        .then(c => c.TaskListComponent)
  }
];
```

**WHY**: Bundle splitting, faster initial load, load features on-demand

### Nested Routes

```typescript
// tasks.routes.ts
export const TASK_ROUTES: Routes = [
  { path: '', component: TaskListComponent },
  { path: 'create', component: TaskFormComponent },  // Must be before :id
  { path: ':id', component: TaskDetailComponent },
  { path: ':id/edit', component: TaskFormComponent }
];
```

**Route Order Matters**: Static paths (`create`) before dynamic params (`:id`)

### Reading Route Params

```typescript
export class TaskDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    // or reactive:
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
    });
  }
}
```

### Navigation

```typescript
// Programmatic
this.router.navigate(['/tasks', taskId, 'edit']);
this.router.navigateByUrl('/tasks');

// Template
<a [routerLink]="['/tasks', task.id]">View</a>
<a routerLink="/tasks/create">New</a>
```

### Route Guards

```typescript
// auth.guard.ts
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  return authService.isLoggedIn() || inject(Router).createUrlTree(['/login']);
};

// In routes
{ path: 'admin', canActivate: [authGuard], ... }
```

### Interview Questions

**Q: What's the difference between snapshot and observable params?**
- **snapshot**: One-time read, good when route doesn't reuse component
- **observable**: Continuous updates, required when navigating from same component to same component with different params

**Q: How do you prevent navigation?**
Use `CanDeactivate` guard to check for unsaved changes.

---

## 6. Feature-First Architecture

### Structure

```
features/
  tasks/
    components/       ← UI components
    services/         ← Data access layer
    store/            ← State management
    models/           ← TypeScript interfaces
    data/             ← Mock data
    tasks.routes.ts   ← Feature routes
```

### WHY Feature-First?

1. **Scalability**: Each feature is self-contained module
2. **Clarity**: All related code in one folder
3. **Team Collaboration**: Features owned by different teams
4. **Lazy Loading**: Easy to split by feature
5. **Maintenance**: Changes isolated to feature folder

### Alternative: Layer-First (Not Used Here)

```
components/  ← All components
services/    ← All services
models/      ← All models
```

**Problem**: Hard to navigate as app grows, unclear feature boundaries

### Interview Questions

**Q: When to use feature-first vs layer-first?**
- **Feature-first**: Large apps, multiple teams, clear domain boundaries
- **Layer-first**: Small apps, single team, shared logic across features

---

## 7. Angular 22 New Control Flow

### Old vs New Syntax

#### Conditionals

```html
<!-- OLD: *ngIf -->
<div *ngIf="loading; else content">Loading...</div>
<ng-template #content>
  <div *ngIf="tasks.length > 0; else empty">...</div>
</ng-template>

<!-- NEW: @if -->
@if (loading) {
  <div>Loading...</div>
} @else if (tasks.length > 0) {
  <div>Tasks list</div>
} @else {
  <div>No tasks</div>
}
```

#### Loops

```html
<!-- OLD: *ngFor -->
<div *ngFor="let task of tasks; trackBy: trackById">
  {{ task.title }}
</div>

<!-- NEW: @for -->
@for (task of tasks; track task.id) {
  <div>{{ task.title }}</div>
} @empty {
  <div>No tasks found</div>
}
```

#### Switch

```html
<!-- OLD: *ngSwitch -->
<div [ngSwitch]="status">
  <span *ngSwitchCase="'Active'">🟢</span>
  <span *ngSwitchCase="'Inactive'">🔴</span>
  <span *ngSwitchDefault>⚪</span>
</div>

<!-- NEW: @switch -->
@switch (status) {
  @case ('Active') { <span>🟢</span> }
  @case ('Inactive') { <span>🔴</span> }
  @default { <span>⚪</span> }
}
```

### WHY New Syntax?

1. **Performance**: Built-in, not directive overhead
2. **Readability**: Cleaner, less nesting
3. **Type Safety**: Better TypeScript checking
4. **@empty Block**: No need for ng-template
5. **Consistency**: Matches other frameworks (React, Vue)

### Interview Questions

**Q: Can you mix old and new control flow?**
Yes, but discouraged. Migrate progressively.

**Q: What's the track expression in @for?**
Unique identifier for each item, optimizes rendering (like trackBy in *ngFor).

---

## 8. TypeScript Best Practices

### Strong Typing

```typescript
// Models
export interface Task {
  id: number;
  title: string;
  status: TaskStatus;  // Union type
  dueDate: string;
}

export type TaskStatus = 'Todo' | 'InProgress' | 'InReview' | 'Done';

// Generics
export class MockDataService {
  getAll<T extends Entity>(items: T[]): Observable<T[]> {
    return of([...items]).pipe(delay(300));
  }
}
```

### Readonly & Private

```typescript
export class TaskStore {
  // Private (internal only)
  private readonly _tasks = signal<Task[]>([]);
  
  // Public readonly (external access, no mutation)
  readonly tasks = asReadonly(this._tasks);
  
  // Public method (controlled mutation)
  addTask(task: Task): void {
    this._tasks.update(current => [...current, task]);
  }
}
```

### Type vs Interface

```typescript
// Interface (preferred for objects)
export interface User {
  id: number;
  name: string;
}

// Type (for unions, primitives, tuples)
export type Status = 'active' | 'inactive';
export type Coords = [number, number];
```

### Never Use `any`

```typescript
// BAD
function process(data: any) { ... }

// GOOD
function process(data: unknown) {
  if (typeof data === 'string') {
    // TypeScript knows data is string here
  }
}

// BEST
function process<T>(data: T): T { ... }
```

### Interview Questions

**Q: Difference between interface and type?**
- **Interface**: Extendable, for object shapes, better error messages
- **Type**: Unions, intersections, mapped types, primitives

---

## 9. State Management Patterns

### Store Pattern (Used in Project)

```typescript
@Injectable({ providedIn: 'root' })
export class TaskStore {
  // 1. Private writable state
  private readonly _tasks = signal<Task[]>([]);
  private readonly _loading = signal(false);
  
  // 2. Public readonly accessors
  readonly tasks = asReadonly(this._tasks);
  readonly loading = asReadonly(this._loading);
  
  // 3. Computed derived state
  readonly stats = computed(() => ({
    total: this._tasks().length,
    done: this._tasks().filter(t => t.status === 'Done').length
  }));
  
  // 4. Actions (only way to mutate)
  loadTasks(): void {
    this._loading.set(true);
    this.service.getAll().subscribe(tasks => {
      this._tasks.set(tasks);
      this._loading.set(false);
    });
  }
}
```

### WHY Store Pattern?

1. **Single Source of Truth**: All state in one place
2. **Unidirectional Data Flow**: State → View → Action → State
3. **Immutability**: State changes are explicit
4. **Testability**: Mock store for component tests
5. **Debuggability**: All mutations in actions

### Alternative Patterns

| Pattern           | Use Case                                    |
|-------------------|---------------------------------------------|
| **NgRx**          | Large apps, complex state, time-travel debugging |
| **Akita**         | Medium apps, simpler than NgRx              |
| **Services**      | Small apps, direct state in services        |
| **Signals Store** | Modern, lightweight (this project)          |

### Interview Questions

**Q: When to use local state vs global store?**
- **Local**: Component-specific, doesn't affect others (form state)
- **Global**: Shared across components (user session, cart)

---

## 10. Observable Patterns

### Basic RxJS

```typescript
// HTTP Request
this.http.get<Task[]>('/api/tasks').subscribe({
  next: tasks => console.log(tasks),
  error: err => console.error(err),
  complete: () => console.log('Done')
});

// With operators
this.http.get<Task[]>('/api/tasks').pipe(
  map(tasks => tasks.filter(t => t.status === 'Active')),
  catchError(err => {
    console.error(err);
    return of([]); // Fallback
  })
).subscribe(tasks => this.tasks.set(tasks));
```

### Common Operators

| Operator        | Purpose                              | Example                          |
|-----------------|--------------------------------------|----------------------------------|
| `map`           | Transform each value                 | `map(x => x * 2)`                |
| `filter`        | Keep values matching condition       | `filter(x => x > 10)`            |
| `debounceTime`  | Wait X ms before emitting            | `debounceTime(300)` (search)     |
| `switchMap`     | Cancel previous, switch to new       | `switchMap(id => getUser(id))`   |
| `catchError`    | Handle errors                        | `catchError(err => of([]))`      |
| `tap`           | Side effects without changing value  | `tap(val => console.log(val))`   |

### Memory Leaks Prevention

```typescript
// BAD: No unsubscribe
ngOnInit() {
  this.service.getData().subscribe(data => this.data = data);
}

// GOOD: Unsubscribe manually
private sub = new Subscription();

ngOnInit() {
  this.sub.add(
    this.service.getData().subscribe(data => this.data = data)
  );
}

ngOnDestroy() {
  this.sub.unsubscribe();
}

// BETTER: AsyncPipe (auto-unsubscribes)
data$ = this.service.getData();
// In template: {{ data$ | async }}

// BEST: takeUntilDestroyed (Angular 16+)
ngOnInit() {
  this.service.getData()
    .pipe(takeUntilDestroyed())
    .subscribe(data => this.data = data);
}
```

### Interview Questions

**Q: Difference between map and switchMap?**
- **map**: Transform value (synchronous)
- **switchMap**: Transform to new Observable, cancel previous (async, like dependent HTTP requests)

**Q: When to use Subject vs BehaviorSubject?**
- **Subject**: No initial value, multicast
- **BehaviorSubject**: Has initial value, replays last value to new subscribers

---

## 🎯 INTERVIEW TIPS

### Common Angular Questions

1. **What's new in Angular 22?**
   - Signals maturity, new control flow, standalone by default, improved performance

2. **Explain Angular lifecycle hooks**
   - `ngOnInit`: Initialization logic
   - `ngOnDestroy`: Cleanup (unsubscribe)
   - `ngOnChanges`: When @Input changes
   - `ngAfterViewInit`: After view rendered

3. **What's change detection?**
   - Angular checks if component state changed and updates DOM
   - Zone.js triggers checks
   - OnPush strategy: only check when @Input changes or events fire

4. **Explain standalone components**
   - No NgModule required
   - Import dependencies directly in component
   - Simpler, better tree-shaking

5. **How do you optimize performance?**
   - Lazy loading, OnPush change detection, trackBy in @for, avoid heavy computations in templates, use Signals for fine-grained reactivity

---

## 📚 Resources

- [Angular Official Docs](https://angular.dev)
- [RxJS Documentation](https://rxjs.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Angular Signals Guide](https://angular.dev/guide/signals)

---

**Good luck with your interviews! 🚀**
