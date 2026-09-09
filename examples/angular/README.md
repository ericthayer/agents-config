# Example: Angular

Use this setup from an existing Angular application's directory, including the
application workspace directory when dependencies are hoisted. Node.js >=18 is
required by agents-config; also satisfy your Angular version's Node requirements.

```bash
npm install -D @agents-config/angular
npx agents-init --stack angular --yes --agents copilot,claude
npx agents-analyze --stack angular --report
```

The scoped package must be published before registry installation is available.
For repository development, use the root local-tarball workflow described in
[CONTRIBUTING.md](../../CONTRIBUTING.md).

## What Is Generated

Initialization writes `.agents-project.json`, guidance under `.agents/`, and
the selected adapters (`.github/copilot-instructions.md` and `CLAUDE.md` above).
The config records `project.stack: "angular"` and `project.framework: "angular"`.
Use `npx agents-analyze` after initialization to generate project context;
`--report` above only reports analysis.

Angular guidance covers standalone components, signals and dependency injection,
Angular routing, typed reactive forms, state/RxJS, testing, and component
scaffolding. Shared accessibility, performance, and specification workflows are
composed with Angular-native content. Follow the installed Angular version's
stable APIs rather than assuming every version supports the newest patterns.

Root repository `AGENTS.md` is intentionally legacy React source. It is not the
Angular consumer's generated `.agents/AGENTS.md`.

## Selection and Safe Updates

After initialization, the saved stack allows `npx agents-init --yes` without
repeating `--stack`. Explicit `--stack` overrides persisted configuration, which
otherwise takes precedence over one directly declared installed preset. Without
explicit or persisted selection, multiple presets require an interactive choice
and fail unattended. Dependency/stack mismatches also fail unattended.

```bash
# Preview only: no files or directories are written
npx agents-init --stack angular --yes --dry-run

# Intentionally replace only planned generated files
npx agents-init --stack angular --yes --force
```

Without force, existing files, including nested skills, are preserved. Switching
a persisted stack requires `--force`; stale previous-stack files are reported
but not deleted. Review them yourself. `--agents` accepts `copilot`, `claude`,
`cursor`, `gemini`, `codex`, and `windsurf`; saved choices are retained when
omitted, and a fresh unattended setup defaults to Copilot and Claude.

## Scope

Optional Angular UI-library, backend, application-AI, and 3D integrations are not
included; unsupported integrations warn without adding React content. Native
routing, forms, state, and testing are included. Selecting the Gemini assistant
does not enable Gemini application SDK guidance. No application dependencies,
missing presets, or external skill packs are automatically downloaded.

See [README.md](../../README.md) for the shared CLI and configuration contract.
