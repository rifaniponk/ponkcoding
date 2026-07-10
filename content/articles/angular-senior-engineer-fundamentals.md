---
title: 'Angular Senior Engineer Fundamentals: A Technical Reference'
slug: 'angular-senior-engineer-fundamentals'
description: 'A deep technical reference for senior Angular engineers: change detection mechanics, zone.js vs zoneless, signals, change detection strategies, injection contexts, reactive patterns, and performance optimization techniques.'
date: '2026-07-10'
updated: '2026-07-10'
category: 'Web Development'
tags:
  - angular
  - angular-signals
  - change-detection
  - zoneless
  - performance
  - dependency-injection
  - rxjs
status: 'published'
author: 'Rifan Fauzi'
cover: '/images/articles/angular/cover.jpg'
featured: true
---

This is a personal reference for senior Angular engineers: concepts you've internalized but occasionally need to re-verify. It is not a tutorial, but a condensed technical reference with code you can grep.

---

## Change Detection: The Mental Model

### Default Strategy (Default Change Detection)

In the classic Zone.js model, Angular schedules an application change detection pass after many browser async tasks. The pass walks the component view tree **top-down**, evaluates template bindings, and updates the DOM where bound values changed.

```typescript
// Legacy zone-based default: many async tasks schedule an app-level check.
@Component({
  selector: 'app-root',
  template: `{{ counter }}`,
  changeDetection: ChangeDetectionStrategy.Default, // explicit
})
export class AppComponent {
  counter = 0
  increment() {
    this.counter++
  } // triggers full tree check
}
```

**What commonly schedules a check in zone-based apps:**

- Template or host events, such as click handlers
- Timers, promises, XHR/fetch completion, and other patched browser APIs
- Observable emissions when they are bridged into Angular, for example through the `async` pipe

**Cost model:** a scheduled pass can visit a large part of the view tree. With 1000 components and frequent events, the problem is rarely one binding, but repeated tree walks.

---

### OnPush Strategy

`ChangeDetectionStrategy.OnPush` restricts checks to when:

1. A template-bound input receives a new value. Object inputs still need a new reference.
2. Angular handles a template or host event in the component subtree.
3. `ChangeDetectorRef.markForCheck()` marks the component dirty.
4. An `Observable` subscribed via `async` pipe emits.
5. A signal read by the template changes.

```typescript
@Component({
  selector: 'app-user-card',
  template: `{{ user().name }}`, // signal or @Input()
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCard {
  @Input({ required: true }) user!: User
  @Input() user$?: Observable<User>

  // Or with signals (Angular 17+)
  userInput = input.required<User>()
}
```

**Key insight:** OnPush does not mean "never check." It means "skip this subtree until Angular has a reason to treat it as dirty." Mutating an object passed as `@Input()` keeps the same reference, so Angular will not treat it as a new input.

```typescript
// ❌ Won't trigger OnPush detection
user.name = 'New Name'

// ✅ Will trigger (new reference)
this.user = { ...this.user, name: 'New Name' }
// or with signals:
this.user.update((u) => ({ ...u, name: 'New Name' }))
```

---

### Zone.js vs Zoneless

**Zone.js** (legacy model): Monkey-patches browser async APIs and uses those callbacks as a broad signal that Angular should run change detection.

**Zoneless** (stable since Angular 20.2, default in Angular 21+): Angular no longer uses Zone.js as the scheduler. It schedules change detection from Angular APIs: signal updates read by templates, template or host listeners, `markForCheck()`, `ComponentRef.setInput()`, view attach/remove, and render hooks that mark state dirty.

```typescript
// main.ts, for Angular versions or apps where zoneless is not already default.
import { bootstrapApplication } from '@angular/platform-browser'
import { provideZonelessChangeDetection } from '@angular/core'

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    // other providers
  ],
})
```

**Migration impact:**

- `NgZone.run()` → unnecessary (but kept for compatibility)
- `NgZone.runOutsideAngular()` → unnecessary
- `async` pipe still works (uses `markForCheck` internally)
- `setTimeout`/`setInterval`/`Promise` no longer auto-trigger CD
- Use signals for state that templates read, or call `ChangeDetectorRef.markForCheck()` at integration boundaries

---

## Signals: The New Reactive Primitive

Signals are **synchronous**, **glitch-free**, and **lazy**. They track reads and writes automatically.

### Core Signal Types

