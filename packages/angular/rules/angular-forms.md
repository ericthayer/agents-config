# Angular typed reactive forms

Use the stable `@angular/forms` typed reactive forms APIs for new form workflows.
Import `ReactiveFormsModule` into the standalone component. Do not bind `ngModel`
and a reactive form directive to the same control or add a parallel signal form
model without a specific synchronization requirement.

## Model and validation

- Use typed `FormControl`, `FormGroup`, and homogeneous `FormArray` values.
  Use `FormRecord` for dynamic keys with uniform controls. Avoid untyped controls.
- A normal control can reset to `null`. Set `nonNullable: true`, or use
  `NonNullableFormBuilder`, only when reset-to-initial-value is intended.
- A group's `.value` omits disabled controls and is therefore partial.
  Use `.getRawValue()` only when including disabled values is intentional;
  disabled fields are not a security boundary.
- Keep validators pure. Use control validators for fields and group validators
  for cross-field constraints. Async validation must complete and expose pending
  and failure behavior without treating a network error as valid input.
- Keep server rejection messages distinct from client validation. Preserve
  entered data on failure and clear obsolete errors deliberately.

Example model:

```ts
import { FormControl, FormGroup, Validators } from '@angular/forms';

const profileForm = new FormGroup({
  displayName: new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(80)],
  }),
});
```

## Accessible submission

- Use `<form [formGroup]="form" (ngSubmit)="submit()">` with native labeled
  controls and explicit submit/button types. Give repeated controls unique IDs.
- Associate field errors with `aria-describedby`; set `aria-invalid` from the
  validation state. Show errors after interaction or an attempted submission,
  not before the user can enter a value.
- On invalid submit, call `markAllAsTouched()`, show actionable messages, and
  focus the first invalid field once rendered. Do not silently discard the
  submission.
- Guard against pending validation and duplicate submissions in the handler as
  well as disabling the submit control while work is pending. Announce progress,
  success, and recoverable failure; do not reset drafts until success.
- Preserve autocomplete, paste, native input semantics, and keyboard submission.
  For custom controls, implement the `ControlValueAccessor` contract including
  touched and disabled behavior; do not add a wrapper for a simple native input.

Cover null/reset behavior, disabled fields, invalid/pending submissions, async
validation, server rejection, and repeat submission in
[form tests](../instructions/angular-testing.instructions.md).

Sources: [typed forms](https://angular.dev/guide/forms/typed-forms),
[validation](https://angular.dev/guide/forms/form-validation).
