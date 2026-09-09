# Angular signals and dependency injection

## Signals and component contracts

- Use `signal()` for owned synchronous state and `computed()` for pure derived
  values. Read signals by calling them; update with `set()` or `update()`.
- Return new arrays/objects rather than mutating nested values in place.
  `asReadonly()` restricts writes through the signal API, not deep mutation.
- Use `input()` / `input.required<T>()` and `output<T>()` where stable in the
  installed version (Angular 19+). Declare them in property initializers.
  Outputs emit events; they are not writable signals or general RxJS streams.
- Do not read required inputs during construction before Angular supplies them.
  Derive from them in `computed()` or consume them after inputs are initialized.
- Use effects only for genuine side effects, not to copy one signal into
  another or propagate derived state. Establish the required injection context
  and clean up timers/listeners/work when the effect is invalidated or destroyed.

## Dependency scope is state lifetime

- Use `inject()` in an injection context, such as a class field initializer or
  constructor. Ordinary event handlers and lifecycle methods do not themselves
  create an injection context; capture dependencies during construction.
- Use `@Injectable({ providedIn: 'root' })` for application-wide services; use
  component or route providers deliberately for narrower ownership. A component
  provider creates state per component instance. Do not assume route-scoped
  state resets on every navigation; account for injector lifetime and reuse.
- Use typed `InjectionToken<T>` values for interfaces/configuration that do not
  have a runtime class token. Do not manually construct injected dependencies.
- Expose readonly state and explicit update methods from shared services. Keep
  transport, domain logic, and presentation responsibilities separate.

Example of an intentionally application-wide state service:

```ts
import { computed, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SelectionStore {
  private readonly selectedIds = signal<readonly string[]>([]);
  readonly ids = this.selectedIds.asReadonly();
  readonly count = computed(() => this.selectedIds().length);

  select(id: string): void {
    this.selectedIds.update(ids => ids.includes(id) ? ids : [...ids, id]);
  }

  clear(): void {
    this.selectedIds.set([]);
  }
}
```

Sources: [signals](https://angular.dev/guide/signals),
[dependency injection](https://angular.dev/guide/di),
[injection context](https://angular.dev/guide/di/dependency-injection-context),
[`Injectable`](https://angular.dev/api/core/Injectable),
[signal inputs](https://angular.dev/reference/migrations/signal-inputs),
[outputs](https://angular.dev/reference/migrations/outputs).