```typescript
import { signal, computed, effect, Signal, WritableSignal } from '@angular/core'

// Writable signal: mutable source
const count = signal(0)
count.set(5)
count.update((v) => v + 1)
items.update((current) => [...current, newItem]) // arrays/objects need a new value

// Computed signal: derived, read-only, memoized
const double = computed(() => count() * 2)

// Effect: side effects for non-reactive APIs.
effect(() => {
  console.log('Count changed:', count())
})
```

### Signals in Components

```typescript
@Component({
  selector: 'app-counter',
  template: `
    <button (click)="count.update((c) => c + 1)">+</button>
    <span>{{ count() }}</span>
    <span>{{ double() }}</span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CounterComponent {
  count = signal(0)
  double = computed(() => this.count() * 2)

  // Effect for side effects (logging, persisting, etc.)
  private logEffect = effect(() => {
    console.log('Count:', this.count())
  })
}
```

### `input()` and `output()`: Function-Based Inputs/Outputs (Angular 17+)

```typescript
@Component({
  selector: 'app-user-card',
  template: `{{ user().name }} <button (click)="select.emit(user())">Select</button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCard {
  // Required signal input
  user = input.required<User>()

  // Optional with default
  variant = input<'card' | 'list'>('card')

  // Transform input (coerce, validate)
  limit = input(10, { transform: (v) => Math.max(1, Number(v)) })

  // Function-based output. This is an OutputEmitterRef, not a signal.
  select = output<User>()

  // Computed from input
  displayName = computed(() => this.user().name.toUpperCase())
}
```

**Migration from `@Input()`/`@Output()`:**

```typescript
// Old
@Input() user!: User;
@Output() select = new EventEmitter<User>();

// New (signal-based)
user = input.required<User>();
select = output<User>();
```

---

## Dependency Injection: Injection Contexts

Angular's DI is hierarchical. Understanding **injection context** is critical for senior engineers.

### Where Injection Context Exists

```typescript
// Component constructor: injection context
constructor(private service: MyService) {}

// Directive constructor
constructor(private el: ElementRef) {}

// Pipe constructor
constructor(private sanitizer: DomSanitizer) {}

// Provider factory functions
providers: [
  { provide: MyService, useFactory: () => new MyService(inject(HttpClient)) }
]

// inject() in field initializer (Angular 15+)
private http = inject(HttpClient);

// Regular function: no injection context
function helper() {
  const svc = inject(MyService); // ERROR: no injection context
}

// setTimeout callback: no injection context
setTimeout(() => inject(MyService), 1000);

// runInInjectionContext, when you need DI outside.
constructor(private injector: EnvironmentInjector) {}
runInInjectionContext(this.injector, () => {
  const svc = inject(MyService); // ✅ works
});
```

### Hierarchical Injectors

```
PlatformInjector (NgModule providers, platform providers)
    │
    └─ Root ModuleInjector (AppModule/bootstrapped providers)
         │
         └─ Component Injector Tree (mirrors component tree)
              │
              ├─ AppComponent (providers: [UserService])
              │    │
              │    ├─ HeaderComponent (providers: [AuthService])
              │    │    │
              │    │    └─ UserMenuComponent (injects AuthService → Header's)
              │    │
              │    └─ DashboardComponent (injects UserService → AppComponent's)
```

**Resolution:** A request starts at the current injection context, then walks up the injector hierarchy until Angular finds a provider. `providedIn: 'root'` registers with the root application injector, so the service is usually a singleton for the app. Component `providers` create instances scoped to that component subtree.

---

### `inject()` Function Patterns

```typescript
// Basic injection
private http = inject(HttpClient);

// Optional: returns null if not provided
private optionalSvc = inject(OptionalService, { optional: true });

// Self: only check current injector, don't go up
private localSvc = inject(LocalService, { self: true });

// SkipSelf: start from parent, skip current
private parentSvc = inject(ParentService, { skipSelf: true });

// Host: for directives, get from host component
@Directive({ selector: '[appHighlight]' })
export class HighlightDirective {
  private renderer = inject(Renderer2);
  private el = inject(ElementRef);

  @HostListener('mouseenter') onEnter() {
    this.renderer.setStyle(this.el.nativeElement, 'background', 'yellow');
  }
}

// Signal-based injection (Angular 17.1+)
userService = inject(UserService);
user = computed(() => this.userService.currentUser());
```

---

## Reactive Patterns: RxJS + Signals Interop

### Converting Between Signals and Observables

```typescript
import { toSignal, toObservable } from '@angular/core/rxjs-interop'
import { Observable, of, fromEvent, interval } from 'rxjs'
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators'

// Observable → Signal (with initial value)
user$ = this.http.get<User>('/api/user').pipe(catchError(() => of(null)))
user = toSignal(this.user$, { initialValue: null })

// Signal → Observable
count = signal(0)
count$ = toObservable(this.count)

// Event → Signal
clicks = toSignal(
  fromEvent(button, 'click').pipe(
    debounceTime(300),
    map(() => this.inputRef.nativeElement.value),
  ),
  { initialValue: '' },
)
```

### `toSignal` Options

```typescript
// initialValue: required for synchronous reads before first emission
user = toSignal(user$, { initialValue: null })

// requireSync: throw if first value is not synchronous
data = toSignal(asyncData$, { requireSync: true })

// equal: custom equality for change detection
items = toSignal(items$, {
  equal: (a, b) => a.id === b.id,
})
```

---

### Common RxJS Patterns in Angular

```typescript
// 1. SwitchMap for search autocomplete
searchResults = toSignal(
  this.searchControl.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(query => this.api.search(query)),
    catchError(() => of([]))
  ),
  { initialValue: [] }
);

// 2. CombineLatest for dependent data
vm = toSignal(
  combineLatest([
    this.currentUser$,
    this.permissions$,
    this.settings$
  ]).pipe(
    map(([user, perms, settings]) => ({ user, perms, settings }))
  ),
  { initialValue: { user: null, perms: [], settings: {} } }
);

// 3. ShareReplay for multicasting expensive requests
users$ = this.http.get<User[]>('/api/users').pipe(
  shareReplay({ bufferSize: 1, refCount: true })
);

// 4. TakeUntil for cleanup
destroy$ = new Subject<void>();
ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}

// Usage in component
data$.pipe(takeUntil(this.destroy$)).subscribe();

// 5. Async pipe alternative with signals
// Instead of: user$ | async
// Use: user = toSignal(user$, { initialValue: null });
// Template: {{ user()?.name }}
```

---

## Performance Optimization Patterns

### 1. TrackBy Functions (Critical for `*ngFor`)

```typescript
@Component({
  template: `
    <div *ngFor="let item of items(); trackBy: trackById">
      {{ item.name }}
    </div>
  `,
})
export class ListComponent {
  items = signal<Item[]>([])

  // Or with computed for derived arrays
  filteredItems = computed(() => this.items().filter((i) => i.active))
  trackById = (_: number, item: Item) => item.id
}
```

**Without `trackBy`:** Angular destroys/recreates all DOM nodes on array change.
**With `trackBy`:** Only moved/changed nodes are touched.

---

### 2. `ChangeDetectorRef` Manual Control

**Use case:** You have an OnPush component that needs to respond to events outside Angular's zone (e.g., WebSocket, third-party library, `requestAnimationFrame`). In zoneless mode, this is also how you manually signal Angular that something changed.

```typescript
@Component({ changeDetection: ChangeDetectionStrategy.OnPush })
export class HeavyComponent {
  constructor(private cdr: ChangeDetectorRef) {}

  // After async operation outside Angular zone
  loadData() {
    this.externalLib.onData((data) => {
      this.data = data
      this.cdr.markForCheck() // mark this component + ancestors
    })
  }

  // Force check this component and children
  forceCheck() {
    this.cdr.detectChanges() // runs CD on this subtree
  }

  // Detach from CD tree (manual control)
  detach() {
    this.cdr.detach()
  }
  reattach() {
    this.cdr.reattach()
    this.cdr.detectChanges()
  }
}
```

---

### 3. Lazy Loading & Code Splitting

**Use case:** Reduce initial bundle size by deferring feature modules, routes, and even individual components until they're needed. Every `loadChildren` or `loadComponent` creates a separate chunk that the browser only fetches on demand.

```typescript
// Route-level lazy loading (standard)
const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then((r) => r.ADMIN_ROUTES),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
]

// Component-level lazy loading (Angular 17+)
@Component({
  template: `
    <button (click)="loadHeavy()">Load Heavy</button>
    @if (heavyComponent()) {
      <ng-container *ngComponentOutlet="heavyComponent()" />
    }
  `,
})
export class HostComponent {
  heavyComponent = signal<Type<HeavyComponent> | null>(null)

  async loadHeavy() {
    const { HeavyComponent } = await import('./heavy/heavy.component')
    this.heavyComponent.set(HeavyComponent)
  }
}
```

---

### 4. Virtual Scrolling (CDK)

**Use case:** You have a large list (1000+ items) and rendering all DOM nodes at once would kill performance. Virtual scrolling only renders the visible rows plus a small buffer above and below the viewport. The rest are recycled or not yet created, so DOM node count stays bounded regardless of list size.

```typescript
import { ScrollingModule } from '@angular/cdk/scrolling'

@Component({
  imports: [ScrollingModule],
  template: `
    <cdk-virtual-scroll-viewport itemSize="50" class="viewport">
      <div *cdkVirtualFor="let item of items(); trackBy: trackById" class="item">
        {{ item.name }}
      </div>
    </cdk-virtual-scroll-viewport>
  `,
  styles: [
    `
      .viewport {
        height: 400px;
        width: 100%;
      }
      .item {
        padding: 8px;
        border-bottom: 1px solid #eee;
      }
    `,
  ],
})
export class VirtualListComponent {
  items = signal<Item[]>(Array.from({ length: 10000 }, (_, i) => ({ id: i, name: `Item ${i}` })))
  trackById = (_: number, item: Item) => item.id
}
```

---

### 5. `OnPush` + Signals = Optimal Performance

```typescript
@Component({
  selector: 'app-data-grid',
  template: `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        @for (row of displayedRows(); track row.id) {
          <tr [class.highlight]="row.id === highlightedId()">
            <td>{{ row.id }}</td>
            <td>{{ row.name }}</td>
            <td>{{ row.status }}</td>
          </tr>
        }
      </tbody>
    </table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class DataGridComponent {
  // Input as signal
  rows = input.required<Row[]>()
  highlightedId = input<number | null>(null)

  // Derived: only recomputes when rows() or highlightedId() changes
  displayedRows = computed(() => this.rows().filter((r) => r.visible))
}
```

**Why this is fast:**

- `OnPush` = no CD unless input reference changes
- Signals = fine-grained reactivity, no dirty checking
- `computed` = memoized, only re-runs when dependencies change
- `track` in `@for` = DOM node reuse

---

### 6. Functional DI in Tree-Shakable Services

**Use case:** Keep services tree-shakable by registering them with `providedIn: 'root'` or a narrow component provider instead of broad NgModule provider arrays. `inject()` is a clean field-initializer style for service dependencies, but tree-shaking comes from provider scope and actual usage, not from replacing constructors by itself.

```typescript
// service.ts
import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private _user = signal<User | null>(null);
  readonly user = this._user.asReadonly();

  loadUser(id: string) {
    return this.http.get<User>(`/api/users/${id}`).pipe(
      tap(user => this._user.set(user))
    );
  }
}

// component.ts
@Component({...})
export class ProfileComponent {
  private userService = inject(UserService);
  user = this.userService.user; // signal, reactive
}
```

---

## Advanced Patterns

### 1. Coalescing Multiple State Changes

**Use case:** When rapid user input (typing, dragging, slider moves) would trigger many signal writes in sequence, each write can invalidate dependent state. Coalescing batches pending changes into a single flush: one state update and no wasted intermediate renders.

```typescript
@Component({...})
export class FormComponent {
  #pendingChanges = signal<Partial<FormData>>({});

  // Batch updates before committing to the main form state.
  updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    this.#pendingChanges.update(current => ({ ...current, [key]: value }));
  }

  // Flush on blur or submit
  @HostListener('blur') onBlur() {
    this.#flushChanges();
  }

  #flushChanges() {
    const changes = this.#pendingChanges();
    if (Object.keys(changes).length) {
      this.formData.update(current => ({ ...current, ...changes }));
      this.#pendingChanges.set({});
    }
  }
}
```

---

### 2. Signal-Based State Management (Mini Store)

**Use case:** Instead of NgRx or a full state management library, you can build a lightweight store with just signals + `computed` + `effect`. Perfect for component-level state that doesn't need Redux tooling. The store is a plain class injected via DI, with reactive selectors via `computed`. Bonus: optimistic updates become trivial because signals are synchronous.

```typescript
// store/todo.store.ts
import { signal, computed, effect } from '@angular/core'
import { inject } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { TodoApiService } from './todo.api'

