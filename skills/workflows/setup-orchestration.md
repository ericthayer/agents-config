---
description: Workflow for initializing the Agentic Orchestration environment in a new project.
---

# /setup-orchestration

As an agent, when you are initialized in a new project environment based on this template, you must ensure the orchestration layer is correctly set up.

## Steps

1. **Verify Environment**: Check if the `.agent/rules` directory contains the standard rulesets (e.g., `accessibility.md`, `spec-driven-development.md`).
2. **Initialize if Missing**: If rules are missing or empty, run the following command to pull them from the global standard:
   ```bash
   sh scripts/init-orchestration.sh
   ```
3. **Verify Symlinks vs Copies**: Confirm that the rules are actual files (this template uses a copy strategy, not symlinks).
4. **Context Loading**: Once rules are present, read `AGENTIC_ORCHESTRATION.md` to understand the project's core philosophy and technical stack.
5. **Ready State**: Notify the user that the orchestration environment is ready and ask for the first `SPEC.md` if one does not exist.
