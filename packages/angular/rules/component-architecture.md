# Angular component architecture

## Boundaries and layout

Organize by feature, then keep each component and its directly related files in
one folder. Reuse the application's naming convention; the `.component` suffix
below is a convention, not a framework requirement.

```text
src/app/features/catalog/
  product-card/
    SPEC.md
    product-card.component.ts
    product-card.component.html
    product-card.component.css
    product-card.component.spec.ts
    index.ts
  catalog-page/
  catalog.service.ts
  catalog.routes.ts
```

- Export the component class as a named ES module export. Use a folder `index.ts`
  for its intentional public API, not a barrel that eagerly imports every route.
- Keep route/page components focused on composition and orchestration. Extract
  repeated presentation into components and shared domain operations into
  injectable services. Keep pure calculations as plain TypeScript functions.
- Co-locate templates and styles; inline them only when small and consistent
  with the project. Do not create empty style files or placeholder abstractions.
- Add usage examples to the feature spec or existing documentation system.
  Do not install a documentation framework just to scaffold a component.

## Standalone contracts

- Use standalone components for new features. Specify `standalone: true` when
  needed for compatibility; it became the default in Angular 19.
- Import template dependencies explicitly in the component's `imports` array,
  including standalone components, directives, pipes, and required form modules.
  Do not declare a standalone component in an NgModule.
- Use typed inputs for data and outputs for events. Do not mutate inputs or
  reach into a child's private state. Keep templates declarative and inexpensive.
- Prefer `ChangeDetectionStrategy.OnPush` for new components where appropriate;
  replace object/array references when updating inputs. Do not switch the
  application's scheduling or zone configuration as an incidental refactor.
- On versions supporting built-in control flow, use `@if` and `@for` with stable
  item identity in `track`. Keep compatible syntax in older applications.
- Use native buttons, links, labels, and form controls. Preserve encapsulated
  styles and project tokens; do not bypass DOM sanitization for untrusted content.

Follow [signals and DI](./angular-signals.md), the
[scaffold skill](../skills/scaffold-component/SKILL.md), and
[accessibility rules](./accessibility.md).

Sources: [component metadata, imports, and standalone defaults](https://angular.dev/guide/components),
[inputs](https://angular.dev/guide/components/inputs),
[template control flow](https://angular.dev/guide/templates/control-flow),
[component generation options](https://angular.dev/cli/generate/component).
