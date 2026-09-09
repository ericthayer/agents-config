---
description: Define intent and acceptance criteria before implementing a feature.
---

# Spec-driven development

A feature spec preserves intent across planning, implementation, and review.
Keep it proportional to the change: concrete requirements are more useful than
a large document of generic advice.

## Draft before implementation

Create or update `SPEC.md` in the feature's established documentation location
before coding new behavior. Use the
[spec workflow and template](../skills/workflows/sdd-workflow.md).

Include the user problem, scope and non-goals, public interfaces, data flow,
loading and failure states, compatibility requirements, and observable acceptance
criteria. For interfaces, specify keyboard/focus behavior and responsive states.
Set performance budgets against realistic devices and data, not arbitrary limits.

Choose implementation patterns from the installed
[component architecture](./component-architecture.md) and the existing codebase.
Record unresolved assumptions and dependencies; resolve behavior-changing
uncertainty before committing to an interface.

## Implement incrementally

Build complete, small slices with a checkpoint against acceptance criteria after
each slice. Update the spec before implementing a newly discovered requirement
or intentional deviation. Do not silently expand scope or change established
visual design.

## Verify and maintain

Map each acceptance criterion to a test, browser observation, or documented
manual check. Include failure and boundary cases, plus the applicable
[accessibility](./accessibility.md) and [performance](./web-performance.md) rules.
Record what remains unverified; an unchecked criterion is not a completed feature.

Keep the spec aligned with the final implementation. Add a short dated changelog
entry for meaningful decisions, compatibility changes, and revised requirements.
