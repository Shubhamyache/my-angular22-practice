# 🏛️ Enterprise Angular Architecture Guide

## Complete Clean Architecture Implementation

This guide explains the production-ready enterprise architecture implemented in this Angular application.

---

## 📚 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Folder Structure](#folder-structure)
3. [Reusable Components](#reusable-components)
4. [Content Projection](#content-projection)
5. [Inputs & Outputs](#inputs--outputs)
6. [Signals & State Management](#signals--state-management)
7. [Dependency Injection](#dependency-injection)
8. [Service Architecture](#service-architecture)
9. [HttpClient Preparation](#httpclient-preparation)
10. [SOLID Principles](#solid-principles)
11. [Best Practices](#best-practices)

---

## 🏗️ Architecture Overview

### Clean Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                    │
│        (Components, Templates, Directives, Pipes)        │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                     DOMAIN LAYER                         │
│          (Models, Interfaces, Business Logic)            │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                   APPLICATION LAYER                      │
│          (State Management, Use Cases, Stores)           │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                 INFRASTRUCTURE LAYER                     │
│         (Services, HTTP, External APIs, Storage)         │
└─────────────────────────────────────────────────────────┘
```

### WHY Clean Architecture?

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Testability**: Easy to mock and unit test each layer
3. **Maintainability**: Changes in one layer don't affect others
4. **Scalability**: Can grow without architectural refactoring
5. **Team Collaboration**: Clear boundaries for different teams
6. **Technology Independence**: Can swap implementations without breaking app

---

## 📁 Folder Structure

```
src/app/
├── core/                         # Singleton services, guards, interceptors
│   ├── services/
│   │   ├── auth.service.ts       # Authentication logic
│   │   ├── logger.service.ts     # Centralized logging
│   │   └── mock-data.service.ts  # Generic CRUD operations
│   ├── guards/
│   │   ├── auth.guard.ts         # Route protection
│   │   └── role.guard.ts         # Permission-based access
│   ├── interceptors/
│   │   ├── auth.interceptor.ts   # Add auth headers
│   │   ├── error.interceptor.ts  # Global error handling
│   │   └── logging.interceptor.ts # Request/response logging
│   └── models/
│       └── api-response.model.ts # Standard API response shape
│
├── shared/                       # Reusable components, pipes, directives
│   ├── components/
│   │   ├── button/               # Reusable button with variants
│   │   ├── input/                # Form input with validation
│   │   ├── search-box/           # Debounced search component
│   │   ├── pagination/           # Smart pagination
│   │   ├── card/                 # Content projection example
│   │   ├── empty-state/          # UX for empty lists
│   │   ├── confirm-dialog/       # Confirmation dialogs
│   │   ├── loader/               # Loading spinner
│   │   ├── modal/                # Modal dialogs
│   │   ├── table/                # Data table
│   │   └── toast/                # Notifications
│   ├── pipes/
│   │   ├── date-format.pipe.ts   # Date formatting
│   │   └── currency-format.pipe.ts
│   ├── directives/
│   │   ├── highlight.directive.ts
│   │   └── has-role.directive.ts # Permission-based rendering
│   └── index.ts                  # Barrel exports
│
├── features/                     # Feature modules (lazy-loaded)
│   ├── employees/
│   │   ├── components/           # Feature-specific components
│   │   ├── services/             # Employee data access
│   │   ├── store/                # Employee state management
│   │   ├── models/               # Employee interfaces
│   │   ├── data/                 # Mock data
│   │   └── employees.routes.ts   # Feature routes
│   ├── projects/
│   ├── tasks/
│   └── settings/
│
├── layout/                       # Shell components
│   ├── shell/                    # Main layout wrapper
│   ├── navbar/                   # Top navigation
│   ├── sidebar/                  # Side navigation
│   └── footer/                   # Footer
│
├── utils/                        # Pure utility functions
│   ├── functions.util.ts         # Helper functions
│   └── types.util.ts             # TypeScript utility types
│
└── environments/                 # Environment configurations
    ├── environment.ts            # Development
    └── environment.prod.ts       # Production
```

### WHY This Structure?

1. **Feature-First**: Related code grouped by feature
2. **Core Separation**: Singleton services isolated
3. **Shared Reusability**: Common UI components in one place
4. **Lazy Loading**: Features load on-demand
5. **Clear Boundaries**: Easy to find and modify code

---

## 🧩 Reusable Components

### WHY Reusable Components Matter

1. **DRY Principle**: Write once, use everywhere
2. **Consistency**: Same UI/UX across application
3. **Maintainability**: Fix bugs in one place
4. **Performance**: Smaller bundle size (code reuse)
5. **Testability**: Test once, trust everywhere
6. **Scalability**: Easy to add features
7. **Developer Experience**: Faster development

### Component Architecture Pattern

```typescript
@Component({
  selector: 'app-[name]',
  standalone: true,              // No NgModule needed
  imports: [CommonModule],       // Explicit imports
  template: `...`,
  styles: [`...`]
})
export class Component {
  // INPUTS: Configuration from parent
  @Input() config: Config;
  
  // OUTPUTS: Events to parent
  @Output() action = new EventEmitter<Data>();
  
  // SIGNALS: Reactive state
  protected readonly state = signal<State>({});
  
  // COMPUTED: Derived state
  protected readonly computed = computed(() => ...);
  
  // METHODS: Business logic
  public method(): void {...}
}
```

### Implemented Reusable Components

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| **InputComponent** | Form inputs | ControlValueAccessor, validation, content projection |
| **SearchBoxComponent** | Search functionality | Debouncing, loading state, result count |
| **PaginationComponent** | Page navigation | Smart ellipsis, page size selector, accessibility |
| **CardComponent** | Content container | Content projection, variants, hover effects |
| **EmptyStateComponent** | Empty lists UX | Contextual messages, CTAs, help links |
| **ConfirmDialogComponent** | Confirmations | Promise-based API, branded, accessible |
| **ButtonComponent** | Action buttons | Variants, sizes, loading states, icons |
| **LoaderComponent** | Loading indicators | Overlay, inline, spinner variants |
| **ModalComponent** | Modal dialogs | Focus trap, backdrop, animations |
| **ToastComponent** | Notifications | Auto-dismiss, types, positioning |

---

## 🎯 Content Projection

### What is Content Projection?

Content projection (also called "transclusion") allows a component to accept and render content from its parent component.

### WHY Content Projection?

1. **Flexibility**: Parent controls the content
2. **Reusability**: Same component, different content
3. **Composition**: Build complex UI from simple parts
4. **Maintainability**: Component handles layout, parent handles data

### Types of Content Projection

#### 1. Single-Slot Projection

```html
<!-- Component -->
<div class="container">
  <ng-content />  <!-- Default slot -->
</div>

<!-- Usage -->
<app-card>
  <p>Any content here</p>
</app-card>
```

#### 2. Multi-Slot Projection (Named Slots)

```html
<!-- Component -->
<div class="card">
  <div class="header">
    <ng-content select="[card-header]" />
  </div>
  <div class="body">
    <ng-content />  <!-- Default slot -->
  </div>
  <div class="footer">
    <ng-content select="[card-footer]" />
  </div>
</div>

<!-- Usage -->
<app-card>
  <div card-header>
    <h3>Title</h3>
  </div>
  
  <p>Body content</p>
  
  <div card-footer>
    <button>Action</button>
  </div>
</app-card>
```

#### 3. Conditional Content Projection

```typescript
// Component
@Component({
  template: `
    <div class="header" *ngIf="hasHeaderContent">
      <ng-content select="[header]" />
    </div>
  `
})
export class Component {
  @ContentChild('header') headerRef?: ElementRef;
  
  get hasHeaderContent(): boolean {
    return !!this.headerRef;
  }
}
```

### Real Example: Card Component

```typescript
// card.component.ts
@Component({
  selector: 'app-card',
  template: `
    <div class="card" [class.card-hoverable]="hoverable">
      <!-- Named slot for header -->
      <div class="card-header" *ngIf="hasHeader">
        <ng-content select="[card-header]" />
      </div>
      
      <!-- Default slot for body -->
      <div class="card-body">
        <ng-content />
      </div>
      
      <!-- Named slot for footer -->
      <div class="card-footer" *ngIf="hasFooter">
        <ng-content select="[card-footer]" />
      </div>
    </div>
  `
})
export class CardComponent {
  @Input() hoverable = false;
  // Detect if content exists...
}

// Usage in parent
<app-card [hoverable]="true">
  <div card-header>
    <h5>Task #123</h5>
    <span class="badge">High Priority</span>
  </div>
  
  <p>Task description goes here</p>
  <p>Multiple elements allowed</p>
  
  <div card-footer>
    <button class="btn btn-primary">Edit</button>
    <button class="btn btn-danger">Delete</button>
  </div>
</app-card>
```

### Benefits Demonstrated

1. **Card component doesn't care about content** - it just provides structure
2. **Parent has full control** - can put anything in slots
3. **Type-safe with TypeScript** - inputs are typed
4. **Composable** - can nest components
5. **Testable** - test card structure separately from content

---

## 📥📤 Inputs & Outputs

### Component Communication Pattern

```typescript
// Child Component
@Component({
  selector: 'app-search-box',
  template: `
    <input
      [placeholder]="placeholder"
      (input)="onInput($event)" />
  `
})
export class SearchBoxComponent {
  // INPUT: Data flows DOWN from parent to child
  @Input() placeholder = 'Search...';
  @Input() debounceTime = 400;
  
  // OUTPUT: Events flow UP from child to parent
  @Output() search = new EventEmitter<string>();
  @Output() clear = new EventEmitter<void>();
  
  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.search.emit(value);  // Notify parent
  }
}

// Parent Component
@Component({
  template: `
    <app-search-box
      [placeholder]="'Search tasks...'"
      [debounceTime]="500"
      (search)="handleSearch($event)"
      (clear)="handleClear()" />
  `
})
export class ParentComponent {
  handleSearch(query: string): void {
    console.log('Searching for:', query);
  }
  
  handleClear(): void {
    console.log('Cleared');
  }
}
```

### WHY Inputs & Outputs?

1. **Unidirectional Data Flow**: Data down, events up (predictable)
2. **Encapsulation**: Parent doesn't access child internals
3. **Reusability**: Child works with any parent
4. **Type Safety**: TypeScript enforces contracts
5. **Testability**: Easy to mock inputs/outputs

### Input Patterns

#### 1. Required Inputs

```typescript
// Old way
@Input() data!: Data;  // Non-null assertion

// New way (Angular 16+)
data = input.required<Data>();
```

#### 2. Optional Inputs with Defaults

```typescript
@Input() size: 'sm' | 'md' | 'lg' = 'md';
@Input() disabled = false;
```

#### 3. Setters for Side Effects

```typescript
private _value = signal('');

@Input()
set value(val: string) {
  this._value.set(val);
  this.validate(val);  // Side effect
}

get value(): string {
  return this._value();
}
```

#### 4. Transform Inputs

```typescript
import { booleanAttribute, numberAttribute } from '@angular/core';

@Input({ transform: booleanAttribute }) disabled = false;
@Input({ transform: numberAttribute }) count = 0;

// Usage: <app-comp disabled="true" count="5" />
// Automatically converts strings to correct types
```

### Output Patterns

#### 1. Simple Event

```typescript
@Output() click = new EventEmitter<void>();

onClick(): void {
  this.click.emit();
}
```

#### 2. Event with Data

```typescript
@Output() itemSelected = new EventEmitter<Item>();

selectItem(item: Item): void {
  this.itemSelected.emit(item);
}
```

#### 3. Async Events

```typescript
@Output() save = new EventEmitter<Item>();

async onSave(item: Item): Promise<void> {
  // Validate, process, etc.
  this.save.emit(item);
}
```

### Two-Way Binding

```typescript
// Component
@Input() value = '';
@Output() valueChange = new EventEmitter<string>();

updateValue(newValue: string): void {
  this.value = newValue;
  this.valueChange.emit(newValue);  // Must follow naming convention
}

// Usage
<app-input [(value)]="searchQuery" />
// Equivalent to:
<app-input [value]="searchQuery" (valueChange)="searchQuery=$event" />
```

---

## ⚡ Signals & State Management

### What are Signals?

Signals are Angular's reactive primitive for managing state changes.

### WHY Signals?

1. **Fine-Grained Reactivity**: Only affected components re-render
2. **Automatic Dependency Tracking**: No manual subscriptions
3. **Simpler Syntax**: `count()` instead of `count$.getValue()`
4. **Better Performance**: Optimized change detection
5. **Type-Safe**: Strong TypeScript support
6. **Zone-less Future**: Path to removing Zone.js overhead

### Signal Types

#### 1. Writable Signal

```typescript
// Create writable signal
const count = signal(0);

// Read value
console.log(count());  // 0

// Update value
count.set(5);          // Set directly
count.update(v => v + 1);  // Update based on current value
```

#### 2. Readonly Signal

```typescript
class Store {
  // Private writable
  private readonly _count = signal(0);
  
  // Public readonly
  readonly count = asReadonly(this._count);
  
  // Only store can mutate
  increment(): void {
    this._count.update(v => v + 1);
  }
}

// Usage
const store = new Store();
console.log(store.count());  // Read
// store.count.set(5);  // ERROR: Cannot mutate readonly signal
store.increment();  // OK: Use public method
```

#### 3. Computed Signal

```typescript
const firstName = signal('John');
const lastName = signal('Doe');

// Automatically recomputes when dependencies change
const fullName = computed(() => {
  return `${firstName()} ${lastName()}`;
});

console.log(fullName());  // 'John Doe'
firstName.set('Jane');
console.log(fullName());  // 'Jane Doe' (auto-updated)
```

#### 4. Effect

```typescript
effect(() => {
  // Runs whenever count() changes
  console.log('Count changed:', count());
  
  // Can have side effects
  localStorage.setItem('count', String(count()));
});
```

### Store Pattern with Signals

```typescript
@Injectable({ providedIn: 'root' })
export class TaskStore {
  // ══════════════════════════════════════════════════════════════
  // PRIVATE STATE (writable)
  // ══════════════════════════════════════════════════════════════
  private readonly _tasks = signal<Task[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _searchQuery = signal('');
  private readonly _filters = signal<Filters>({});
  
  // ══════════════════════════════════════════════════════════════
  // PUBLIC STATE (readonly)
  // ══════════════════════════════════════════════════════════════
  readonly tasks = asReadonly(this._tasks);
  readonly loading = asReadonly(this._loading);
  readonly error = asReadonly(this._error);
  
  // ══════════════════════════════════════════════════════════════
  // COMPUTED STATE (derived)
  // ══════════════════════════════════════════════════════════════
  readonly filteredTasks = computed(() => {
    const tasks = this._tasks();
    const query = this._searchQuery().toLowerCase();
    const filters = this._filters();
    
    return tasks
      .filter(t => t.title.toLowerCase().includes(query))
      .filter(t => !filters.status || t.status === filters.status)
      .filter(t => !filters.priority || t.priority === filters.priority);
  });
  
  readonly stats = computed(() => {
    const tasks = this.filteredTasks();
    return {
      total: tasks.length,
      done: tasks.filter(t => t.status === 'Done').length,
      inProgress: tasks.filter(t => t.status === 'InProgress').length
    };
  });
  
  // ══════════════════════════════════════════════════════════════
  // ACTIONS (state mutations)
  // ══════════════════════════════════════════════════════════════
  loadTasks(): void {
    this._loading.set(true);
    this._error.set(null);
    
    this.taskService.getAll().subscribe({
      next: tasks => {
        this._tasks.set(tasks);
        this._loading.set(false);
      },
      error: err => {
        this._error.set(err.message);
        this._loading.set(false);
      }
    });
  }
  
  setSearchQuery(query: string): void {
    this._searchQuery.set(query);
  }
  
  setFilters(filters: Partial<Filters>): void {
    this._filters.update(current => ({ ...current, ...filters }));
  }
  
  addTask(task: Task): void {
    this._tasks.update(current => [...current, task]);
  }
  
  updateTask(task: Task): void {
    this._tasks.update(tasks =>
      tasks.map(t => t.id === task.id ? task : t)
    );
  }
  
  removeTask(id: number): void {
    this._tasks.update(tasks => tasks.filter(t => t.id !== id));
  }
  
  clearFilters(): void {
    this._searchQuery.set('');
    this._filters.set({});
  }
}
```

### Component Usage

```typescript
@Component({
  template: `
    <!-- Signals automatically trigger re-render -->
    @if (store.loading()) {
      <app-loader />
    } @else {
      <div>
        <p>Total: {{ store.stats().total }}</p>
        <p>Done: {{ store.stats().done }}</p>
        
        @for (task of store.filteredTasks(); track task.id) {
          <app-task-card [task]="task" />
        }
      </div>
    }
  `
})
export class TaskListComponent {
  protected readonly store = inject(TaskStore);
  
  ngOnInit(): void {
    this.store.loadTasks();
  }
  
  onSearch(query: string): void {
    this.store.setSearchQuery(query);
  }
}
```

### Signal Benefits Demonstrated

1. **No Subscriptions**: No memory leaks from forgotten unsubscribe
2. **Automatic Updates**: UI updates when signals change
3. **Computed Optimization**: Only recalculates when dependencies change
4. **Type Safety**: Compile-time type checking
5. **Debugging**: Easy to trace signal changes
6. **Performance**: Fine-grained updates, no full component re-render

---

## 💉 Dependency Injection

### What is Dependency Injection?

DI is a design pattern where Angular provides instances to classes instead of classes creating them manually.

### WHY Dependency Injection?

1. **Testability**: Easy to mock dependencies
2. **Loose Coupling**: Classes don't know how dependencies are created
3. **Flexibility**: Swap implementations without changing code
4. **Lifecycle Management**: Angular handles creation/destruction
5. **Singleton Pattern**: Share state across application
6. **Configuration**: Different implementations per environment

### DI Hierarchy

```
┌─────────────────────────────────────────┐
│          Root Injector                  │
│     (Application-wide singletons)       │
│                                         │
│  TaskService (providedIn: 'root')      │
│  AuthService (providedIn: 'root')      │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│      Platform Injector                  │
│   (Shared across Angular apps)          │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│     Feature Injectors                   │
│  (Scoped to lazy-loaded features)       │
│                                         │
│  FeatureService (providers: [])        │
└─────────────────────────────────────────┘
```

### Provider Configurations

#### 1. Root-Level Provider (Singleton)

```typescript
@Injectable({
  providedIn: 'root'  // Single instance app-wide
})
export class TaskService {
  // Shared across entire application
}
```

**WHY:** Most services should be singletons (auth, HTTP, state stores)

#### 2. Component-Level Provider

```typescript
@Component({
  selector: 'app-task-form',
  providers: [TaskFormService]  // New instance per component
})
export class TaskFormComponent {
  constructor(private formService: TaskFormService) {
    // This component gets its own instance
  }
}
```

**WHY:** When service needs to be isolated per component instance

#### 3. Feature-Level Provider

```typescript
// In routes
{
  path: 'tasks',
  loadComponent: () => import('./tasks/task-list.component'),
  providers: [TaskService]  // New instance per feature load
}
```

**WHY:** Feature-specific services that don't need to be singletons

### Modern inject() Function

```typescript
// OLD: Constructor injection
@Component({...})
export class OldWay {
  constructor(
    private taskService: TaskService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
}

// NEW: inject() function
@Component({...})
export class ModernWay {
  private readonly taskService = inject(TaskService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  
  // Can even use in methods/functions!
  someMethod(): void {
    const http = inject(HttpClient);  // Works anywhere in DI context
  }
}
```

**WHY inject() is Better:**
- Shorter syntax
- Works in functions (not just constructors)
- Conditional injection based on environment
- Required for functional guards/interceptors

### Injection Tokens

```typescript
// Create token
export const API_URL = new InjectionToken<string>('API_URL');

// Provide value
providers: [
  { provide: API_URL, useValue: 'https://api.example.com' }
]

// Inject
export class Service {
  private readonly apiUrl = inject(API_URL);
}
```

### Factory Providers

```typescript
// Complex initialization
providers: [
  {
    provide: LoggerService,
    useFactory: (config: ConfigService) => {
      return new LoggerService(config.logLevel);
    },
    deps: [ConfigService]
  }
]
```

### Conditional Providers

```typescript
providers: [
  {
    provide: DataService,
    useClass: environment.production
      ? ProductionDataService
      : MockDataService
  }
]
```

### Multi-Providers

```typescript
// Multiple instances of same token
export const HTTP_INTERCEPTORS = new InjectionToken('HTTP_INTERCEPTORS');

providers: [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true }
]
```

---

## 🏗️ Service Architecture

### Service Layers

```
┌─────────────────────────────────────────────────────┐
│              PRESENTATION LAYER                      │
│                  (Components)                        │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│               STATE MANAGEMENT                       │
│                  (Stores)                            │
│                                                      │
│  - TaskStore                                        │
│  - ProjectStore                                     │
│  - EmployeeStore                                    │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              BUSINESS LOGIC LAYER                    │
│                  (Services)                          │
│                                                      │
│  - TaskService (domain operations)                  │
│  - ProjectService                                   │
│  - ValidationService                                │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│               DATA ACCESS LAYER                      │
│                (API Services)                        │
│                                                      │
│  - TaskApiService (HTTP calls)                      │
│  - ProjectApiService                                │
│  - AuthApiService                                   │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                  CORE LAYER                          │
│              (Infrastructure)                        │
│                                                      │
│  - HttpClient                                       │
│  - Interceptors                                     │
│  - Error Handling                                   │
└─────────────────────────────────────────────────────┘
```

### Service Types

#### 1. Data Services (Business Logic)

```typescript
@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly apiService = inject(TaskApiService);
  private readonly mockService = inject(MockDataService);
  private readonly useMock = !environment.production;
  
  /**
   * Get all tasks
   * - Uses mock data in development
   * - Uses real API in production
   */
  getAll(): Observable<Task[]> {
    return this.useMock
      ? this.mockService.getAll<Task>(MOCK_TASKS)
      : this.apiService.getAll();
  }
  
  /**
   * Create task with validation
   */
  create(dto: CreateTaskDto): Observable<Task> {
    // Business logic
    if (!dto.title) {
      return throwError(() => new Error('Title is required'));
    }
    
    // Delegate to API layer
    return this.apiService.create(dto);
  }
  
  /**
   * Complex business operation
   */
  assignTaskToUser(taskId: number, userId: number): Observable<Task> {
    return this.apiService.get(taskId).pipe(
      switchMap(task => {
        // Business rule: Can't assign completed tasks
        if (task.status === 'Done') {
          return throwError(() =>
            new Error('Cannot assign completed task')
          );
        }
        
        // Update task
        return this.apiService.update(taskId, { assigneeId: userId });
      })
    );
  }
}
```

#### 2. API Services (HTTP Layer)

```typescript
@Injectable({ providedIn: 'root' })
export class TaskApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tasks`;
  
  getAll(params?: QueryParams): Observable<Task[]> {
    return this.http.get<ApiResponse<Task[]>>(this.baseUrl, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }
  
  getById(id: number): Observable<Task> {
    return this.http.get<ApiResponse<Task>>(`${this.baseUrl}/${id}`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }
  
  create(dto: CreateTaskDto): Observable<Task> {
    return this.http.post<ApiResponse<Task>>(this.baseUrl, dto)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }
  
  update(id: number, dto: Partial<CreateTaskDto>): Observable<Task> {
    return this.http.put<ApiResponse<Task>>(`${this.baseUrl}/${id}`, dto)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }
  
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }
  
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = `Error ${error.status}: ${error.message}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
```

#### 3. Core Services (Infrastructure)

```typescript
@Injectable({ providedIn: 'root' })
export class LoggerService {
  private readonly config = inject(ConfigService);
  
  debug(message: string, ...args: any[]): void {
    if (this.config.logLevel === 'debug') {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
  
  info(message: string, ...args: any[]): void {
    console.info(`[INFO] ${message}`, ...args);
  }
  
  warn(message: string, ...args: any[]): void {
    console.warn(`[WARN] ${message}`, ...args);
  }
  
  error(message: string, error?: Error): void {
    console.error(`[ERROR] ${message}`, error);
    
    // Send to external service in production
    if (environment.production) {
      this.sendToRemoteLogger(message, error);
    }
  }
  
  private sendToRemoteLogger(message: string, error?: Error): void {
    // Send to Sentry, LogRocket, etc.
  }
}
```

### Service Best Practices

1. **Single Responsibility**: One service, one purpose
2. **Dependency Inversion**: Depend on abstractions (interfaces), not concretions
3. **Error Handling**: Catch and transform errors appropriately
4. **Typing**: Strong TypeScript types for inputs/outputs
5. **Immutability**: Don't mutate inputs, return new objects
6. **Observable Patterns**: Use RxJS operators effectively
7. **Testing**: Write unit tests for business logic

---

## 🌐 HttpClient Preparation

### API Service Template

```typescript
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class BaseApiService<T> {
  protected readonly http = inject(HttpClient);
  protected baseUrl: string;
  
  constructor(endpoint: string) {
    this.baseUrl = `${environment.apiUrl}/${endpoint}`;
  }
  
  /**
   * GET /api/endpoint
   */
  getAll(params?: QueryParams): Observable<T[]> {
    const httpParams = this.buildParams(params);
    
    return this.http.get<ApiResponse<T[]>>(this.baseUrl, { params: httpParams })
      .pipe(
        retry(2),  // Retry failed requests twice
        map(response => response.data),
        catchError(this.handleError)
      );
  }
  
  /**
   * GET /api/endpoint/:id
   */
  getById(id: number): Observable<T> {
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}/${id}`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }
  
  /**
   * POST /api/endpoint
   */
  create(data: Partial<T>): Observable<T> {
    return this.http.post<ApiResponse<T>>(this.baseUrl, data)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }
  
  /**
   * PUT /api/endpoint/:id
   */
  update(id: number, data: Partial<T>): Observable<T> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}/${id}`, data)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }
  
  /**
   * PATCH /api/endpoint/:id
   */
  patch(id: number, data: Partial<T>): Observable<T> {
    return this.http.patch<ApiResponse<T>>(`${this.baseUrl}/${id}`, data)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }
  
  /**
   * DELETE /api/endpoint/:id
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }
  
  /**
   * Build HTTP params from object
   */
  protected buildParams(params?: QueryParams): HttpParams {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== null && value !== undefined) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    
    return httpParams;
  }
  
  /**
   * Centralized error handling
   */
  protected handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side/network error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Backend error
      switch (error.status) {
        case 400:
          errorMessage = 'Bad Request: ' + (error.error?.message || 'Invalid data');
          break;
        case 401:
          errorMessage = 'Unauthorized: Please log in';
          break;
        case 403:
          errorMessage = 'Forbidden: You don\'t have permission';
          break;
        case 404:
          errorMessage = 'Not Found: Resource doesn\'t exist';
          break;
        case 500:
          errorMessage = 'Server Error: Please try again later';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }
    
    // Log to console and external service
    console.error('API Error:', errorMessage, error);
    
    return throwError(() => new Error(errorMessage));
  }
}

// Usage: Extend for specific entities
@Injectable({ providedIn: 'root' })
export class TaskApiService extends BaseApiService<Task> {
  constructor() {
    super('tasks');  // Sets baseUrl to /api/tasks
  }
  
  // Add custom endpoints
  getByProject(projectId: number): Observable<Task[]> {
    return this.http.get<ApiResponse<Task[]>>(
      `${this.baseUrl}/project/${projectId}`
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }
}
```

### HTTP Interceptors

#### 1. Auth Interceptor (Add JWT Token)

```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  // Clone request and add authorization header
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return next(req);
};
```

#### 2. Error Interceptor (Global Error Handling)

```typescript
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '@shared';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle specific errors
      switch (error.status) {
        case 401:
          // Redirect to login
          router.navigate(['/login']);
          toast.error('Session expired. Please log in again.');
          break;
          
        case 403:
          toast.error('You don\'t have permission to perform this action.');
          break;
          
        case 500:
          toast.error('Server error. Please try again later.');
          break;
      }
      
      return throwError(() => error);
    })
  );
};
```

#### 3. Logging Interceptor

```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap, catchError } from 'rxjs/operators';
import { LoggerService } from '@core/services/logger.service';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggerService);
  const started = Date.now();
  
  logger.debug(`HTTP Request: ${req.method} ${req.url}`);
  
  return next(req).pipe(
    tap(response => {
      const elapsed = Date.now() - started;
      logger.debug(`HTTP Response: ${req.url} (${elapsed}ms)`, response);
    }),
    catchError(error => {
      const elapsed = Date.now() - started;
      logger.error(`HTTP Error: ${req.url} (${elapsed}ms)`, error);
      throw error;
    })
  );
};
```

### Register Interceptors

```typescript
// app.config.ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { errorInterceptor } from '@core/interceptors/error.interceptor';
import { loggingInterceptor } from '@core/interceptors/logging.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        loggingInterceptor,   // Order matters!
        authInterceptor,
        errorInterceptor
      ])
    )
  ]
};
```

---

## 🎯 SOLID Principles

### 1. Single Responsibility Principle (SRP)

**Definition**: A class should have only one reason to change.

**BAD Example:**
```typescript
// This service does TOO MUCH
@Injectable()
export class BadTaskService {
  getTasks(): Task[] {...}
  saveTasks(tasks: Task[]): void {...}
  validateTask(task: Task): boolean {...}
  sendEmailNotification(task: Task): void {...}
  logToAnalytics(task: Task): void {...}
  generatePDF(tasks: Task[]): Blob {...}
}
```

**GOOD Example:**
```typescript
// Split into focused services
@Injectable()
export class TaskService {
  getTasks(): Task[] {...}
  saveTask(task: Task): void {...}
}

