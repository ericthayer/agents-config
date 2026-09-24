# Application development guidelines

Build maintainable, accessible applications using the project's installed stack.
These shared guidelines cover web standards and development practices; the
selected preset supplies framework-specific architecture and scaffolding.

## Before changing code

- Read the affected code and nearby examples before choosing an implementation.
- Preserve established design, behavior, and intentional user changes. Stay
  within the requested scope; do not introduce a new framework or styling system.
- Read `PROJECT-CONTEXT.md` in this directory if it exists. It is optional
  project-specific context, not a prerequisite for initialization.
- Create or update the feature's `SPEC.md` before implementing new behavior.
  Record assumptions, observable acceptance criteria, and compatibility needs.
- Follow the installed preset's component architecture rather than imposing
  universal filenames, component APIs, or state-management conventions.

## Core practices

- Use strict TypeScript where the project uses TypeScript. Validate external
  data at runtime; prefer `unknown` and narrowing over unsafe assertions.
- Reuse existing components, utilities, and design tokens. Keep interfaces
  explicit and separate domain logic from presentation and external I/O.
- Prefer semantic HTML, accessible names, keyboard operation, visible focus,
  and recoverable errors. Accessibility is part of acceptance, not final polish.
- Preserve native links, forms, browser zoom, paste, and password-manager support.
- Implement loading, empty, error, and success states. Prevent duplicate
  submissions and confirm destructive actions or provide a reliable undo.
- Measure browser performance before optimizing. Reserve media space, prioritize
  critical content, and avoid blocking input with unnecessary work.
- Use existing test and build commands. Cover changed behavior and meaningful
  failure cases; state any unverified behavior instead of claiming completion.
- Keep secrets out of source, logs, generated guidance, and browser bundles.

## Guidance map

Links below resolve within the generated `.agents` tree. Component architecture
and scaffolding are provided by every supported preset.

| Task | Guidance |
| --- | --- |
| Plan a feature | [Spec-driven development](./rules/spec-driven-development.md), [spec workflow](./skills/workflows/sdd-workflow.md) |
| Organize components | [Component architecture](./rules/component-architecture.md) |
| Scaffold components | [Scaffold component](./skills/scaffold-component/SKILL.md) |
| Write maintainable code | [Development standards](./instructions/development-standards.instructions.md) |
| Build interfaces | [Web interface guidelines](./instructions/web-interface-guidelines.instructions.md) |
| Build inclusive interactions | [Accessibility](./rules/accessibility.md), [accessibility audit](./skills/accessibility-audit/SKILL.md) |
| Improve loading and responsiveness | [Web performance](./rules/web-performance.md) |
| Configure project guidance | [Setup workflow](./skills/workflows/setup-orchestration.md) |
| Refresh project context | [Codebase analysis](./skills/workflows/codebase-analysis.md) |

## Delivery workflow

1. Define intent, scope, interfaces, and acceptance criteria in the feature spec.
2. Implement small, complete increments using the installed preset and existing
   project patterns.
3. Exercise the affected interactions, error paths, accessibility, and performance.
4. Update the spec and usage documentation to match the delivered behavior.
   Report remaining limitations explicitly.
