# Contributing to agents-config

Contributions should keep React, Angular, and Vue guidance accurate for each
framework while sharing only genuinely framework-neutral content. Read
[SPEC.md](SPEC.md) for the approved contract and
[docs/MONOREPO-PLAN.md](docs/MONOREPO-PLAN.md) for package boundaries.

## Getting Started

Use Node.js >=18, npm with workspace support, and Git. Fork and clone the
repository, create a focused branch, then run from the repository root:

```bash
npm install
npm run prepare:packages
npm test
npm run test:packages
```

`npm run prepare:packages` is the shared asset-preparation command used for
packing. `npm test` exercises the shared engine and content contracts;
`npm run test:packages` exercises installed local tarballs rather than a
previously published registry version. No registry publication is needed for
local validation.

## Package Structure and Source Ownership

This is an ESM npm-workspaces repository, not a pnpm/Turborepo project.

| Location | Editable source and responsibility |
|----------|------------------------------------|
| `packages/core/src/` | Shared initialization, analysis, resolution, and generation engine |
| `packages/core/content/` | Neutral guidance, adapter template, and neutral GitHub templates, except staged assets below |
| `packages/react/preset.js` | React content selection and optional integrations |
| Root `AGENTS.md`, `rules/`, `skills/`, `instructions/` | Legacy React assets, staged into `packages/react/content/` |
| Root `.github/` helper documents | Legacy React GitHub helpers, staged into React content |
| `packages/angular/`, `packages/vue/` | Framework-native preset descriptors and content |
| Root `schemas/agents-project.schema.json` | Canonical shared schema, staged into core |
| Root `skills/github-automation/` | Shared automation skill source, staged into core as well as React |
| `bin/` and preset `bin/` directories | Thin wrappers retaining `agents-init` and `agents-analyze` |
| `scripts/`, `tests/` | Asset preparation, package smoke tests, and behavioral coverage |
| `examples/` | Consumer usage examples |

Root `AGENTS.md` intentionally remains the **legacy React source**. Do not
rewrite it as generic guidance or treat it as the generated guidance for Angular
or Vue consumers. Framework-neutral content has its own source in core; a root
instruction that contains React examples is not automatically reusable there.

Do not edit or commit ignored generated assets: `packages/react/content/`
(including its `github/` helpers), package `LICENSE` copies, core
`content/schemas/`, or core `content/skills/github-automation/`. Edit their
canonical sources and rerun `npm run prepare:packages`.

Root `.github/pr-template-commits.md` contains React examples, so root GitHub
helpers are staged into `packages/react/content/github/` for React compatibility.
Core's `packages/core/content/github/` documents are separately authored,
maintained framework-neutral sources: edit and commit them directly. They are
neither staged from root helpers nor ignored. Core's schema and
`github-automation` skill remain staged as described above.

## Adding Rules, Skills, and Instructions

Choose the owner before adding content: core for neutral workflows, the root
source directories for legacy React assets, or the Angular/Vue package content
directory for framework-native guidance.

Use `rules/<topic>.md`, `skills/<skill-name>/SKILL.md`, and
`instructions/<topic>.instructions.md`. Match existing formats, use kebab-case
names, and include purpose, applicable framework/version, actionable guidance,
examples, and official documentation links where version-sensitive.

Register selected assets in the preset descriptor or core composition logic,
not by adding framework-specific branches to CLI wrappers. Required assets must
exist, and composition must reject conflicting destination paths. Update
scaffolding and example links with any renamed or added content.

Angular scope includes standalone components, signals/DI, routing, typed reactive
forms, state/RxJS, testing, and scaffolding. Vue scope includes Vue 3 SFCs,
Composition API, composables, routing, forms, local/Pinia state, testing, and
scaffolding. Respect the consumer's installed framework version.

Nuxt and optional Angular/Vue UI-library, backend, application-AI, and 3D
integrations are deferred. Do not add React integration content as a fallback.
Existing React integrations stay supported. The Gemini assistant adapter is
separate from Gemini application SDK guidance.

## Changing the CLI or Schema

Both commands must use the shared resolver. Selection order is explicit
`--stack`, persisted stack/recognized legacy framework, then one directly
declared installed preset. Legacy `agents-config` counts as React. Do not infer
the stack from whichever package's binary npm linked.

