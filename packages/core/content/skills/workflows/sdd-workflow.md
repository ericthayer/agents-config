---
description: Practical workflow and template for a component or feature specification.
---

# Spec workflow

Follow [spec-driven development](../../rules/spec-driven-development.md).
Create or update the feature's `SPEC.md` in the project's established location.
Use the template below as a starting point; keep sections concise and mark
irrelevant requirements explicitly rather than inventing work.

1. Read the affected code, existing specs, and
   [component architecture](../../rules/component-architecture.md).
2. Define observable behavior and acceptance criteria before implementation.
   Resolve interface uncertainties and record assumptions.
3. Implement one complete slice at a time, using the preset's
   [scaffolding skill](../scaffold-component/SKILL.md) for new components.
4. Compare each slice with the spec. Update requirements before intentional
   deviations and preserve compatibility unless a change is explicitly required.
5. Complete the [accessibility audit](../accessibility-audit/SKILL.md) for UI work
   and measure relevant [performance requirements](../../rules/web-performance.md).
   Update the checklist and changelog with evidence and remaining limitations.

## Template

```markdown
# SPEC: [Feature name]

## Intent and scope
Who needs this behavior, what problem does it solve, and what is out of scope?

## Usage and contract
Describe inputs, outputs/events, defaults, validation, and example interactions.
Include typed contracts or native markup only where they clarify the interface.

## Architecture and data flow
Identify responsibilities, state ownership, data sources, dependencies, and
lifecycle cleanup. Follow the installed stack and existing project conventions.
Document compatibility, privacy, and error-handling boundaries.

## Behavior and presentation
Define loading, empty, success, error, and boundary states.
Describe navigation, responsive behavior, and existing design patterns to preserve.

## Accessibility
Specify semantic structure, accessible names, keyboard operation, focus movement,
error announcements, contrast, media alternatives, and reduced-motion behavior.

## Performance
Set measurable budgets for the relevant journey and representative dataset.
Name the device/network assumptions and the method used to measure improvement.

## Acceptance and implementation checklist
- [ ] Public contract and core behavior covered by tests.
- [ ] Failure, boundary, cancellation, and stale-data cases handled.
- [ ] Applicable keyboard, focus, responsive, and accessibility checks completed.
- [ ] Relevant performance budgets measured.
- [ ] Documentation matches delivered behavior; limitations recorded.

## Changelog
- [Date]: Initial spec and key assumptions.
```
