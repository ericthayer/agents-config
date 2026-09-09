---
description: Ground project-specific agent context in existing code and configuration.
---

# Codebase analysis

Use after initialization, when onboarding, or when the project structure changes.
Start with the [setup workflow](./setup-orchestration.md) if `.agents` is absent.

## Collect evidence

- Inspect the application manifest, lockfile, compiler options, and existing
  scripts. Record installed versions rather than assuming the latest APIs.
- Read representative components, routes, data access, forms, and tests. Distinguish
  test files from production code and identify source/template pairs where relevant.
- Identify naming, exports, state ownership, styling, validation, cleanup, and
  error-handling conventions from actual examples.
- Note integration boundaries and environment-variable names without copying
  credentials, personal data, or production payloads.

## Analyze and customize

Run `npx agents-analyze --dry-run` from the consumer application directory to
preview analysis. Use the locally installed command; do not accept an implicit
package download if the command is unavailable.

Use `npx agents-analyze` for normal analysis or `npx agents-analyze --guided` for
guided customization. Review proposed changes and preserve hand-maintained
context rather than treating inferred conventions as authoritative.

The analysis report belongs at `.agents/ANALYSIS.md`; project-specific guidance
belongs at `.agents/PROJECT-CONTEXT.md` when generated. These are project outputs,
not required assets shipped with this workflow.

Keep project context focused on:

- Confirmed stack and versions, source organization, and actual run/check commands.
- Established component, state, data, and error-handling patterns with file examples.
- Domain constraints, compatibility requirements, and deliberate exceptions.
- Uncertain or conflicting observations, clearly separated from verified facts.

## Verify and maintain

Run `npx agents-analyze --verify` to inspect configuration consistency. Also check
that referenced files exist, commands match the manifest, and assistant adapters
point to the generated guidance. A detected dependency is not proof that a
particular pattern is used.

Refresh context after material changes, not every small edit. Keep optional
`PROJECT-CONTEXT.md` references as plain paths until the file exists. Use the
[spec workflow](./sdd-workflow.md) to document new feature intent rather than
filling project context with an implementation plan.