Unattended ambiguity fails without explicit or persisted selection; interactive
runs can ask. Dependency/stack mismatches require interactive confirmation and
fail unattended. Initialization uses `--yes` for unattended execution and
`--agents copilot,claude` for explicit assistant selection. Preserve saved
assistant choices; fresh unattended defaults are Copilot and Claude.
Use `agents-analyze --yes` to explicitly authorize unattended report/context
generation. It must still reject ambiguous selection, stack mismatches, and
unsafe output destinations; guided customization remains interactive.

Plan and validate before writing. Dry runs must write nothing. Non-force runs
preserve existing files, including nested skill files. A persisted stack switch
requires `--force`, which replaces only planned destinations and reports stale
files without deleting them. Reject symlinked output paths/ancestors. Never
download missing presets, application dependencies, or external skill packs
automatically.

For schema changes, edit **root**
`schemas/agents-project.schema.json`, then prepare packages. Preserve the
existing schema URL and compatibility with configurations at versions 1.0.0
and 1.1.0. Version 1.2.0 adds optional `project.stack` and Angular support;
retain custom names, overrides, exclusions, additional fields, and assistant
choices.

For a new assistant, update the shared assistant registry and adapter
generation, provide the appropriate output path, and cover generated relative
links. Do not introduce separate preset-specific CLI engines.

## Pull Requests

Keep changes focused, update directly affected documentation, and describe the
behavior, motivation, and validation in the PR. Use Node's existing test runner
and package smoke harness; avoid adding a second tooling stack.

Cover changed behavior with targeted tests, including errors and preservation
where relevant. Packaging changes must also pass `npm run test:packages`, with
assets available from installed tarballs without access to the repository.
Review for unrelated framework content, broken generated links, and unintended
writes before submitting.

Use ES modules, existing naming conventions, and clear documentation. Follow
conventional commits, for example:

```text
feat: add Angular routing guidance
fix: preserve nested skill files during initialization
docs: clarify stack selection
```

## Releases

All five packages advance together through a single synchronized semantic-release
process. Each preset depends on the exact matching core version; legacy
`agents-config` depends on exact matching React and core versions. Do not use
caret ranges or independently version packages.

`.github/workflows/release.yml` runs semantic-release using pinned global tooling,
without adding root development dependencies. Its local plugin updates all five
manifests, exact internal dependencies, and the npm v3 lockfile. An explicit job
calls the reusable `.github/workflows/publish.yml`; publishing does not depend on
release or tag events.

Publish in dependency order: `@agents-config/core`, then
`@agents-config/react`, `@agents-config/angular`, and `@agents-config/vue`, then
`agents-config`. The publishing workflow serializes invocations and verifies
artifact identity before accepting an already-published version on retry.
Before publishing missing artifacts, it rejects retries superseded by a newer
`latest` version in any package; historical retries cannot downgrade default installs.
Registry and authentication errors must fail visibly.

Implementation, local packing, and tests do **not** publish packages. Actual
publication separately requires ownership of the `@agents-config` npm
organization and publishing authorization for every package, including legacy
`agents-config`. Keep the legacy React package supported; do not deprecate it.

### Retrying Publication

For an existing release, manually run **Publish to npm** (`publish.yml`) from
GitHub Actions with these inputs:

| Input | Value |
|-------|-------|
| `version` | Released version without `v`, for example `1.6.0` |
| `ref` | Exact matching tag ref, for example `refs/tags/v1.6.0` |
| `commit` | Optional full release commit SHA to verify against the tag |

Use the original release tag, not a branch or newly edited checkout. This is a
real publishing operation: configure the repository's `NPM_TOKEN` secret with
public publishing permissions for both legacy `agents-config` and the
`@agents-config` scope, with scope ownership established beforehand.

The workflow checks out that exact tag and validates HEAD and version before
installing. It runs `prepare:packages`, `npm test`, and `test:packages`, then
preflights all local artifacts and registry identities before publishing in the
order above. Invocations are serialized.

An existing version is skipped only when its registry SHA-512 integrity matches
the local artifact; SHA-1 is a fallback only when integrity is absent. Only
`E404` means a version is absent. Identity mismatches, authentication failures,
and other registry errors stop publication; do not bypass them or overwrite a
release tag to force a retry.

## Reporting Issues and Conduct

Include Node/npm versions, operating system, installed preset packages, command
and flags, reproduction steps, and expected versus actual behavior in
[GitHub issues](https://github.com/ericthayer/agents-config/issues). Do not include
credentials or private application content.

Be respectful and inclusive, and check existing issues before opening a duplicate.
