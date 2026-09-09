# Angular application guidance

Apply this preset alongside the shared application guidelines. Use Angular-native
components, dependency injection, templates, routing, and forms.

## Compatibility and scope

- Inspect `package.json`, the lockfile, `angular.json`, TypeScript configuration,
  and nearby source before choosing APIs or commands. Follow the installed
  Angular/CLI version, not an assumed latest release.
- Prefer stable standalone components for new code. The examples using signal
  inputs and `output()` require Angular 19 or newer; retain supported decorator
  inputs/outputs in older applications rather than upgrading implicitly.
- Enable strict TypeScript and template checking for new projects; preserve
  established tooling and change-detection configuration in existing projects.
- Use typed reactive forms for new form workflows. Do not introduce preview or
  experimental alternatives, new runtime dependencies, or integration libraries
  merely because this preset is installed.
- This preset covers application fundamentals only. Optional UI, backend, AI,
  and 3D integrations are outside its scope.

## Guidance map

All paths below are relative to the generated `.agents/` directory.

| Task | Guidance |
| --- | --- |
| Structure standalone components | [Component architecture](./rules/component-architecture.md) |
| Model inputs, derived values, and dependencies | [Signals and DI](./rules/angular-signals.md) |
| Own local/shared state and async streams | [State and RxJS](./rules/angular-state.md) |
| Navigate and preserve URL state | [Router](./rules/angular-router.md) |
| Validate and submit forms | [Typed forms](./rules/angular-forms.md) |
| Exercise components, services, forms, and routes | [Testing](./instructions/angular-testing.instructions.md) |
| Create a component with its spec and tests | [Scaffold component](./skills/scaffold-component/SKILL.md) |
| Define acceptance criteria | [Spec rule](./rules/spec-driven-development.md), [spec workflow](./skills/workflows/sdd-workflow.md) |
| Maintain quality and accessibility | [Development standards](./instructions/development-standards.instructions.md), [interface guidelines](./instructions/web-interface-guidelines.instructions.md), [accessibility](./rules/accessibility.md), [audit](./skills/accessibility-audit/SKILL.md) |
| Measure and improve responsiveness | [Web performance](./rules/web-performance.md) |

Start from the feature spec, identify state ownership and public inputs/outputs,
then implement and exercise the smallest complete behavior. Keep route components
focused on composition; use services for shared domain operations, not as a
default home for every piece of UI state.

Official references: [components](https://angular.dev/guide/components),
[signal input stability](https://angular.dev/reference/migrations/signal-inputs),
[output stability](https://angular.dev/reference/migrations/outputs).
