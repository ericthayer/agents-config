---
applyTo: "**/*.spec.ts,**/*.test.ts,**/angular.json"
---

# Angular testing

Use the application's installed test runner and Angular CLI test builder.
Current CLI documentation describes Vitest; existing projects may use other
supported setups. Do not replace the runner, assume global test APIs exist, or
add dependencies as part of routine component work.

## Component and service tests

- Use `TestBed` to create components with their real template dependencies.
  Standalone components belong in `imports`, not `declarations`.
- Set inputs using a host binding or `fixture.componentRef.setInput()`. Supply
  required inputs before first rendering; do not overwrite signal input fields.
- Exercise DOM interactions and assert visible output, accessible names, and
  output payloads. A creation-only test or direct method call does not prove the
  template is wired correctly.
- Await Angular rendering/stability using the installed runner's documented
  fixture APIs. Use `fixture.detectChanges()` when needed for explicit initial
  rendering. Do not rely on arbitrary sleeps or assume Zone-based helpers work
  in every test environment.
- Replace service dependencies through `TestBed` providers. Match the actual
  injection scope; a component-level provider may require a component override.
  Assert state transitions and errors, not private implementation details.
- Test observable timing/cancellation with the existing RxJS/test-runner tools;
  verify subscriptions, effects, and listeners stop at their intended lifetime.

Minimal interaction test for the scaffold's `ActionButtonComponent`; import
`describe`, `it`, and `expect` from the configured runner unless it supplies them
globally:

```ts
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActionButtonComponent } from './action-button.component';

describe('ActionButtonComponent', () => {
  it('renders its label and emits activation', async () => {
    await TestBed.configureTestingModule({
      imports: [ActionButtonComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(ActionButtonComponent);
    fixture.componentRef.setInput('label', 'Save');
    let activations = 0;
    fixture.componentInstance.activated.subscribe(() => activations++);
    fixture.detectChanges();
    const button: unknown = fixture.debugElement.query(By.css('button')).nativeElement;
    if (!(button instanceof HTMLButtonElement)) {
      throw new Error('Expected a native button');
    }
    expect(button.textContent).toContain('Save');
    button.click();
    expect(activations).toBe(1);
  });
});
```

## Feature coverage

- Forms: dispatch native input/blur/submit events; verify errors, focus,
  pending state, disabled controls, reset behavior, and duplicate protection.
- Router: use real routes with `provideRouter()` and `RouterTestingHarness`.
  Await navigation; assert the rendered destination, guards, redirects,
  parameter changes on a reused component, and not-found handling.
- Use real-browser tests already present for keyboard interactions, focus,
  responsive layout, and navigation history that a DOM emulator cannot prove.
- Run the smallest relevant existing test command and the application's
  template/type-checking build. Use `ng test --watch=false` only when the installed
  builder supports it. Record actual commands and limitations in the delivery.

Sources: [test tooling](https://angular.dev/guide/testing),
[component DOM tests](https://angular.dev/guide/testing/components-basics),
[routing tests](https://angular.dev/guide/routing/testing).
