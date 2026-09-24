# Commit conventions

Use the project's existing commit convention. If none is defined, use
`type(scope): description`, where the scope is optional.

- `feat`: a backward-compatible capability.
- `fix`: a behavior correction.
- `docs`: documentation changes.
- `refactor`: restructuring without changing behavior.
- `test`: coverage and test infrastructure.
- `chore`: tooling and maintenance.

Explain why a change is needed in the body when it is not evident from the
subject. Keep commits focused and review the staged diff before committing.
Never commit credentials, personal data, or unrelated generated artifacts.

Document breaking contracts using the project's release convention, including
migration guidance. Do not label a breaking change as a patch.