@Injectable()
export class TaskValidationService {
  validate(task: Task): ValidationResult {...}
}

@Injectable()
export class NotificationService {
  sendEmail(task: Task): void {...}
}

@Injectable()
export class AnalyticsService {
  log(event: string, data: any): void {...}
}

@Injectable()
export class PdfService {
  generate(data: any): Blob {...}
}
```

### 2. Open/Closed Principle (OCP)

**Definition**: Open for extension, closed for modification.

**BAD Example:**
```typescript
// Must modify class to add new status types
export class TaskStatusChecker {
  getColor(status: string): string {
    if (status === 'Todo') return 'gray';
    if (status === 'InProgress') return 'blue';
    if (status === 'Done') return 'green';
    // Need to modify this method for new statuses!
    return 'black';
  }
}
```

**GOOD Example:**
```typescript
// Can extend without modifying
export interface StatusConfig {
  color: string;
  icon: string;
  label: string;
}

export const STATUS_CONFIGS: Record<TaskStatus, StatusConfig> = {
  Todo:       { color: 'gray', icon: 'bi-circle', label: 'To Do' },
  InProgress: { color: 'blue', icon: 'bi-arrow-repeat', label: 'In Progress' },
  Done:       { color: 'green', icon: 'bi-check', label: 'Done' }
  // Add new statuses here without modifying any methods
};

