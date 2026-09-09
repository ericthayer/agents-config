---
name: scaffold-component
description: Scaffold a Vue 3 single-file component with typed props and emits, focused Composition API logic, a feature specification, and behavioral tests.
---

# Scaffold a Vue component

## Inputs and preparation

Determine the component name, feature, single responsibility, props/emits/slots,
model contract if any, state owner, and accessibility requirements. Read nearby
SFCs, installed Vue versions, build/type-check settings, and test commands.

Read [component architecture](../../rules/component-architecture.md),
[Composition API](../../rules/vue-composition-api.md), and the
[spec workflow](../workflows/sdd-workflow.md). Create or update the feature's
`SPEC.md` first, recording observable behavior and acceptance criteria. Map child
components and their contracts if multiple independent responsibilities exist.

## Implementation

1. Create a PascalCase component folder containing `Name.vue`, `Name.spec.ts`,
   a public `index.ts`, and the component spec when not owned by a feature spec.
   Use an existing local generator if available; do not scaffold an entire app.
2. Write `<script setup lang="ts">` with typed props/emits. Define defaults with
   version-compatible macros. Use local refs and computed values; extract a
   composable only for reusable or substantial stateful logic.
3. Write a semantic template with labeled native controls, stable list keys,
   visible focus, and the feature's required loading/empty/error states.
   Reuse existing tokens and scoped styling; do not redesign adjacent UI.
4. Wire the component into its owning feature. Export it with
   `export { default as Name } from './Name.vue'`. Add router/store/form coupling
   only where required by the contract.
5. Add interaction and contract tests using the
   [Vue testing instructions](../../instructions/vue-testing.instructions.md).
   Document usage and constraints in the spec or existing documentation system.

Minimal `ActionButton.vue` with a broadly compatible typed emit declaration:

```vue
<script setup lang="ts">
interface Props {
  label: string;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  (event: 'activate'): void;
}>();
</script>

<template>
  <button type="button" @click="emit('activate')">{{ props.label }}</button>
</template>
```

Keep instance-local state inside setup. For changing composable inputs, pass
refs/getters rather than captured values. Use the
[composable rules](../../rules/vue-composables.md) for cleanup; do not introduce
Pinia for a button, isolated form, or another local concern.

## Completion

Run the existing focused tests, SFC type check, and relevant build. Check prop
updates, emitted payloads, repeated instances, and teardown for side effects.
Apply the shared [accessibility audit](../accessibility-audit/SKILL.md).
Report created files, public API, actual commands, and any limitations.

Sources: [typed Composition API](https://vuejs.org/guide/typescript/composition-api.html),
[composables](https://vuejs.org/guide/reusability/composables.html),
[testing](https://vuejs.org/guide/scaling-up/testing.html).
