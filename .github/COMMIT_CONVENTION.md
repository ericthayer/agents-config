# Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for semantic versioning.

## Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

## Types

| Type | Description | Version Bump |
|------|-------------|--------------|
| `feat` | New feature | **Minor** (1.0.0 → 1.1.0) |
| `fix` | Bug fix | **Patch** (1.0.0 → 1.0.1) |
| `docs` | Documentation only | No release |
| `style` | Code style (formatting, semicolons) | No release |
| `refactor` | Code refactor (no feature/fix) | No release |
| `perf` | Performance improvement | **Patch** |
| `test` | Add/update tests | No release |
| `build` | Build system changes | No release |
| `ci` | CI configuration | No release |
| `chore` | Maintenance tasks | No release |

## Breaking Changes

Add `BREAKING CHANGE:` in the footer or `!` after the type for **Major** version bump:

```
feat!: remove deprecated API

BREAKING CHANGE: The `oldMethod()` has been removed in favor of `newMethod()`.
```

## Examples

```bash
# Patch release (1.0.0 → 1.0.1)
fix: correct typo in accessibility rule

# Minor release (1.0.0 → 1.1.0)
feat(cli): add --verbose flag for detailed output

# Major release (1.0.0 → 2.0.0)
feat!: change config file format to YAML

# No release
docs: update README installation instructions
chore: update dev dependencies
```

## Scopes (optional)

- `cli` - Changes to agents-init CLI
- `rules` - Changes to rules/
- `skills` - Changes to skills/
- `instructions` - Changes to instructions/
- `adapters` - Changes to adapter templates
- `deps` - Dependency updates
