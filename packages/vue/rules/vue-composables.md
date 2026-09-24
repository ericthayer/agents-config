# Vue composables

- Name stateful reusable functions `useXxx` and give each one a focused
  responsibility. Keep pure formatting/validation functions as plain utilities.
- Create per-consumer state inside the function. Document whether state is
  instance-local, provided, or store-owned; a shared file does not imply shared
  state.
- Return a plain object of refs/computed refs and named actions so callers can
  destructure without losing updates. Expose readonly refs when only actions
  should mutate state. Pinia setup stores have different requirements; see
  [state guidance](./vue-state.md).
- When input may change, accept a ref/getter rather than capturing a primitive
  once. On Vue 3.3+, use `MaybeRefOrGetter<T>` and normalize with `toValue()` inside
  a computed getter or watcher so dependencies are tracked.
- Call lifecycle-dependent composables synchronously from setup. Bind teardown
  to the owning component/effect scope; do not create orphan watchers later in
  timers or promise callbacks.

Example of a getter-aware, derived composable (Vue 3.3+):

```ts
import { computed, toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';

export function useTextFilter<T>(
  items: MaybeRefOrGetter<readonly T[]>,
  query: MaybeRefOrGetter<string>,
  label: (item: T) => string,
) {
  const filteredItems = computed(() => {
    const term = toValue(query).trim().toLocaleLowerCase();
    return toValue(items).filter(item =>
      label(item).toLocaleLowerCase().includes(term),
    );
  });
  return { filteredItems };
}
```

On older Vue 3 versions, accept an explicit `Ref<T>` or getter contract using
available APIs instead of importing unsupported helpers.

## Async ownership and cleanup

- Expose loading, data, and error states explicitly. Validate external data at
  the application boundary; do not claim a type assertion validates a response.
- Watch the specific key/query and register cleanup before awaiting work. Cancel
  obsolete requests with `AbortController` when supported and guard against stale
  completion overwriting newer data, errors, or pending state.
- Prefer the watcher callback's `onCleanup` argument for broad compatibility.
  `onWatcherCleanup()` requires Vue 3.5+ and synchronous registration.
  `watchEffect()` tracks only dependencies read before its first `await`.
- Treat intentional cancellation separately from failures. Surface real failures
  with actionable state; do not turn them into an empty successful result.
- Remove listeners and stop timers/observers on unmount or scope disposal.
  Test cleanup, changing inputs, rapid changes, errors, and independent instances
  using the [testing guidance](../instructions/vue-testing.instructions.md).

Sources: [composables and input normalization](https://vuejs.org/guide/reusability/composables.html),
[watcher tracking, cleanup, and lifetime](https://vuejs.org/guide/essentials/watchers.html).
