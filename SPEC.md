# Frontend stack configuration packages

## Intent

Provide independently installable React, Angular, and Vue knowledge packages,
composed with framework-neutral guidance and a shared CLI engine. Existing
`agents-config` consumers retain their React install command and published assets.

## Consumer interface

```sh
npm install --save-dev @agents-config/angular
npx agents-init
npx agents-analyze
npx agents-init --stack angular --dry-run
```

Replace `angular` with `react` or `vue` as appropriate. Existing
`npm install --save-dev agents-config` remains supported.

- Keep both command names and existing flags. Add `--stack react|angular|vue`.
- `agents-init --yes` enables deterministic, noninteractive initialization using
  detected settings and defaults. `--agents copilot,claude` chooses assistants;
  omitted unattended selection defaults to Copilot and Claude.
- `agents-analyze --yes` explicitly authorizes unattended report/context writes.
  It does not bypass ambiguous selection, dependency mismatches, or file-safety
  checks. Guided customization still requires an interactive terminal.
- Resolve stack from explicit flag, persisted stack/recognized legacy framework,
  then directly declared installed presets. A legacy install counts as React.
- Ambiguous selection prompts interactively; unattended ambiguity fails.
- All wrappers share resolution; the linked bin never determines the stack.
- A preset must already be installed. No implicit registry downloads.
- Dependency/selected-stack mismatches require interactive confirmation and fail
  unattended. Nuxt-specific generation is unsupported in this release.
- Run from the consumer application directory, including in hoisted workspaces.

## Package boundary

All packages use ESM and support Node >=18. npm workspaces share a synchronized
version with exact internal dependencies:

| Package | Dependencies | Owns |
| --- | --- | --- |
| `@agents-config/core` | None | Engine, neutral guidance, adapters, schema |
| `@agents-config/react` | Core | React-family preset and existing integrations |
| `@agents-config/angular` | Core | Angular preset/content |
| `@agents-config/vue` | Core | Vue preset/content |
| `agents-config` | React, Core | Legacy wrappers and existing public assets |

Core exports `./init`, `./analyze`, and `./project`. Preset packages export
`./preset` and `./package.json`. Thin CLI wrappers call `runInit()` or
`runAnalyze()` and report errors with a nonzero exit status.

### Preset descriptor

`preset.js` exports a default descriptor:

```js
{
  id: 'angular',
  frameworks: { angular: 'Angular' },
  root: '/absolute/path/to/installed/preset',
  rules: ['component-architecture', 'angular-signals', 'angular-router'],
  skills: ['scaffold-component'],
  instructions: ['angular-testing'],
  features: {
    // Optional capabilities map to additional rule/skill/instruction arrays.
  }
}
```

Content under each root uses `AGENTS.md`, `rules/*.md`,
`skills/<name>/**`, and `instructions/*.instructions.md`. Core owns neutral
accessibility/performance/spec rules and workflows; presets own component
architecture and scaffolding. Required content must exist. Composition rejects
destination collisions. Descriptor strings are validated before resolving paths.

`resolveProject({projectDir, stack, choose, confirmMismatch})` returns a promise
for `{projectDir, preset, stack, framework, config, packageJson}`. `config` is the validated
existing config or null. The async choice callbacks are optional; without them,
ambiguities/mismatches fail. Shared exports include `SCHEMA_VERSION`,
`stackForFramework(framework)`, `detectFrameworks(packageJson)`, and `readJson`.

## Configuration and file safety

- Schema version 1.2.0 adds optional `project.stack` and Angular framework support.
  Accept old versions 1.0.0/1.1.0, retaining custom names, overrides, exclusions,
  additional fields, and assistant choices. Preserve the existing schema URL.
- Plan all files and validate required content before writing. No partial
  success-shaped error handling.
- Dry runs write nothing. Non-force runs preserve every existing file, including
  files nested inside skills.
- A non-force stack switch fails. Force replaces only planned destinations;
  stale files are reported, not deleted. User content is never recursively removed.
- Reject symlinked output destinations/ancestors rather than writing outside the
  chosen consumer directory.
- Generated adapters list the actual installed assets. Links are relative to
  the containing adapter or guidance document. Optional future context and skill
  pack paths are labeled as optional, not presented as existing required files.
- Unsupported Angular/Vue integrations emit a warning and never add React content.

## Content and analysis

Angular covers stable standalone components, signals/DI, routing, typed reactive
forms, state/RxJS, testing, and scaffolding. Vue covers Vue 3 SFCs/Composition API,
composables, routing, forms, local/Pinia state, testing, and scaffolding.
Version-dependent guidance references official documentation and must respect the
consumer's installed framework version. Nuxt and optional Angular/Vue UI/backend/
AI/3D integrations are deferred. React integrations remain available.

Shared content is genuinely framework-neutral. Analyzer report, guided mode,
generated context, and verification use the same framework identifiers and preset
selection as initialization. Vue SFCs and Angular sources/templates/services are
recognized; tests take precedence over source classification. No React naming,
state, or forms defaults leak into other presets.

## Distribution and releases

Keep one source for each asset. Root legacy React assets and GitHub helper
documents are staged into the React package. Core owns framework-neutral GitHub
templates; the shared schema and framework-neutral GitHub automation skill are
staged into core. Tarballs must contain everything required without accessing
the repository at runtime.

All five versions and internal dependencies advance together through semantic
release. A single explicit publishing workflow publishes core, presets, then
legacy, with serialized invocations and verified artifact identity on retry.
Before any missing artifacts are published, reject a retry if any package's
current stable `latest` tag is newer, preventing historical retries from
downgrading default installations.
Never mask registry/authentication errors. Scope ownership and publishing
permissions must be configured separately. Implementation does not publish.

## Acceptance

Node built-in tests cover stack resolution, config compatibility, manifest
validation, content composition, all adapters, file preservation, dry-run/errors,
and framework-native analysis. Installed local tarballs cover all presets and
legacy, multiple presets, hoisted resolution, public asset paths, and no unrelated
framework content. CI tests the checkout on supported Node versions, not the
currently published package. Release tests use mocked registry operations.

## Changelog

- Initial specification: additive framework packages and compatible shared CLI.
