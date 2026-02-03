# [1.3.0](https://github.com/ericthayer/agents-config/compare/v1.2.2...v1.3.0) (2026-02-03)


### Features

* include .github templates and workflows in npx agents-init ([#9](https://github.com/ericthayer/agents-config/issues/9)) ([f12dfc9](https://github.com/ericthayer/agents-config/commit/f12dfc9574a5884d4970a03d201a0819112ee9ab))

## [1.2.2](https://github.com/ericthayer/agents-config/compare/v1.2.1...v1.2.2) (2026-02-01)


### Bug Fixes

* use unique temp file for PR creation to prevent conflicts ([8d504f5](https://github.com/ericthayer/agents-config/commit/8d504f5b912789563ef4a6c7bddf68a754a95255))

## [1.2.1](https://github.com/ericthayer/agents-config/compare/v1.2.0...v1.2.1) (2026-02-01)


### Bug Fixes

* add ABOUT document ([5ec04bc](https://github.com/ericthayer/agents-config/commit/5ec04bc3ad8d7e496274c70623570a7c5945e6ec))

# [1.2.0](https://github.com/ericthayer/agents-config/compare/v1.1.2...v1.2.0) (2026-02-01)


### Features

* export prompts folder and sync documentation for v1.2.0 ([9377379](https://github.com/ericthayer/agents-config/commit/937737917c961bca8a25bc88476c16c04d392a47))

## [1.1.2](https://github.com/ericthayer/agents-config/compare/v1.1.1...v1.1.2) (2026-02-01)


### Bug Fixes

* remove .npmrc ([06e65b2](https://github.com/ericthayer/agents-config/commit/06e65b2a8ddfb4b4dddd9b6155bd12db4cb28454))

## [1.1.1](https://github.com/ericthayer/agents-config/compare/v1.1.0...v1.1.1) (2026-01-31)


### Bug Fixes

* remove vercel-react-best-practices from package ([dd9975a](https://github.com/ericthayer/agents-config/commit/dd9975ae2fb2ff3d6d25f2dbdac74f75181d1c4e))
* remove vercel-react-best-practices from package ([45d330d](https://github.com/ericthayer/agents-config/commit/45d330d1dffec146db962a932e6ba9133b3bf9da))
* update readme with correct information ([e7146fd](https://github.com/ericthayer/agents-config/commit/e7146fd3db134b498568358cede4b868e34cdbe1))

# 1.0.0 (2026-01-31)


### Performance Improvements

* generalized documentation, updated core set of files ([b152c6a](https://github.com/ericthayer/agents-config/commit/b152c6a4582898aec90891e533fb9e4b983ffd06))
* setup semantic release ([a59f934](https://github.com/ericthayer/agents-config/commit/a59f93463772e4042da97eef128f36d62b1d7c0c))

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-01-31

### Added
- Web Interface Guidelines now included as core instruction for all installs
- Optional skills section in CLI completion message
- Support for `npx add-skill vercel-labs/agent-skills` for Vercel React best practices

### Changed
- Vercel React best practices no longer auto-included (now optional via add-skill)

## [1.0.0] - 2026-01-31

### Added
- Initial release
- Core rules: accessibility, component-architecture, spec-driven-development, web-performance
- Core skills: accessibility-audit, scaffold-component, integrate-gemini
- Core instructions: development-standards, web-interface-guidelines
- Support for 6 AI agents: Copilot, Claude, Cursor, Gemini, Codex, Windsurf
- Interactive CLI with project detection
- Framework/styling/database auto-detection
