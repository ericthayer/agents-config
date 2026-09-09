# {{AGENT}} instructions

> Generated for **{{PROJECT_NAME}}** by {{PACKAGE_NAME}}.

## Project

- Framework: {{FRAMEWORK}}
- Styling: {{STYLING}}
- Database: {{DATABASE}}

## Guidelines

Start with [AGENTS.md]({{GUIDELINES_PATH}}). Follow its framework-specific
component architecture, accessibility, TypeScript, and testing conventions.
Preserve project-specific decisions rather than introducing a different stack.

### Included rules

{{RULES_LIST}}

### Included skills

{{SKILLS_LIST}}

### Included instructions

{{INSTRUCTIONS_LIST}}

## Project-specific context

Run `npx agents-analyze` to generate `.agents/PROJECT-CONTEXT.md` with observed
project patterns. That file is optional until analysis has been run.

Add project-specific instructions below. Initialization preserves existing files
unless you explicitly use `--force`.
