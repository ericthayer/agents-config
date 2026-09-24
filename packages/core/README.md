# @agents-config/core

Shared CLI engine and framework-neutral guidance for the configuration presets.
Core is consumed by a preset package; it does not select a component model,
state library, styling system, or framework on behalf of an application.

## Responsibilities

Core owns project resolution, initialization and analysis, configuration schema,
assistant adapters, and shared development guidance. Presets supply stack-specific
rules and instructions, including `rules/component-architecture.md` and
`skills/scaffold-component/SKILL.md`.

Consumers install the preset appropriate to their application and run
`npx agents-init` from that application's directory. Use `--dry-run` to preview
generation and `--stack` to disambiguate installed presets. Core does not download
presets implicitly.

## Shared content

The [guidance entry point](./content/AGENTS.md) covers development boundaries and
links to accessibility, browser performance, specification, interface, and code
quality guidance. Shared skills provide accessibility auditing, spec drafting,
setup, and codebase-analysis workflows.

Content is composed with the selected preset into the consumer's `.agents` tree.
Links inside content are relative to that generated tree, not to this package's
source directory. The architecture and scaffolding links resolve only after
composition with a preset; they are not missing core-owned files.

`PROJECT-CONTEXT.md` and `ANALYSIS.md` are optional project-generated outputs,
not packaged prerequisites. Keep references to optional outputs as plain paths
until the files exist. Shared content must not link to absent templates or
framework-specific assets outside the selected preset.

## Maintenance

Keep shared guidance practical and platform-neutral. Use TypeScript contracts,
semantic HTML, and browser APIs where examples help; leave framework syntax,
component lifecycle conventions, and integration-specific advice to presets.
Preserve existing public legacy assets when evolving core guidance.
