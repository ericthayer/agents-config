# Contributing to agents-config

Thank you for your interest in contributing to agents-config! This document provides guidelines and instructions for contributing.

## Welcome

agents-config is a community-driven project that helps developers maintain consistent, accessible, and performant code across their React applications. We welcome contributions of all kinds, including:

- New rules for coding standards
- New skills for specialized workflows
- New instructions for development processes
- Bug fixes and improvements
- Documentation updates
- Example projects

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Git

### Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/agents-config.git
   cd agents-config
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Test the CLI**
   ```bash
   node bin/agents-init.js --help
   node bin/agents-init.js --dry-run
   ```

## Project Structure

```
agents-config/
├── adapters/           # Agent adapter templates
│   ├── copilot.template.md
│   ├── claude.template.md
│   ├── cursor.template.md
│   ├── gemini.template.md
│   ├── codex.template.md
│   └── windsurf.template.md
├── bin/                # CLI scripts
│   ├── agents-init.js  # Main CLI tool
│   └── postinstall.js  # Post-install message
├── instructions/       # Process guidelines
├── prompts/           # Reusable prompt templates
├── rules/             # Coding standards
├── schemas/           # JSON schemas
├── skills/            # Specialized workflows
└── examples/          # Example projects
```

## How to Contribute

### Adding a New Rule

Rules define coding standards for specific technologies or patterns.

1. Create a new file in `rules/` with kebab-case naming:
   ```bash
   touch rules/your-rule-name.md
   ```

2. Follow this structure:
   ```markdown
   # Rule Name

   **Purpose**: Brief description of what this rule covers.

   ---

   ## Overview

   Explain when and why to use this rule.

   ## Guidelines

   ### Section 1
   - Guideline details
   - Code examples

   ## Anti-Patterns

   ### ❌ Bad Pattern
   ```code example```

   ### ✅ Good Pattern
   ```code example```

   ## Related Resources
   - Links to documentation
   ```

3. Update `bin/agents-init.js` to include detection logic if the rule should be auto-selected.

### Adding a New Skill

Skills are specialized workflows for complex tasks.

1. Create a new folder in `skills/`:
   ```bash
   mkdir -p skills/your-skill-name
   touch skills/your-skill-name/SKILL.md
   ```

2. Follow this structure in `SKILL.md`:
   ```markdown
   # Skill Name

   **Purpose**: What this skill helps accomplish.

   ## When to Use

   - Trigger conditions
   - Use cases

   ## Workflow

   ### Step 1: First Step
   Description and actions.

   ### Step 2: Second Step
   Description and actions.

   ## Checklist

   - [ ] Item 1
   - [ ] Item 2

   ## Examples

   Code examples and templates.
   ```

3. Update `bin/agents-init.js` to include the skill in `determineSkills()`.

### Adding a New Instruction

Instructions are process guidelines for development workflows.

1. Create a new file in `instructions/`:
   ```bash
   touch instructions/your-instruction.instructions.md
   ```

2. Follow similar structure to existing instructions.

3. Update `bin/agents-init.js` to include detection logic in `determineInstructions()`.

### Adding Agent Adapter Support

To add support for a new AI coding assistant:

1. Create a template in `adapters/`:
   ```bash
   touch adapters/new-agent.template.md
   ```

2. Include these placeholders:
   - `{{PROJECT_NAME}}` - Project name
   - `{{FRAMEWORK}}` - Detected framework
   - `{{STYLING}}` - Styling approach
   - `{{DATABASE}}` - Database/backend
   - `{{RULES_LIST}}` - List of included rules

3. Update `bin/agents-init.js`:
   - Add to `AGENTS` object
   - Add detection logic if needed

## Pull Request Process

1. **Ensure your code works**
   ```bash
   node bin/agents-init.js --dry-run
   ```

2. **Update documentation** if you've added new features

3. **Write a clear PR description**:
   - What does this PR do?
   - Why is this change needed?
   - How was it tested?

4. **Keep PRs focused** - One feature or fix per PR

5. **Follow existing patterns** - Match the style of existing code and documentation

## Code Style

- Use ES modules (`import`/`export`)
- Use kebab-case for file names
- Use PascalCase for component names in examples
- Include helpful comments
- Write clear, actionable documentation

## Commit Messages

Follow conventional commits:

```
feat: add new tailwind-v4 rule
fix: correct detection logic for MUI
docs: update README with new examples
chore: update dependencies
```

## Reporting Issues

When reporting bugs, please include:

1. Node.js version (`node --version`)
2. npm version (`npm --version`)
3. Operating system
4. Steps to reproduce
5. Expected vs actual behavior

## Questions?

- Open a [GitHub Issue](https://github.com/ericthayer/agents-config/issues)
- Check existing issues for similar questions

## Code of Conduct

Be respectful and inclusive. We're all here to learn and improve.

---

Thank you for contributing! 🎉
