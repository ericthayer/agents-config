# Vue local and shared state

| State | Default owner |
| --- | --- |
| Open panel, local draft, selection | Component `ref()` / `reactive()` |
| Reusable independent stateful behavior | Composable instantiated per consumer |
| Context shared by a component subtree | Typed `provide` / `inject` |
| Shared domain state across features/routes | Pinia when warranted or already installed |
| Bookmarkable filters and pagination | Vue Router query/parameters |

Keep one source of truth and derive view models with `computed()`. Do not copy
props or route queries into a store merely to make them accessible.

## Provided state

Use an `InjectionKey<T>` with an explicit contract. Keep mutations in the provider
and expose readonly state plus actions when appropriate. Handle a missing
required provider explicitly rather than asserting that injection cannot fail.
For simple parent/child communication, prefer props/emits.

## Pinia when appropriate

- Reuse existing stores before adding one. Do not install Pinia just for a single
  component's state; document why a new shared store is necessary.
- Install one Pinia instance on the application and ensure it is active before
  consuming stores. In server-rendered applications, state must be isolated per
  application/request rather than in a cross-request module singleton.
- Define each store in its own file with a unique ID and a `useXxxStore` export.
  Match the project's setup-store or option-store style.
- In setup stores, refs are state, computed values are getters, and functions
  are actions. Return all store state; hiding it or wrapping it in `readonly()`
  breaks Pinia's state tracking/tooling and server-rendering expectations.
  This differs from an ordinary composable's readonly public API.
- Access state through the store, or use `storeToRefs(store)` to destructure
  state/getters without losing tracking. Actions can be destructured directly.
- Keep multi-step mutations and async domain operations in actions. Model pending
  and failure states and define reset behavior for account/feature changes.
  Setup stores need an explicit reset action if reset is part of the contract.
- Do not persist sensitive state or introduce persistence plugins by default.
  Keep temporary form drafts local unless cross-route persistence is required.

Test with a fresh Pinia instance per test. A testing Pinia may stub actions;
do not mistake verifying a stub call for exercising the action implementation.
See [testing](../instructions/vue-testing.instructions.md).

Sources: [Vue typed injection](https://vuejs.org/guide/typescript/composition-api.html#typing-provide-inject),
[Pinia store contracts](https://pinia.vuejs.org/core-concepts/),
[state and reset behavior](https://pinia.vuejs.org/core-concepts/state.html),
[Pinia testing](https://pinia.vuejs.org/cookbook/testing.html).
