---
description: Initialize and verify shared guidance with an installed framework preset.
---

# Setup workflow

Initialize from the consumer application directory, not the configuration
package directory. In a workspace, inspect the application's declared
dependencies rather than assuming a hoisted package is its selected preset.

## Setup

1. Inspect the installed preset, `.agents-project.json` if present, and existing
   assistant configuration. Preserve custom content and use the application's
   actual stack; do not infer it from whichever executable was linked.
2. Preview using `npx agents-init --dry-run`. A matching preset must already be
   installed; do not accept an implicit registry download as part of initialization.
   If selection is ambiguous, choose the intended installed stack explicitly
   with `--stack`.
3. Run `npx agents-init` for interactive setup, or `npx agents-init --yes` for
   deterministic unattended setup when selection is unambiguous. Use
   `--agents copilot,claude` when that is the intended assistant selection.
4. Review the generated files. Existing files should be preserved without force;
   do not use `--force` as a routine repair for conflicts or stack mismatches.
   Resolve the intended stack and review overwrite scope before replacing files.

## Required guidance

The generated `.agents` tree must include
[AGENTS.md](../../AGENTS.md),
[development standards](../../instructions/development-standards.instructions.md),
[web interface guidelines](../../instructions/web-interface-guidelines.instructions.md),
the shared [accessibility](../../rules/accessibility.md),
[spec](../../rules/spec-driven-development.md), and
[performance](../../rules/web-performance.md) rules, plus the selected preset's
[component architecture](../../rules/component-architecture.md) and
[scaffolding skill](../scaffold-component/SKILL.md).

Check that selected assistant adapters reference actual installed assets and
that `.agents-project.json` describes the intended stack and assistant choices.
Missing required content is a setup failure, not a reason to substitute guidance
from a different stack.

## Project context and readiness

Use the [codebase analysis workflow](./codebase-analysis.md) to add project-specific
context after initialization. `.agents/PROJECT-CONTEXT.md` is optional until
generated; do not create a dangling Markdown link to it.

Report unresolved configuration errors plainly. Once the required guidance and
adapters exist, begin feature work with the [spec workflow](./sdd-workflow.md).