export class TaskStatusChecker {
  getColor(status: TaskStatus): string {
    return STATUS_CONFIGS[status].color;
  }
}
```

### 3. Liskov Substitution Principle (LSP)

**Definition**: Subtypes must be substitutable for their base types.

**BAD Example:**
```typescript
// RectangleComponent expected but got SquareComponent - breaks!
class RectangleComponent {
  setWidth(w: number): void {...}
  setHeight(h: number): void {...}
}

class SquareComponent extends RectangleComponent {
  // Violates LSP - changes behavior
  setWidth(w: number): void {
    super.setWidth(w);
    super.setHeight(w);  // Unexpected side effect!
  }
}
```

**GOOD Example:**
```typescript
// Use composition over inheritance
interface Shape {
  area(): number;
}

class Rectangle implements Shape {
  constructor(private width: number, private height: number) {}
  area(): number {
    return this.width * this.height;
  }
}

class Square implements Shape {
  constructor(private side: number) {}
  area(): number {
    return this.side * this.side;
  }
}
```

### 4. Interface Segregation Principle (ISP)

**Definition**: Clients shouldn't depend on interfaces they don't use.

**BAD Example:**
```typescript
// Huge interface with everything
interface Animal {
  walk(): void;
  fly(): void;
  swim(): void;
  layEggs(): void;
}

