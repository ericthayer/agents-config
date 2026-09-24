# @agents-config/angular

Static Angular guidance composed with `@agents-config/core`. This package does
not install Angular, scaffold an application, or add application dependencies.

From an existing Angular application:

```sh
npm install --save-dev @agents-config/angular
npx agents-init --stack angular --dry-run
npx agents-init --stack angular
npx agents-analyze --stack angular
```

For unattended initialization, add `--yes`; use `--agents copilot,claude` to
select assistants explicitly. Run commands from the application directory,
including inside a workspace. The preset must be installed before selection.

The [guidance index](./AGENTS.md) covers standalone component architecture,
signals and DI, local/shared state with RxJS, routing, typed reactive forms,
testing, and component scaffolding. Its core links resolve after composition
into `.agents/`; core supplies shared accessibility, performance, and spec
workflows. Package documentation itself is not an installed guidance asset.

Read the consumer's installed Angular and CLI versions before applying examples.
Signal inputs and function-based outputs in the scaffold target their stable
Angular 19+ APIs; older applications keep compatible APIs unless migration is
explicitly requested. Do not adopt experimental APIs or replace an existing test
runner automatically. Optional UI, backend, AI, and 3D integrations are not
included.

Rules and instructions cite the official Angular documentation used for their
recommendations. Begin with [components](https://angular.dev/guide/components),
[typed forms](https://angular.dev/guide/forms/typed-forms), and
[testing](https://angular.dev/guide/testing).
