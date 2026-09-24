# Vue application guidance

Apply this preset alongside the shared application guidelines. Build Vue 3
single-file components with Composition API and `<script setup lang="ts">`.

## Compatibility and scope

- Inspect `package.json`, the lockfile, build configuration, TypeScript settings,
  and nearby SFCs before selecting APIs or commands. Respect installed Vue,
  Vue Router, and Pinia versions; do not implicitly upgrade them.
- Use typed props/emits and explicit state ownership. Keep existing conventions
  outside the feature being changed; do not migrate unrelated components.
- `toValue()` and named-tuple emit declarations require Vue 3.3+;
  `defineModel()` requires 3.4+; automatic props destructure tracking,
  `useTemplateRef()`, and `onWatcherCleanup()` require 3.5+.
  Use compatible alternatives in older Vue 3 projects.
- Prefer local state and composables. Use Pinia when shared application state
  warrants it or the project already uses it; it is not required by this preset.
- These assets do not install runtime dependencies. Nuxt and optional UI,
  backend, AI, and 3D integrations are outside this preset's scope.

## Guidance map

All paths below are relative to the generated `.agents/` directory.

| Task | Guidance |
| --- | --- |
| Organize SFCs and public exports | [Component architecture](./rules/component-architecture.md) |
| Define typed props/emits and templates | [Composition API](./rules/vue-composition-api.md) |
| Extract reusable state and effects | [Composables](./rules/vue-composables.md) |
| Choose local, provided, or Pinia state | [State](./rules/vue-state.md) |
| Navigate and preserve URL state | [Router](./rules/vue-router.md) |
| Bind, validate, and submit forms | [Forms](./rules/vue-forms.md) |
| Exercise components, composables, routes, and stores | [Testing](./instructions/vue-testing.instructions.md) |
| Create an SFC with its spec and tests | [Scaffold component](./skills/scaffold-component/SKILL.md) |
| Define acceptance criteria | [Spec rule](./rules/spec-driven-development.md), [spec workflow](./skills/workflows/sdd-workflow.md) |
| Maintain quality and accessibility | [Development standards](./instructions/development-standards.instructions.md), [interface guidelines](./instructions/web-interface-guidelines.instructions.md), [accessibility](./rules/accessibility.md), [audit](./skills/accessibility-audit/SKILL.md) |
| Measure and improve responsiveness | [Web performance](./rules/web-performance.md) |

Start from the feature spec and identify component responsibilities before
writing templates. Keep page components focused on composition, data flow
explicit, computed values pure, and side effects scoped and disposable.

Official references: [typed Composition API](https://vuejs.org/guide/typescript/composition-api.html),
[composables](https://vuejs.org/guide/reusability/composables.html),
[component models](https://vuejs.org/guide/components/v-model.html),
[watcher cleanup](https://vuejs.org/guide/essentials/watchers.html#side-effect-cleanup).
