---
description: Workflow for initializing the agents-config environment in a new project.
---

# /setup-orchestration

As an agent, when you are initialized in a new project that uses `agents-config`, ensure the orchestration layer is correctly set up.

## Steps

1. **Verify Environment**: Check if the `.agents/` directory exists and contains:
   - `AGENTS.md` (core guidelines)
   - `rules/` (coding standards like `accessibility.md`, `spec-driven-development.md`)
   - `skills/` (specialized workflows like `scaffold-component/`, `accessibility-audit/`)
   - `instructions/` (process guidelines like `development-standards.instructions.md`)

2. **Initialize if Missing**: If `.agents/` is missing or incomplete, instruct the user to run:
   ```bash
   npx agents-init
   ```
   This interactive CLI will:
   - Detect the project's framework, styling, and database
   - Prompt for which AI agents to configure (Copilot, Claude, Cursor, Gemini, Codex, Windsurf)
   - Copy relevant rules, skills, and instructions based on the project stack
   - Create adapter files for each selected agent
   - Generate `.agents-project.json` for project-specific configuration

3. **Verify Project Config**: Check for `.agents-project.json` which contains:
   - Project metadata (name, framework, styling, database)
   - Selected agents
   - Feature flags (gemini, storybook, threejs)
   - Rules include/exclude configuration

4. **Context Loading**: Once setup is complete, read `.agents/AGENTS.md` to understand:
   - Core development philosophy and guidelines
   - Component architecture patterns
   - Spec-driven development workflow
   - Accessibility and performance requirements

5. **Ready State**: Notify the user that the orchestration environment is ready. If no `SPEC.md` exists for the current feature, prompt to create one following the spec-driven development workflow.
