# Vue component architecture

Organize by feature with one folder per component. Use PascalCase SFC filenames,
and keep the template, script, and component-local styles together.

```text
src/features/catalog/
  ProductCard/
    SPEC.md
    ProductCard.vue
    ProductCard.spec.ts
    index.ts
  CatalogPage/
  composables/
    useCatalog.ts
    useCatalog.spec.ts
```

- Use `<script setup lang="ts">`, then `<template>`, then `<style scoped>` when
  local styles are needed. Keep global tokens and resets in the existing global
  stylesheet. Do not change the application's styling system while scaffolding.
- Export the SFC through `export { default as ProductCard } from './ProductCard.vue'`
  in its public `index.ts`. Keep lazy route imports direct; avoid a shared barrel
  that eagerly pulls in every page.
- Keep app shells and route pages focused on composition. Split a component when
  it owns independent UI responsibilities or substantial repeated markup, not
  merely because it exceeds an arbitrary line count.
- Use props down and events up. Use slots for caller-owned content and explicit
  model contracts for genuine two-way fields. A component ref is for narrow
  imperative needs such as focus, not ordinary state synchronization.
- Put reusable stateful logic in feature composables. Keep pure transformations
  in ordinary TypeScript utilities; neither belongs in an oversized page SFC.
- Keep component state per instance. Only create shared state deliberately at a
  provider/store boundary. Do not introduce module-level mutable state casually.
- Put acceptance criteria and usage in the feature spec or the existing
  documentation system. Do not install a story/documentation framework for this
  preset.

Follow [Composition API](./vue-composition-api.md),
[composables](./vue-composables.md), and
[accessibility](./accessibility.md). Use the
[scaffold skill](../skills/scaffold-component/SKILL.md) for new components.

Sources: [typed SFC contracts](https://vuejs.org/guide/typescript/composition-api.html),
[composable boundaries](https://vuejs.org/guide/reusability/composables.html),
[component models](https://vuejs.org/guide/components/v-model.html).
