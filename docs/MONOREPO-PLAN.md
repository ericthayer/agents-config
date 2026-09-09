# Monorepo Decisions: Framework Packages

**Status:** The original broad migration proposal is superseded by the approved
[SPEC.md](../SPEC.md). This document records the replacement scope and decisions.
The earlier proposal's pnpm/Turborepo setup, web-components package, Nuxt support,
optional Angular integrations, independent migration steps, and legacy-package
deprecation are not the implementation plan.

## Package Boundary

Use npm workspaces, ESM, and Node.js >=18. Keep one shared engine so resolution,
analysis, adapters, and file safety behave consistently across entry points.

| Package | Responsibility | Internal dependencies |
|---------|----------------|-----------------------|
| `@agents-config/core` | Shared engine, neutral guidance, adapters, schema | None |
| `@agents-config/react` | React-family preset and existing integrations | Exact matching core version |
| `@agents-config/angular` | Angular-native preset/content | Exact matching core version |
| `@agents-config/vue` | Vue-native preset/content | Exact matching core version |
| `agents-config` | Supported legacy React wrappers and public assets | Exact matching React and core versions |

All five share one synchronized version. The root remains the publishable legacy
package, not a private workspace-only shell. `agents-config` is retained for
React consumers without deprecation or mandatory migration.

## Consumer Contract

Install one package from the consumer application directory:

```bash
npm install -D @agents-config/react
# Or: npm install -D @agents-config/angular
# Or: npm install -D @agents-config/vue
npx agents-init
npx agents-analyze
```

Existing `npm install -D agents-config` usage remains supported. Both CLI names
stay unchanged. All wrappers delegate to core, and the linked binary does not
select a stack.

Resolve from explicit `--stack react|angular|vue`, then persisted `project.stack`
or recognized legacy framework, then one directly declared installed preset.
Legacy counts as React. Hoisted workspaces still resolve from the application
directory. Multiple presets without explicit/persisted selection require an
interactive choice; unattended ambiguity fails. Dependency/stack mismatches
require interactive confirmation and fail unattended.

Use `agents-init --yes` for noninteractive setup and
`--agents copilot,claude` to select assistants by name. Retain saved selections;
fresh unattended defaults are Copilot and Claude. Presets must already be
installed. Neither command implicitly downloads dependencies or skill packs.

## Content Scope

Angular includes standalone components, signals/DI, routing, typed reactive forms,
state/RxJS, testing, and scaffolding. Vue includes Vue 3 SFCs, Composition API,
composables, routing, forms, local/Pinia state, testing, and scaffolding. Native
framework workflows are in scope; guidance respects installed framework versions.

Nuxt, a web-components package, and optional Angular/Vue UI-library, backend,
application-AI, and 3D integrations are deferred. Unsupported integrations warn
without importing React guidance. Existing React integrations remain supported.
Choosing Gemini as a coding assistant does not select Gemini application SDK
integration.

Core owns genuinely neutral guidance. Root `AGENTS.md` remains intentionally
**legacy React source**, not consumer Angular/Vue generated agent guidance.
Root instructions and skills cannot be assumed framework-neutral merely because
their titles sound generic.

## Source and Distribution

Keep one canonical source for each asset. The shared root command
`npm run prepare:packages` prepares distribution assets:

| Canonical source | Staged destination |
|------------------|--------------------|
| Root `AGENTS.md`, `rules/`, `skills/`, `instructions/` | `packages/react/content/` |
| Root GitHub helper documents | `packages/react/content/github/` |
| Root `schemas/agents-project.schema.json` | `packages/core/content/schemas/` |
| Root `skills/github-automation/` | `packages/core/content/skills/github-automation/` |
| Root `LICENSE` | Each workspace package's `LICENSE` |

These generated copies are ignored; edit sources rather than copies. Root
`.github/pr-template-commits.md` contains React examples, so root GitHub helpers
are staged only into React content for compatibility, not into core.

Core's `packages/core/content/github/` documents are separately authored,
maintained framework-neutral sources, not staged or ignored files. Core's schema
and `github-automation` skill remain staged from their root sources. Other neutral
content is authored under `packages/core/content/`; Angular and Vue own their
native content. Tarballs must work without reaching back into the repository.

Schema changes for core belong in the root canonical schema. Keep the schema
URL stable, accept versions 1.0.0/1.1.0, and use version 1.2.0 for the optional
stack field and Angular support. Preserve names, overrides, exclusions,
additional fields, and assistant choices.

## Safety and Acceptance

Plan all files and validate assets before writing. Reject content collisions and
symlinked output destinations/ancestors. `--dry-run` writes nothing. Without
`--force`, preserve every existing file, including nested skill files.

A persisted stack switch requires `--force`. Force replaces only planned
destinations; stale previous-stack files are reported, never deleted. Generated
guidance and adapters must reference actual selected assets with correct relative
links; optional future paths must be labeled optional.

Run from the root:

```bash
npm run prepare:packages
npm test
npm run test:packages
```

Coverage includes resolution, compatibility, composition, adapters, file safety,
and native analysis. Local tarball tests cover presets and legacy, multiple
presets, hoisting, preserved public paths, and absence of unrelated framework
content. CI validates the checkout, not the current registry release. Release
tests mock registry operations.

## Release Boundary

One synchronized semantic-release process advances all five versions, exact
internal dependencies, and the npm v3 lockfile. `release.yml` uses pinned global
release tooling rather than root development dependencies and explicitly calls
reusable `publish.yml`; there are no release/tag event publishing triggers.

Publishing checks out and validates the exact release tag, runs asset preparation
and both test suites, and preflights all artifacts and registry identities.
Invocations are serialized and publish **core, React, Angular, Vue, then legacy**.
Already-published versions are skipped only on matching SHA-512 integrity, with
SHA-1 fallback only when integrity is absent. Only `E404` means absent; other
registry or authentication errors fail.

Publication is separate from implementation. Before a real release, establish
ownership of the `@agents-config` npm organization and authorized publishing
access for all five packages through `NPM_TOKEN`. Manual retry requires a version
and its exact `refs/tags/v<version>` ref, optionally a full commit SHA; see
[retrying publication](../CONTRIBUTING.md#retrying-publication). Local asset
preparation, packing, and tests do not publish anything.
