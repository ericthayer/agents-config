# Example: Vue 3

Use this setup from an existing Vue 3 application's directory, including the
application workspace directory when dependencies are hoisted. Use Node.js >=18
and satisfy any newer Node requirement imposed by your application's tooling.
This example is for Vue, **not Nuxt**.

```bash
npm install -D @agents-config/vue
npx agents-init --stack vue --yes --agents copilot,claude
npx agents-analyze --stack vue --report
```

The scoped package must be published before registry installation is available.
For repository development, use the root local-tarball workflow described in
[CONTRIBUTING.md](../../CONTRIBUTING.md).

## What Is Generated

Initialization writes `.agents-project.json`, guidance under `.agents/`, and
the selected adapters (`.github/copilot-instructions.md` and `CLAUDE.md` above).
The config records `project.stack: "vue"` and `project.framework: "vue"`.
Use `npx agents-analyze` after initialization to generate project context;
`--report` above only reports analysis.

Vue guidance covers Vue 3 single-file components, Composition API, composables,
Vue Router, forms, local/Pinia state, testing, and component scaffolding. Shared
accessibility, performance, and specification workflows are composed with
Vue-native content. Follow APIs supported by the application's installed Vue
version; Pinia and Vue Router guidance does not install those dependencies.

Root repository `AGENTS.md` is intentionally legacy React source. It is not the
Vue consumer's generated `.agents/AGENTS.md`.

## Selection and Safe Updates

After initialization, the saved stack allows `npx agents-init --yes` without
repeating `--stack`. Explicit `--stack` overrides persisted configuration, which
otherwise takes precedence over one directly declared installed preset. Without
explicit or persisted selection, multiple presets require an interactive choice
and fail unattended. Dependency/stack mismatches also fail unattended.

```bash
# Preview only: no files or directories are written
npx agents-init --stack vue --yes --dry-run

# Intentionally replace only planned generated files
npx agents-init --stack vue --yes --force
```

Without force, existing files, including nested skills, are preserved. Switching
a persisted stack requires `--force`; stale previous-stack files are reported
but not deleted. Review them yourself. `--agents` accepts `copilot`, `claude`,
`cursor`, `gemini`, `codex`, and `windsurf`; saved choices are retained when
omitted, and a fresh unattended setup defaults to Copilot and Claude.

## Scope

Nuxt and optional Vue UI-library, backend, application-AI, and 3D integrations
are not included; unsupported integrations warn without adding React content.
Native routing, forms, state, and testing are included. Selecting the Gemini
assistant does not enable Gemini application SDK guidance. No application
dependencies, missing presets, or external skill packs are automatically downloaded.

See [README.md](../../README.md) for the shared CLI and configuration contract.