// Dog forced to implement fly() even though it can't
class Dog implements Animal {
  walk(): void {...}
  fly(): void { throw new Error('Dogs cannot fly'); }  // BAD!
  swim(): void {...}
  layEggs(): void { throw new Error('Dogs don\'t lay eggs'); }  // BAD!
}
```

**GOOD Example:**
```typescript
// Split into small, focused interfaces
interface Walkable {
  walk(): void;
}

interface Flyable {
  fly(): void;
}

interface Swimmable {
  swim(): void;
}

// Implement only what's needed
class Dog implements Walkable, Swimmable {
  walk(): void {...}
  swim(): void {...}
}

class Bird implements Walkable, Flyable {
  walk(): void {...}
  fly(): void {...}
}
```

### 5. Dependency Inversion Principle (DIP)

**Definition**: Depend on abstractions, not concretions.

**BAD Example:**
```typescript
// Tightly coupled to concrete implementation
export class TaskComponent {
  constructor(private taskService: TaskService) {}
  
  loadTasks(): void {
    // Directly depends on TaskService implementation
    this.taskService.getTasks().subscribe(...);
  }
}
```

**GOOD Example:**
```typescript
// Depend on abstraction (interface)
export interface ITaskService {
  getTasks(): Observable<Task[]>;
  getTask(id: number): Observable<Task>;
  createTask(task: Task): Observable<Task>;
}

