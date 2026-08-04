# 🎯 Angular Enterprise Architecture - Interview Guide

## Complete Interview Preparation for Senior Angular Positions

This guide covers all architectural decisions made in this enterprise Angular application, formatted for interview preparation.

---

## 📚 Table of Contents

1. [Why Reusable Components?](#why-reusable-components)
2. [Content Projection Deep Dive](#content-projection-deep-dive)
3. [Inputs & Outputs Communication](#inputs--outputs-communication)
4. [Signals vs RxJS](#signals-vs-rxjs)
5. [State Management Patterns](#state-management-patterns)
6. [Dependency Injection](#dependency-injection)
7. [Service Architecture](#service-architecture)
8. [HttpClient & API Layer](#httpclient--api-layer)
9. [Folder Structure Decisions](#folder-structure-decisions)
10. [SOLID Principles in Practice](#solid-principles-in-practice)

---

## 🧩 Why Reusable Components?

### Interview Question 1: "Why should we create reusable components instead of copying code?"

**Answer:**

Reusable components provide several critical benefits:

1. **DRY Principle (Don't Repeat Yourself)**
   - Write component once, use everywhere
   - Single source of truth for UI patterns
   - Example: `SearchBoxComponent` used in Tasks, Projects, Employees

2. **Consistency**
   - Same UX across application
   - Users don't need to relearn patterns
   - Example: All search boxes have same debounce behavior

3. **Maintainability**
   - Fix bug once, fixes everywhere
   - Change styling in one place
   - Example: Update `InputComponent` validation, all forms benefit

4. **Performance**
   - Smaller bundle size (code reused, not duplicated)
   - Better tree-shaking
   - Shared component cached by browser

5. **Testability**
   - Test component once thoroughly
   - Trust it everywhere it's used
   - Example: Test `PaginationComponent` once, all lists benefit

6. **Developer Productivity**
   - Faster feature development
   - Less context switching
   - Example: Building task form is faster with existing `InputComponent`

7. **Scalability**
   - Easy to add new features
   - Component library grows with app
   - Can be extracted to separate package

**Real Example from Project:**

```typescript
// Without Reusable Component (BAD)
// task-list.component.ts
<input
  type="search"
  [(ngModel)]="searchQuery"
  (ngModelChange)="debounce($event)"
  placeholder="Search tasks..." />

// project-list.component.ts
<input
  type="search"
  [(ngModel)]="searchQuery"
  (ngModelChange)="debounce($event)"
  placeholder="Search projects..." />
// Repeated code with subtle differences! Bug-prone!

// With Reusable Component (GOOD)
// task-list.component.ts
<app-search-box
  placeholder="Search tasks..."
  (search)="onSearch($event)" />

// project-list.component.ts
<app-search-box
  placeholder="Search projects..."
  (search)="onSearch($event)" />
// Consistent, maintainable, tested!
```

---

### Interview Question 2: "What makes a component truly reusable?"

**Answer:**

A truly reusable component has these characteristics:

1. **Configurable via Inputs**
   ```typescript
   @Input() size: 'sm' | 'md' | 'lg' = 'md';
   @Input() variant: 'primary' | 'secondary' = 'primary';
   @Input() disabled = false;
   ```

2. **Communicates via Outputs**
   ```typescript
   @Output() action = new EventEmitter<Data>();
   @Output() cancel = new EventEmitter<void>();
   ```

3. **Content Projection for Flexibility**
   ```typescript
   <ng-content select="[prefix]" />  // For icons
   <ng-content />  // Main content
   <ng-content select="[suffix]" />  // For buttons
   ```

4. **No External Dependencies**
   - Doesn't depend on specific services
   - Receives data via inputs, not direct injection
   - Can work in isolation

5. **Well-Documented**
   - JSDoc comments explaining usage
   - Example code in comments
   - Clear prop descriptions

6. **Accessible**
   - ARIA labels
   - Keyboard navigation
   - Focus management

7. **Type-Safe**
   - Generic types for flexibility
   - Strong TypeScript contracts

**Example: Our InputComponent**

```typescript
/**
 * Reusable Input Component
 * 
 * Features:
 * - ControlValueAccessor (works with Angular Forms)
 * - Content Projection (prefix/suffix slots)
 * - Validation display
 * - Accessibility (ARIA labels)
 * - Configurable (type, placeholder, etc.)
 * 
 * Usage:
 * <app-input
 *   [formControl]="nameControl"
 *   label="Full Name"
 *   placeholder="Enter name">
 *   <i prefix class="bi bi-person"></i>
 * </app-input>
 */
@Component({
  selector: 'app-input',
  // ...
})
export class InputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() required = false;
  // ... more config
}
```

---

## 📦 Content Projection Deep Dive

### Interview Question 3: "Explain Content Projection and when to use it."

**Answer:**

**What is Content Projection?**

Content Projection (also called Transclusion) allows a component to accept and display content from its parent component using `<ng-content>`.

**Types:**

1. **Single-Slot Projection (Default)**
   ```html
   <!-- Component -->
   <div class="wrapper">
     <ng-content />  <!-- Everything goes here -->
   </div>
   
   <!-- Usage -->
   <app-wrapper>
     <p>Any content</p>
     <button>Click</button>
   </app-wrapper>
   ```

2. **Multi-Slot Projection (Named Slots)**
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

3. **Conditional Projection**
   ```html
   <div class="header" *ngIf="hasHeader">
     <ng-content select="[header]" />
   </div>
   ```

**When to Use:**

✅ **Use Content Projection when:**
- Component provides structure/layout, parent provides content
- Need maximum flexibility
- Want composition over configuration
- Building container components (Card, Modal, Panel)
- Creating wrappers (Dialog, Tooltip, Popover)

❌ **Don't Use Content Projection when:**
- Component needs control over content rendering
- Content requires complex logic
- Better solved with `@Input()` data binding

**Real Example: CardComponent**

```typescript
// WHY: Card provides layout, parent provides content
@Component({
  selector: 'app-card',
  template: `
    <div class="card">
      <!-- Optional header slot -->
      <div class="card-header" *ngIf="hasHeader">
        <ng-content select="[card-header]" />
      </div>
      
      <!-- Main content (default slot) -->
      <div class="card-body">
        <ng-content />
      </div>
      
      <!-- Optional footer slot -->
      <div class="card-footer" *ngIf="hasFooter">
        <ng-content select="[card-footer]" />
      </div>
    </div>
  `
})
export class CardComponent {
  @Input() hoverable = false;
  // Card handles styling, parent handles content
}

// Usage
<app-card [hoverable]="true">
  <div card-header>
    <h5>{{ task.title }}</h5>
    <span class="badge">{{ task.priority }}</span>
  </div>
  
  <p>{{ task.description }}</p>
  <p>Due: {{ task.dueDate | date }}</p>
  
  <div card-footer>
    <button (click)="edit()">Edit</button>
    <button (click)="delete()">Delete</button>
  </div>
</app-card>
```

**Benefits Demonstrated:**

1. **Flexibility**: Parent decides exact content
2. **Reusability**: Same card for tasks, projects, employees
3. **Type-Safe**: TypeScript checks parent template
4. **Composable**: Can nest components inside
5. **Maintainable**: Card CSS in one place

---

### Interview Question 4: "What's the difference between Content Projection and Input binding?"

**Answer:**

| Aspect | Content Projection (`<ng-content>`) | Input Binding (`@Input()`) |
|--------|-------------------------------------|----------------------------|
| **Purpose** | Pass HTML/Components | Pass Data |
| **Syntax** | `<app-comp><p>HTML</p></app-comp>` | `<app-comp [data]="value">` |
| **Control** | Parent controls rendering | Component controls rendering |
| **Flexibility** | Maximum flexibility | Structured data |
| **Use Case** | Layout components | Data-driven components |
| **Example** | Modal, Card, Panel | Table, List, Form |

**Example Comparison:**

```typescript
// Input Binding (Data-Driven)
@Component({
  selector: 'app-task-card',
  template: `
    <div class="card">
      <h5>{{ task.title }}</h5>
      <p>{{ task.description }}</p>
      <span>{{ task.status }}</span>
    </div>
  `
})
export class TaskCardComponent {
  @Input() task!: Task;  // Component controls rendering
}

// Usage
<app-task-card [task]="task"></app-task-card>
// Fixed structure, component decides how to display


// Content Projection (Template-Driven)
@Component({
  selector: 'app-card',
  template: `
    <div class="card">
      <ng-content />  <!-- Parent controls content -->
    </div>
  `
})
export class CardComponent {}

// Usage
<app-card>
  <h5>{{ task.title }}</h5>
  <p>{{ task.description }}</p>
  <custom-status [status]="task.status" />
</app-card>
// Flexible structure, parent decides content
```

**When to Choose:**

- **Input Binding**: When component needs to process/transform data
- **Content Projection**: When component provides container/wrapper

---

## 📥📤 Inputs & Outputs Communication

### Interview Question 5: "Explain parent-child communication in Angular."

**Answer:**

Angular uses **Unidirectional Data Flow**:
- **Data flows DOWN** (parent → child) via `@Input()`
- **Events flow UP** (child → parent) via `@Output()`

**WHY Unidirectional?**

1. **Predictability**: Easy to trace data changes
2. **Debugging**: Clear flow of data
3. **Performance**: Change detection optimized
4. **Maintainability**: No two-way dependencies

**Pattern:**

```
┌─────────────────────────────────────────┐
│         Parent Component                 │
│  data: Task[] = [...]                   │
│                                         │
│  handleEdit(task) { ... }               │
└──────────┬────────────────┬─────────────┘
           │                │
       [Input]          (Output)
       data ↓            event ↑
           │                │
┌──────────▼────────────────▼─────────────┐
│         Child Component                  │
│  @Input() task: Task                    │
│  @Output() edit = EventEmitter          │
│                                         │
│  onEdit() { this.edit.emit(this.task) } │
└─────────────────────────────────────────┘
```

**Real Example:**

```typescript
// Parent: Task List
@Component({
  selector: 'app-task-list',
  template: `
    @for (task of tasks; track task.id) {
      <app-task-card
        [task]="task"
        [showActions]="true"
        (edit)="handleEdit($event)"
        (delete)="handleDelete($event)" />
    }
  `
})
export class TaskListComponent {
  tasks: Task[] = [...];
  
  // Event handlers
  handleEdit(task: Task): void {
    this.router.navigate(['/tasks', task.id, 'edit']);
  }
  
  handleDelete(task: Task): void {
    this.taskService.delete(task.id).subscribe();
  }
}

// Child: Task Card
@Component({
  selector: 'app-task-card',
  template: `
    <div class="card">
      <h5>{{ task.title }}</h5>
      <p>{{ task.description }}</p>
      
      @if (showActions) {
        <button (click)="onEdit()">Edit</button>
        <button (click)="onDelete()">Delete</button>
      }
    </div>
  `
})
export class TaskCardComponent {
  // INPUTS: Configuration from parent
  @Input() task!: Task;
  @Input() showActions = true;
  
  // OUTPUTS: Events to parent
  @Output() edit = new EventEmitter<Task>();
  @Output() delete = new EventEmitter<Task>();
  
  // Internal logic
  onEdit(): void {
    this.edit.emit(this.task);  // Notify parent
  }
  
  onDelete(): void {
    this.delete.emit(this.task);
  }
}
```

**Benefits:**

1. ✅ **Decoupled**: Child doesn't know parent implementation
2. ✅ **Reusable**: Card works with any parent
3. ✅ **Testable**: Easy to mock inputs/outputs
4. ✅ **Type-Safe**: TypeScript enforces contracts

---

### Interview Question 6: "How do you handle two-way binding in modern Angular?"

**Answer:**

**Old Way: [(ngModel)]**

```typescript
<input [(ngModel)]="value" />
// Expands to:
<input [ngModel]="value" (ngModelChange)="value=$event" />
```

**Custom Two-Way Binding:**

Angular convention: `@Output` must be named `{inputName}Change`

```typescript
@Component({
  selector: 'app-counter',
  template: `
    <button (click)="decrement()">-</button>
    <span>{{ value }}</span>
    <button (click)="increment()">+</button>
  `
})
export class CounterComponent {
  @Input() value = 0;
  @Output() valueChange = new EventEmitter<number>();  // MUST be named 'valueChange'
  
  increment(): void {
    this.value++;
    this.valueChange.emit(this.value);
  }
  
  decrement(): void {
    this.value--;
    this.valueChange.emit(this.value);
  }
}

// Usage
<app-counter [(value)]="count" />
// Automatically binds to both value input and valueChange output
```

**Modern Way: Signal Inputs (Angular 17+)**

```typescript
// Component with signal input
@Component({
  selector: 'app-counter',
  template: `...`
})
export class CounterComponent {
  value = model(0);  // Two-way signal binding
  
  increment(): void {
    this.value.update(v => v + 1);
  }
}

// Usage
<app-counter [(value)]="count" />
```

**ControlValueAccessor (Form Controls)**

```typescript
@Component({
  selector: 'app-input',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputComponent),
    multi: true
  }]
})
export class InputComponent implements ControlValueAccessor {
  value = '';
  private onChange = (value: string) => {};
  private onTouched = () => {};
  
  // Angular Forms calls these
  writeValue(value: string): void {
    this.value = value;
  }
  
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  
  // User interaction
  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.onChange(value);  // Notify form
  }
}

// Usage with Reactive Forms
<app-input [formControl]="nameControl" />
```

---

## ⚡ Signals vs RxJS

### Interview Question 7: "When should I use Signals vs RxJS Observables?"

**Answer:**

Both are reactive primitives, but serve different purposes:

| Aspect | Signals | RxJS Observables |
|--------|---------|------------------|
| **Purpose** | Synchronous reactive state | Asynchronous data streams |
| **Use Case** | Component state, UI reactivity | HTTP, Events, Timers |
| **Syntax** | `count()` | `count$.subscribe()` |
| **Memory** | Auto-cleanup | Manual unsubscribe |
| **Performance** | Fine-grained updates | Zone.js change detection |
| **Learning Curve** | Simple | Complex (operators) |

**Use Signals for:**

✅ Component state
```typescript
const count = signal(0);
const doubled = computed(() => count() * 2);
```

✅ Derived state
```typescript
const filteredTasks = computed(() => {
  return tasks().filter(t => t.status === 'Done');
});
```

✅ UI bindings
```html
<p>Count: {{ count() }}</p>
<p>Doubled: {{ doubled() }}</p>
```

**Use RxJS for:**

✅ HTTP requests
```typescript
this.http.get<Task[]>('/api/tasks').pipe(
  map(response => response.data),
  catchError(this.handleError)
);
```

✅ Event streams
```typescript
fromEvent(button, 'click').pipe(
  debounceTime(300),
  switchMap(() => this.search())
);
```

✅ Complex async operations
```typescript
combineLatest([users$, tasks$]).pipe(
  map(([users, tasks]) => mergeThem(users, tasks))
);
```

**Best Practice: Combine Both!**

```typescript
@Injectable()
export class TaskStore {
  private readonly http = inject(HttpClient);
  
  // Signals for state
  private readonly _tasks = signal<Task[]>([]);
  readonly tasks = asReadonly(this._tasks);
  
  // Observable for async operation
  loadTasks(): void {
    this.http.get<Task[]>('/api/tasks')
      .subscribe(tasks => {
        this._tasks.set(tasks);  // Store in signal
      });
  }
  
  // Computed signal for derived state
  readonly doneTasks = computed(() => {
    return this.tasks().filter(t => t.status === 'Done');
  });
}

// Component
@Component({
  template: `
    <!-- Signal binding (no subscription needed) -->
    @for (task of store.tasks(); track task.id) {
      <app-task-card [task]="task" />
    }
  `
})
export class TaskListComponent {
  protected readonly store = inject(TaskStore);
  
  ngOnInit(): void {
    this.store.loadTasks();  // Observable HTTP call
  }
}
```

**Migration Strategy:**

1. Use Observables for HTTP/async operations
2. Store results in Signals
3. Use Computed for derived state
4. Bind Signals directly in templates
5. No subscriptions needed in components!

---

### Interview Question 8: "What are the benefits of Signals over BehaviorSubject?"

**Answer:**

**Old Way: BehaviorSubject**

```typescript
export class TaskStore {
  private readonly _tasks = new BehaviorSubject<Task[]>([]);
  readonly tasks$ = this._tasks.asObservable();
  
  // Must subscribe in component
  // Must unsubscribe to prevent memory leaks
  // Zone.js triggers change detection on every emit
}

// Component
export class Component implements OnDestroy {
  tasks: Task[] = [];
  private destroy$ = new Subject<void>();
  
  ngOnInit(): void {
    this.store.tasks$
      .pipe(takeUntil(this.destroy$))  // Manual cleanup!
      .subscribe(tasks => {
        this.tasks = tasks;  // Manual assignment!
      });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

**New Way: Signals**

```typescript
export class TaskStore {
  private readonly _tasks = signal<Task[]>([]);
  readonly tasks = asReadonly(this._tasks);
  
  // No subscriptions
  // Auto cleanup
  // Fine-grained change detection
}

// Component
export class Component {
  protected readonly store = inject(TaskStore);
  
  // No subscription code needed!
  // No OnDestroy needed!
  // Direct signal binding in template!
}

// Template
<div>{{ store.tasks().length }} tasks</div>
```

**Benefits:**

1. **Simpler Syntax**
   - `tasks()` vs `tasks$.getValue()`
   - No `.pipe()`, `.subscribe()`

2. **Automatic Cleanup**
   - No memory leaks
   - No `takeUntil`, `ngOnDestroy`

3. **Better Performance**
   - Fine-grained updates
   - Only affected components re-render
   - Path to Zone-less Angular

4. **Type Safety**
   - TypeScript understands signals
   - Better autocomplete

5. **Debugging**
   - Easier to trace changes
   - Clear dependency graph

6. **Computed Optimization**
   - Automatically memoized
   - Only recalculates when needed

**Example: Computed Signals**

```typescript
// BehaviorSubject (OLD)
readonly stats$ = combineLatest([
  this.tasks$,
  this.filters$
]).pipe(
  map(([tasks, filters]) => {
    const filtered = this.filterTasks(tasks, filters);
    return {
      total: filtered.length,
      done: filtered.filter(t => t.status === 'Done').length
    };
  })
);
// Complex, hard to read, creates observables

// Signals (NEW)
readonly stats = computed(() => {
  const filtered = this.filteredTasks();  // Auto dependency tracking
  return {
    total: filtered.length,
    done: filtered.filter(t => t.status === 'Done').length
  };
});
// Simple, readable, automatically optimized
```

---

## 🏪 State Management Patterns

### Interview Question 9: "How do you structure state management in an enterprise Angular app?"

**Answer:**

**Pattern: Feature Stores with Signals**

```typescript
@Injectable({ providedIn: 'root' })
export class TaskStore {
  // ═══════════════════════════════════════════════════
  // 1. PRIVATE STATE (writable signals)
  // ═══════════════════════════════════════════════════
  private readonly _tasks = signal<Task[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _selectedId = signal<number | null>(null);
  private readonly _filters = signal<TaskFilters>({
    search: '',
    status: null,
    priority: null
  });
  
  // ═══════════════════════════════════════════════════
  // 2. PUBLIC STATE (readonly signals)
  // ═══════════════════════════════════════════════════
  readonly tasks = asReadonly(this._tasks);
  readonly loading = asReadonly(this._loading);
  readonly error = asReadonly(this._error);
  readonly filters = asReadonly(this._filters);
  
  // ═══════════════════════════════════════════════════
  // 3. COMPUTED STATE (derived)
  // ═══════════════════════════════════════════════════
  readonly filteredTasks = computed(() => {
    const tasks = this._tasks();
    const filters = this._filters();
    
    return tasks
      .filter(t => !filters.search || 
        t.title.toLowerCase().includes(filters.search.toLowerCase()))
      .filter(t => !filters.status || t.status === filters.status)
      .filter(t => !filters.priority || t.priority === filters.priority);
  });
  
  readonly selectedTask = computed(() => {
    const id = this._selectedId();
    return id ? this._tasks().find(t => t.id === id) : null;
  });
  
  readonly stats = computed(() => {
    const tasks = this.filteredTasks();
    return {
      total: tasks.length,
      done: tasks.filter(t => t.status === 'Done').length,
      inProgress: tasks.filter(t => t.status === 'InProgress').length,
      todo: tasks.filter(t => t.status === 'Todo').length
    };
  });
  
  // ═══════════════════════════════════════════════════
  // 4. ACTIONS (state mutations)
  // ═══════════════════════════════════════════════════
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
  
  selectTask(id: number): void {
    this._selectedId.set(id);
  }
  
  setSearchQuery(query: string): void {
    this._filters.update(f => ({ ...f, search: query }));
  }
  
  setStatusFilter(status: TaskStatus | null): void {
    this._filters.update(f => ({ ...f, status }));
  }
  
  clearFilters(): void {
    this._filters.set({ search: '', status: null, priority: null });
  }
  
  addTask(task: Task): void {
    this._tasks.update(tasks => [...tasks, task]);
  }
  
  updateTask(task: Task): void {
    this._tasks.update(tasks =>
      tasks.map(t => t.id === task.id ? task : t)
    );
  }
  
  removeTask(id: number): void {
    this._tasks.update(tasks => tasks.filter(t => t.id !== id));
  }
}
```

**Component Usage:**

```typescript
@Component({
  selector: 'app-task-list',
  template: `
    <!-- Loading state -->
    @if (store.loading()) {
      <app-loader />
    }
    
    <!-- Error state -->
    @else if (store.error()) {
      <app-error [message]="store.error()" />
    }
    
    <!-- Data state -->
    @else {
      <!-- Stats dashboard -->
      <div class="stats">
        <div>Total: {{ store.stats().total }}</div>
        <div>Done: {{ store.stats().done }}</div>
        <div>In Progress: {{ store.stats().inProgress }}</div>
      </div>
      
      <!-- Filters -->
      <app-search-box
        [value]="store.filters().search"
        (search)="store.setSearchQuery($event)" />
      
      <!-- Task list -->
      @for (task of store.filteredTasks(); track task.id) {
        <app-task-card
          [task]="task"
          [selected]="task.id === store.selectedTask()?.id"
          (click)="store.selectTask(task.id)" />
      }
      
      <!-- Empty state -->
      @empty {
        <app-empty-state
          title="No tasks found"
          (action)="store.clearFilters()" />
      }
    }
  `
})
export class TaskListComponent {
  protected readonly store = inject(TaskStore);
  
  ngOnInit(): void {
    this.store.loadTasks();
  }
}
```

**WHY This Pattern?**

1. ✅ **Centralized State**: Single source of truth
2. ✅ **Encapsulation**: Private writable, public readonly
3. ✅ **Computed Optimization**: Automatic memoization
4. ✅ **Type Safety**: TypeScript enforced
5. ✅ **Predictable**: Actions are the only way to mutate
6. ✅ **Testable**: Easy to mock and test
7. ✅ **Performance**: Fine-grained reactivity

---

## 💉 Dependency Injection

### Interview Question 10: "Explain Dependency Injection and why it's important."

**Answer:**

**What is DI?**

Dependency Injection is a design pattern where Angular provides (injects) dependencies into classes instead of classes creating them manually.

**Without DI (BAD):**

```typescript
export class TaskComponent {
  // Tightly coupled to concrete implementation
  private taskService = new TaskService();
  private http = new HttpClient();
  
  // Hard to test (can't mock services)
  // Hard to change (must modify component code)
}
```

**With DI (GOOD):**

```typescript
export class TaskComponent {
  // Loosely coupled to abstraction
  private taskService = inject(TaskService);
  
  // Easy to test (inject mock service)
  // Easy to change (swap implementation via providers)
}
```

**WHY DI Matters:**

1. **Testability**
   ```typescript
   // Test with mock service
   TestBed.configureTestingModule({
     providers: [
       { provide: TaskService, useValue: mockTaskService }
     ]
   });
   ```

2. **Flexibility**
   ```typescript
   // Swap implementations per environment
   providers: [
     {
       provide: DataService,
       useClass: environment.production
         ? RealDataService
         : MockDataService
     }
   ]
   ```

3. **Lifecycle Management**
   ```typescript
   @Injectable({ providedIn: 'root' })  // Singleton
   export class AuthService {
     // Angular manages creation/destruction
   }
   ```

4. **Loose Coupling**
   ```typescript
   // Component doesn't know how TaskService is created
   export class Component {
     private service = inject(TaskService);
   }
   ```

**DI Scope Hierarchy:**

```
Root Injector (App-wide singletons)
    ↓
Feature Injector (Lazy-loaded feature)
    ↓
Component Injector (Component instance)
```

**Provider Configurations:**

```typescript
// 1. Root-level (Singleton)
@Injectable({ providedIn: 'root' })
export class AuthService {}

// 2. Feature-level
{
  path: 'tasks',
  loadComponent: () => import('./tasks'),
  providers: [TaskService]  // New instance per feature load
}

// 3. Component-level
@Component({
  providers: [FormService]  // New instance per component
})
export class TaskFormComponent {}
```

---

This comprehensive guide continues with the remaining sections. Would you like me to continue with Service Architecture, HttpClient, Folder Structure, and SOLID Principles sections?
