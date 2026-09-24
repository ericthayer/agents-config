---
applyTo: "**/*.spec.ts,**/*.test.ts,**/*.spec.js,**/*.test.js"
---

# Vue testing

Use the application's existing runner and SFC-aware configuration. Official Vue
guidance recommends Vitest for Vite-based projects and Vue Test Utils for
component tests; that is not permission to replace existing tooling or install
dependencies during routine scaffolding.

## Components and composables

- Mount the real SFC with representative props, slots, and required providers.
  Assert rendered behavior and emitted payloads rather than private setup state.
  Do not stub the child behavior the test is intended to exercise.
- Await `setProps()`, `setValue()`, and `trigger()` before DOM assertions. Use
  `nextTick()` for Vue rendering and `flushPromises()` for queued promise handlers.
  Neither helper makes an unresolved network request or timer finish; resolve
  mocks and advance controlled timers explicitly.
- Test defaults, changing props, repeated instances, events, conditional content,
  empty/error/pending states, and keyboard/form interactions.
- Pure composables can be invoked directly. Mount a small host for composables
  that depend on lifecycle or injection, then unmount it to verify cleanup.
- Test changing ref/getter inputs, stale-result protection, failure/retry, and
  disposal. Restore fake timers and mocks and unmount wrappers between tests.

Example for the scaffold's `ActionButton.vue`, assuming the project uses Vitest
and Vue Test Utils:

```ts
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ActionButton from './ActionButton.vue';

describe('ActionButton', () => {
  it('renders its label and emits activation', async () => {
    const wrapper = mount(ActionButton, { props: { label: 'Save' } });
    try {
      expect(wrapper.get('button').text()).toBe('Save');
      await wrapper.get('button').trigger('click');
      expect(wrapper.emitted('activate')).toEqual([[]]);
      await wrapper.setProps({ label: 'Continue' });
      expect(wrapper.get('button').text()).toBe('Continue');
    } finally {
      wrapper.unmount();
    }
  });
});
```

## Feature integration

- Forms: exercise actual input, blur, and submit events, invalid focus, pending
  validation, duplicate protection, server rejection, draft preservation/reset,
  and the model update contract.
- Routing: use a fresh real router with memory history for integration tests.
  Install it, push an initial location, await `isReady()`, then mount as required
  by the harness. Await later navigations and queued work; test reused components,
  guards, redirects, and malformed query values. A mocked router call is not a
  route integration test.
- Pinia: create a fresh active Pinia for store tests and install required plugins.
  `createTestingPinia()` stubs actions by default; use a real store or disable
  action stubbing when verifying action behavior.
- Run the existing SFC type-check command, not only a transpiling build. Plain
  `tsc` does not check SFC templates; use the project's `vue-tsc` setup where
  available. Do not invent scripts.
- Use existing real-browser tests for focus, keyboard navigation, layout, and
  browser history. Report actual commands and remaining limitations.

Sources: [Vue testing](https://vuejs.org/guide/scaling-up/testing.html),
[SFC type checking](https://vuejs.org/guide/typescript/overview.html),
[async Vue Test Utils behavior](https://test-utils.vuejs.org/guide/advanced/async-suspense.html),
[Pinia testing](https://pinia.vuejs.org/cookbook/testing.html),
[router history](https://router.vuejs.org/guide/essentials/history-mode.html).
