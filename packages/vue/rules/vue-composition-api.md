# Vue Composition API and SFC contracts

## State and derived values

- Use `ref()` for ordinary local state; use `reactive()` for objects whose
  identity remains stable. Use `shallowRef()` for deliberately shallow/opaque
  values, not as a blanket optimization for every primitive.
- Read/write refs with `.value` in script. Top-level template refs are unwrapped;
  do not assume refs nested in arrays or collections unwrap identically.
- Use pure `computed()` getters for derived values. Use `watch()` for explicit
  side-effect dependencies or `watchEffect()` for tracked synchronous reads.
  Do not maintain duplicated derived refs through watchers.
- Do not destructure primitive properties from a `reactive()` object and expect
  updates. Preserve the object access or use `toRefs()` where appropriate.

## Props and events

- Use `defineProps<Props>()` with a clear interface and typed `defineEmits`.
  These are compiler macros in `<script setup>`, not functions to import.
  Do not combine runtime and type-based declarations for the same macro.
- Treat props, including nested data, as parent-owned. Emit intent rather than
  mutating it. Use a deliberate local draft when editing, with an explicit
  reset/resynchronization policy.
- Use `withDefaults()` for compatible optional prop defaults; object/array
  defaults need factories. Before Vue 3.5, destructuring props loses tracking
  by default; `props.name` or a getter is the portable approach.
- Vue 3.3+ supports named-tuple emit declarations and imported prop interfaces.
  On earlier versions use call-signature emits and supported local prop types.
- Use `defineModel<T>()` only on Vue 3.4+ for actual two-way component contracts.
  Otherwise use `modelValue` and `update:modelValue`. Avoid child-only defaults
  that disagree with an undefined model in the parent.

## Templates and lifecycle

- Keep templates declarative and inexpensive. Use stable primitive `:key`
  identities in lists; filter with computed values instead of combining `v-if`
  and `v-for` on the same element.
- Prefer escaped interpolation; never pass untrusted content to `v-html`.
  Use semantic native controls, labels, and visible focus styles.
- Register lifecycle callbacks synchronously in setup. Attach browser-only work
  after mount and release listeners, timers, observers, and requests on teardown.
- Use `nextTick()` when a change must render before DOM access. Template refs can
  be null before mount or after conditional removal; narrow them before use.
  Use typed `ref<HTMLElement | null>(null)` on older versions, or
  `useTemplateRef()` on Vue 3.5+.

Sources: [state fundamentals](https://vuejs.org/guide/essentials/reactivity-fundamentals.html),
[TypeScript contracts and template refs](https://vuejs.org/guide/typescript/composition-api.html),
[component models](https://vuejs.org/guide/components/v-model.html),
[watchers](https://vuejs.org/guide/essentials/watchers.html).