export class TodoStore {
  private api = inject(TodoApiService)

  #todos = signal<Todo[]>([])
  #filter = signal<'all' | 'active' | 'completed'>('all')
  #loading = signal(false)

  readonly todos = this.#todos.asReadonly()
  readonly filter = this.#filter.asReadonly()
  readonly loading = this.#loading.asReadonly()

  readonly filteredTodos = computed(() => {
    const filter = this.#filter()
    const todos = this.#todos()
    if (filter === 'all') return todos
    return todos.filter((t) => (filter === 'active' ? !t.done : t.done))
  })

  readonly activeCount = computed(() => this.#todos().filter((t) => !t.done).length)

  async load() {
    this.#loading.set(true)
    try {
      const todos = await firstValueFrom(this.api.getAll())
      this.#todos.set(todos)
    } finally {
      this.#loading.set(false)
    }
  }

  add(title: string) {
    const optimistic: Todo = { id: crypto.randomUUID(), title, done: false }
    this.#todos.update((t) => [...t, optimistic])
    this.api.create(title).subscribe({
      next: (real) => this.#todos.update((t) => t.map((x) => (x.id === optimistic.id ? real : x))),
      error: () => this.#todos.update((t) => t.filter((x) => x.id !== optimistic.id)),
    })
  }

  toggle(id: string) {
    this.#todos.update((t) => t.map((x) => (x.id === id ? { ...x, done: !x.done } : x)))
  }

  setFilter(filter: 'all' | 'active' | 'completed') {
    this.#filter.set(filter)
  }
}

// Provide in component (not root) for per-instance state
@Component({
  providers: [TodoStore],
  template: `...`,
})
export class TodoComponent {
  store = inject(TodoStore)
  // use store.todos(), store.filteredTodos(), etc.
}
```

---

### 3. `runInInjectionContext` for Non-DI Contexts

**Use case:** When you need DI (e.g., `HttpClient`, `ConfigService`) in a place that's outside Angular's injection context, such as utility functions, custom operators, event callbacks, or class constructors that are not components/directives/pipes. Wrap the DI-dependent code in `runInInjectionContext` with a captured `EnvironmentInjector` reference.

```typescript
// utils/rxjs-operators.ts
import { inject, runInInjectionContext, EnvironmentInjector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export function createApiCall<T>(url: string): Observable<T> {
  // This function runs outside DI context
  // But we can capture injector at call site
  return new Observable(subscriber => {
    // Can't use inject() here directly
  });
}

// Usage in component with DI context
@Component({...})
export class MyComponent {
  private injector = inject(EnvironmentInjector);

  loadData() {
    runInInjectionContext(this.injector, () => {
      const http = inject(HttpClient); // ✅ works
      return http.get('/api/data');
    }).subscribe();
  }
}
```

---

### 4. Testing with Signals and Zoneless

**Use case:** When testing with zoneless change detection, do not assume Zone.js will flush the view after arbitrary async work. Prefer explicit `fixture.detectChanges()` after state changes when the assertion depends on rendered DOM. This keeps tests deterministic because you control when the view is refreshed.

```typescript
// component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideZonelessChangeDetection } from '@angular/core'

describe('CounterComponent', () => {
  let fixture: ComponentFixture<CounterComponent>
  let component: CounterComponent

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CounterComponent],
      providers: [
        provideZonelessChangeDetection(), // for zoneless tests
      ],
    })
    fixture = TestBed.createComponent(CounterComponent)
    component = fixture.componentInstance
    fixture.detectChanges() // manual CD trigger
  })

  it('should update signal and reflect in template', () => {
    expect(fixture.nativeElement.textContent).toContain('0')

    component.count.set(5)
    fixture.detectChanges() // required in zoneless tests

    expect(fixture.nativeElement.textContent).toContain('5')
  })

  it('should compute derived signal', () => {
    component.count.set(10)
    fixture.detectChanges()
    expect(component.double()).toBe(20)
  })
})
```

---

### 5. Interoperability: Signals ↔ RxJS in Effects

**Use case:** When you need RxJS operators (debounce, switchMap, distinctUntilChanged) inside a signal-based workflow. Usually prefer one bridge at the boundary, such as `toObservable(query).pipe(...)`, then convert the final stream back with `toSignal`. If you do subscribe inside an `effect`, use the `onCleanup` callback; returning a cleanup function from the effect body is not the Angular API.

```typescript
@Component({...})
export class SearchComponent {
  query = signal('');

