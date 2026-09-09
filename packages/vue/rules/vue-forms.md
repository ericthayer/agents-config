# Vue forms

## Models and boundaries

- Use typed local refs or a typed reactive draft with native `v-model` bindings.
  Initialize values in script; `v-model` treats JavaScript state, not initial
  `value`/`checked` attributes, as the source of truth.
- Do not mutate a supplied object prop as an editing shortcut. Create a deliberate
  draft with submit/reset rules and define what happens if the parent changes
  while the user is editing.
- For a reusable input on Vue 3.4+, use a typed `defineModel()` contract.
  On older Vue 3, use typed `modelValue` props and `update:modelValue` emits.
  Initialize the parent model; avoid child-only defaults that diverge from it.
- Use `.trim`, `.number`, and `.lazy` only when their semantics match the field.
  A numeric binding is not runtime validation: empty/invalid values need explicit
  handling. Preserve input-method composition behavior.

Example reusable field (Vue 3.4+); the parent supplies a unique ID and model:

```vue
<script setup lang="ts">
interface Props {
  id: string;
  label: string;
}
const props = defineProps<Props>();
const model = defineModel<string>({ required: true });
</script>

<template>
  <label :for="props.id">{{ props.label }}</label>
  <input :id="props.id" v-model="model" type="text" />
</template>
```

## Validation and submission

- Use a semantic `<form @submit.prevent="submit">` for client-handled submission,
  explicit button types, visible labels, autocomplete, and appropriate native
  input types. Do not install a validation library for simple forms.
- Derive synchronous validation from the draft using computed values or pure
  functions. Track touched/submitted state separately so errors appear at the
  right time; do not maintain multiple inconsistent copies of validity.
- Associate error text through `aria-describedby`, expose `aria-invalid`, and
  focus the first invalid field after `nextTick()` on rejected submission.
  Do not silently return without showing why the submission was rejected.
- For async validation and submission, represent pending/error/success outcomes,
  guard duplicate execution in the handler, and disable submission while pending.
  Announce progress and results accessibly. Preserve the draft on failure.
- Cancel or ignore stale async validation. A request error is not proof that a
  field is valid. Keep server field errors distinct from local validation and
  clear them when they no longer apply.
- Reset only on confirmed success or explicit user intent. Confirm leaving a
  dirty form when the feature requires it; preserve keyboard submission and paste.

See [composables](./vue-composables.md) for async cleanup and
[testing](../instructions/vue-testing.instructions.md) for form interactions.

Sources: [native input bindings](https://vuejs.org/guide/essentials/forms.html),
[component models](https://vuejs.org/guide/components/v-model.html),
[watcher cleanup](https://vuejs.org/guide/essentials/watchers.html#side-effect-cleanup).
