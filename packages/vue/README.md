# @agents-config/vue

Static Vue 3 guidance composed with `@agents-config/core`. This package does not
install Vue, generate an application, or add application dependencies.

From an existing Vue application:

```sh
npm install --save-dev @agents-config/vue
npx agents-init --stack vue --dry-run
npx agents-init --stack vue
npx agents-analyze --stack vue
```

For unattended initialization, add `--yes`; use `--agents copilot,claude` to
select assistants explicitly. Run commands from the application directory,
including inside a workspace. The preset must be installed before selection.

The [guidance index](./AGENTS.md) covers SFC/Composition API architecture, typed
props/emits, composables, local/shared state, Vue Router, forms, testing, and
component scaffolding. Pinia guidance applies when shared application state
warrants a store; no store library is installed or required.

The index's core links resolve after composition into `.agents/`; core supplies
shared accessibility, performance, and specification workflows. Package
documentation itself is not an installed guidance asset.

Check the consumer's installed versions before applying examples. The guidance
documents Vue 3.3/3.4/3.5 API boundaries rather than assuming all Vue 3 projects
support every macro. Nuxt and optional UI, backend, AI, and 3D integrations are
not included.

Rules and instructions cite official Vue, Vue Router, Pinia, and Vue Test Utils
documentation. Begin with [typed Composition API](https://vuejs.org/guide/typescript/composition-api.html),
[composables](https://vuejs.org/guide/reusability/composables.html), and
[testing](https://vuejs.org/guide/scaling-up/testing.html).