  // Side effect: debounced search
  private searchEffect = effect((onCleanup) => {
    const q = this.query();
    if (!q) return;

    // Use toObservable for async work
    const sub = toObservable(this.query).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => this.api.search(q)),
    ).subscribe(results => {
      this.results.set(results);
      this.cdr.markForCheck(); // needed in zoneless
    });

    // Cleanup on effect re-run or destroy
    onCleanup(() => sub.unsubscribe());
  });

  results = signal<Result[]>([]);

  constructor(
    private api: SearchApiService,
    private cdr: ChangeDetectorRef
  ) {}
}
```

---

## Migration Checklist: Zone.js → Zoneless + Signals

| Legacy Pattern                      | Modern Replacement                                             |
| ----------------------------------- | -------------------------------------------------------------- |
| `@Input()` / `@Output()`            | `input()` / `output()` for new component APIs                  |
| `ChangeDetectorRef.detectChanges()` | Prefer signal-driven state; use `markForCheck()` first         |
| `NgZone.runOutsideAngular()`        | Usually unnecessary when Zone.js is removed                    |
| `async` pipe                        | Still valid, or `toSignal(observable, { initialValue })`       |
| `BehaviorSubject` in service        | `signal()` + `computed()` for synchronous local state          |
| `takeUntil(destroy$)`               | `takeUntilDestroyed()` or `DestroyRef`                         |
| NgModule provider arrays            | `providedIn: 'root'` or scoped component providers             |
| `constructor(private svc: Svc)`     | `private svc = inject(Svc)` where field injection reads better |

### `DestroyRef` (Angular 16+): Cleanup Without `ngOnDestroy`

```typescript
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({...})
export class MyComponent {
  private destroyRef = inject(DestroyRef);

