---
applyTo: '**'
---

# Development standards

Use the installed preset and existing project conventions for framework APIs,
file organization, formatting, and tooling. Shared guidance does not mandate a
component syntax, state library, styling system, or test runner.

## Scope and structure

- MUST read relevant code and the feature spec before editing. Follow
  [spec-driven development](../rules/spec-driven-development.md) for new behavior.
- MUST preserve intentional user changes and established interfaces unless the
  requested change explicitly replaces them.
- SHOULD reuse existing utilities and components before adding abstractions.
  Keep modules cohesive and dependencies explicit; separate domain decisions
  from UI presentation and external I/O.
- MUST follow the preset's
  [component architecture](../rules/component-architecture.md) for component work.

## Types and data

- MUST use strict typing in TypeScript projects. Define public input/output
  contracts; allow inference for obvious local values.
- MUST treat untrusted input as `unknown` until validated. Static types do not
  validate network responses, stored data, or form submissions at runtime.
- NEVER use `any`, unchecked assertions, or non-null assertions merely to silence
  a type error. Model optional and failure states explicitly.
- SHOULD prefer immutable inputs and small, testable transformations. Follow
  existing naming and export conventions instead of introducing new style rules.

## Reliability and safety

- MUST handle loading, empty, success, and error states. Surface actionable
  failures instead of broad catches or success-shaped fallbacks.
- MUST clean up subscriptions, timers, and listeners according to the platform
  lifecycle. Cancel obsolete work and guard against out-of-order responses.
- MUST keep credentials and privileged operations out of browser code. Avoid
  recording secrets or personal data in logs, fixtures, and generated context.
- MUST render untrusted content safely. Avoid raw HTML insertion unless a
  reviewed sanitization boundary is in place.
- SHOULD keep one authoritative source for each state value and derive the rest.
  Put shareable navigation state in the URL, but never credentials or sensitive data.

## Delivery

- MUST follow the [web interface guidelines](./web-interface-guidelines.instructions.md)
  for UI changes.
- MUST use existing checks to cover changed behavior, failure paths, and boundary
  cases. Add regression coverage when fixing a bug.
- SHOULD document public contracts and non-obvious decisions, not restate code.
  Update the spec when behavior changes and report any remaining limitations.