@Injectable()
export class RealTaskService implements ITaskService {
  getTasks(): Observable<Task[]> {...}
  getTask(id: number): Observable<Task> {...}
  createTask(task: Task): Observable<Task> {...}
}

@Injectable()
export class MockTaskService implements ITaskService {
  getTasks(): Observable<Task[]> {...}
  getTask(id: number): Observable<Task> {...}
  createTask(task: Task): Observable<Task> {...}
}

// Component depends on interface
export class TaskComponent {
  constructor(private taskService: ITaskService) {}
  // Can inject RealTaskService or MockTaskService
}

// Configure in providers
providers: [
  {
    provide: ITaskService,
    useClass: environment.production ? RealTaskService : MockTaskService
  }
]
```

---

## ✅ Best Practices Summary

### Component Best Practices

1. **Keep Components Small**: < 300 lines
2. **Single Responsibility**: One component, one purpose
3. **Use Signals**: For reactive state management
4. **No Business Logic**: Move to services/stores
5. **OnPush Change Detection**: For performance
6. **Standalone Components**: No NgModules
7. **Content Projection**: For flexibility

### Service Best Practices

1. **Singleton Services**: Use `providedIn: 'root'`
2. **Type Everything**: Strong TypeScript types
3. **Error Handling**: Catch and transform errors
4. **Immutability**: Don't mutate inputs
5. **Observable Patterns**: Use RxJS effectively
6. **Unit Tests**: Test business logic
7. **Separation of Concerns**: Data access vs business logic

### State Management Best Practices

1. **Use Stores**: Centralized state
2. **Readonly Signals**: Prevent external mutations
3. **Computed for Derived State**: Automatic memoization
4. **Actions for Mutations**: Single way to change state
5. **No Nested Subscriptions**: Use operators like `switchMap`

### Architecture Best Practices

1. **Feature-First**: Group by feature, not layer
2. **Lazy Loading**: Load features on-demand
3. **Shared Module**: Reusable components
4. **Core Module**: Singleton services
5. **Utils Folder**: Pure functions
6. **Barrel Exports**: Clean imports

---

## 🎯 Summary

This enterprise architecture provides:

✅ **Clean Separation**: Core, Shared, Features, Utils
✅ **Reusable Components**: 11+ production-ready components
✅ **Type Safety**: Strong TypeScript throughout
✅ **State Management**: Signal-based stores
✅ **Testability**: Isolated, mockable services
✅ **Scalability**: Feature-first structure
✅ **Performance**: Lazy loading, OnPush detection
✅ **Maintainability**: SOLID principles
✅ **Developer Experience**: Clear patterns, documentation
✅ **Production Ready**: Error handling, logging, interceptors

**This architecture is ready to scale from MVP to enterprise application!**