  constructor() {
    // Auto-unsubscribes when component destroyed
    this.data$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe();

    // Or for manual cleanup
    this.destroyRef.onDestroy(() => {
      this.cleanup();
    });
  }
}
```

---

## Quick Reference: Signal API

| Function                       | Purpose                                | Returns               |
| ------------------------------ | -------------------------------------- | --------------------- |
| `signal(initial)`              | Create writable signal                 | `WritableSignal<T>`   |
| `computed(() => ...)`          | Derived read-only signal               | `Signal<T>`           |
| `effect(() => ...)`            | Side effect, runs on signal read       | `EffectRef`           |
| `input()` / `input.required()` | Component input as signal              | `InputSignal<T>`      |
| `output()`                     | Component output emitter               | `OutputEmitterRef<T>` |
| `model()`                      | Two-way binding signal                 | `ModelSignal<T>`      |
| `toSignal(obs, opts)`          | Observable → Signal                    | `Signal<T>`           |
| `toObservable(sig)`            | Signal → Observable                    | `Observable<T>`       |
| `linkedSignal(() => ...)`      | Signal that resets when source changes | `WritableSignal<T>`   |
| `untracked(() => ...)`         | Read signals without tracking          | `T`                   |

---

## Mental Models to Keep

1. **Signals are synchronous**: reading a signal during computation creates a dependency. Writing invalidates dependents immediately, then Angular schedules the relevant work.

2. **Computed is lazy**: it only computes when read. If nothing reads it, it never runs.

3. **OnPush + signals narrows work**: components update when Angular has a reason to mark them dirty, and template-read signals are one of the most precise reasons.

4. **Injection context is lexical**: `inject()` works in field initializers, constructor bodies, and factory functions. Not in callbacks, timeouts, or plain functions unless you create a context explicitly.

5. **Zoneless removes Zone.js scheduling**: signals, Angular listeners, `markForCheck()`, and input updates become the important scheduling signals. RxJS needs an Angular bridge such as `async` pipe or `toSignal`.

6. **TrackBy is non-negotiable**: for any list over ~20 items, always provide `trackBy` or `track`.

7. **Effects are for side effects**: use them for non-reactive APIs such as logging and persistence. Do not derive state with effects when `computed` expresses the dependency directly.

8. **Tree-shakable providers**: prefer `providedIn: 'root'` or component-level `providers: [Service]` over broad module-level provider arrays.

---

## Further Reading

- [Angular Signals Guide](https://angular.dev/guide/signals)
- [Angular Zoneless Guide](https://angular.dev/guide/zoneless)
- [Skipping Component Subtrees](https://angular.dev/best-practices/skipping-subtrees)
- [RxJS Interop with Angular Signals](https://angular.dev/ecosystem/rxjs-interop)
- [WritableSignal API](https://angular.dev/api/core/WritableSignal)

---

_This reference lives in `content/articles/angular-senior-engineer-fundamentals.md`. Update it when Angular ships new primitives._
