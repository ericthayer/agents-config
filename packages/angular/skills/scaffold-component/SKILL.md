---
name: scaffold-component
description: Scaffold a standalone Angular component with typed inputs and outputs, a feature specification, accessible template, and focused tests.
---

# Scaffold an Angular component

## Inputs and preparation

Determine the component's purpose, owning feature, selector, inputs/outputs,
state owner, accessibility requirements, and supported Angular version. Inspect
nearby components, CLI configuration, styles, and existing test commands.

Read [component architecture](../../rules/component-architecture.md),
[signals and DI](../../rules/angular-signals.md), and the
[spec workflow](../workflows/sdd-workflow.md). Create or update the feature's
`SPEC.md` before implementation, including observable acceptance criteria and
public contracts. Keep naming consistent; do not rename neighboring components.

## Implementation

1. Prefer the locally installed Angular CLI component schematic. Preview with
   `ng generate component <feature/name> --standalone --dry-run`, replacing the
   placeholder with the actual path and selecting the workspace project when
   necessary. Check local CLI help before passing version-specific options.
   Generate without `--dry-run` only after reviewing the planned files.
2. Keep the component, template/styles when needed, test, and specification in
   the component folder. Export the component through a small `index.ts`.
   Retain generated tests and adapt filenames to the application's convention.
3. Import only template dependencies. Define typed data inputs and event outputs;
   choose local signals or a deliberately scoped service for state. Add router
   or form imports only if the feature needs them.
4. Use semantic HTML, accessible names, visible focus, and existing style tokens.
   Include loading, empty, error, and disabled states when part of the contract.
5. Add behavioral tests using the
   [Angular testing instructions](../../instructions/angular-testing.instructions.md).
   Document usage in the spec or existing documentation system.

Minimal Angular 19+ contract example, not a reason to upgrade an older consumer:

```ts
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'app-action-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" (click)="activated.emit()">{{ label() }}</button>
  `,
})
export class ActionButtonComponent {
  readonly label = input.required<string>();
  readonly activated = output<void>();
}
```

Use supported decorator inputs/outputs if the installed Angular version predates
their stable function-based equivalents. Do not adopt preview APIs or generate
an NgModule for a new standalone component.

## Completion

Run the existing focused tests and template/type-checking build. Check emitted
events, required inputs, repeated instances, and teardown for any side effects.
Apply the shared [accessibility audit](../accessibility-audit/SKILL.md). Report
created files, public API, actual commands, and any limitations.

Sources: [CLI component schematic](https://angular.dev/cli/generate/component),
[components](https://angular.dev/guide/components),
[input API](https://angular.dev/api/core/input),
[output API](https://angular.dev/api/core/output).
