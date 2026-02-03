# Codebase Analysis Workflow

**Purpose**: Analyze a project's codebase and update AI agent configurations with project-specific context.

---

## When to Use This Skill

- After running `npx agents-init` to customize generic templates
- When onboarding to a new codebase
- When project structure or conventions have changed
- To verify agentic orchestration is properly configured
- Before major refactoring to document current state

## Workflow Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Scan Codebase  │ ──▶ │ Generate Report │ ──▶ │ Update Configs  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
   - File structure        - ANALYSIS.md          - PROJECT-CONTEXT.md
   - Dependencies          - Tech stack           - Agent instructions
   - Conventions           - Recommendations      - .agents-project.json
```

## CLI Commands

### Full Analysis (Interactive)
```bash
npx agents-analyze
```

### Preview Mode (No Changes)
```bash
npx agents-analyze --dry-run
```

### Generate Report Only
```bash
npx agents-analyze --report
```

### Verify Configuration
```bash
npx agents-analyze --verify
```

### Verbose Output
```bash
npx agents-analyze --verbose
```

## What Gets Analyzed

### 1. File Structure
- Total files and directories
- Component organization
- Pages/routes structure
- API endpoints
- Custom hooks
- Utility functions
- Test files
- Configuration files

### 2. Dependencies
- Framework (Next.js, React, Remix, etc.)
- Styling (Tailwind, MUI, Styled Components)
- Database (Supabase, Firebase, Prisma)
- Testing (Vitest, Jest, Playwright)
- Build tools (Vite, Turbo, Webpack)
- AI libraries (Gemini, OpenAI, Anthropic)

### 3. Coding Conventions
- Component naming style (PascalCase, camelCase, kebab-case)
- File extensions (.tsx, .jsx, .ts, .js)
- Test file naming (.test., .spec.)
- Index/barrel exports
- Import alias patterns

### 4. TypeScript Configuration
- Strict mode
- Base URL and path aliases
- Target and JSX settings

### 5. Project Setup
- README presence
- CONTRIBUTING guidelines
- LICENSE file
- Environment examples
- Docker configuration
- CI/CD workflows
- Git hooks

## Generated Files

### `.agents/ANALYSIS.md`
Full project analysis report including:
- Project overview
- Tech stack summary
- File distribution
- Coding conventions
- TypeScript config
- Recommendations

### `.agents/PROJECT-CONTEXT.md`
AI-ready project summary for agent consumption:
- Project identity
- Technology stack
- File organization
- Coding standards
- Available scripts
- Project-specific patterns (editable)

## Manual Customization

After running `agents-analyze`, edit `.agents/PROJECT-CONTEXT.md` to add:

### Project-Specific Patterns
```markdown
## Project-Specific Patterns

### Component Composition
- Use compound components for complex UI (Menu, Menu.Item, Menu.Trigger)
- Prefer composition over prop drilling
- All components support `className` prop for styling overrides

### State Management
- Global state: Zustand store in `/stores`
- Server state: TanStack Query with React Query DevTools
- Form state: React Hook Form with Zod validation

### Data Fetching
- Use server actions for mutations (Next.js 14+)
- Prefer `use` hook for data fetching in components
- All API routes return `{ data, error }` response format
```

### Domain-Specific Rules
```markdown
### Domain Rules

- User roles: 'admin', 'editor', 'viewer'
- All prices stored in cents (integer)
- Dates use ISO 8601 format
- IDs are UUIDs (not auto-increment)
```

### Do's and Don'ts
```markdown
### ✅ Do
- Use semantic HTML elements
- Add loading and error states to all data components
- Write tests for business logic

### ❌ Don't
- Use `any` type - prefer `unknown` with type guards
- Import from `node_modules` internal paths
- Skip accessibility attributes
```

## Integration with AI Assistants

After generating context files, update your agent configurations to reference them:

### GitHub Copilot
In `.github/copilot-instructions.md`:
```markdown
## Project Context
Read `.agents/PROJECT-CONTEXT.md` for project-specific conventions and patterns.
```

### Claude
In `CLAUDE.md`:
```markdown
## Project Reference
See `.agents/PROJECT-CONTEXT.md` for this project's:
- Technology stack and versions
- Coding conventions
- File organization patterns
```

### Cursor
In `.cursorrules`:
```markdown
# Project Context
Always reference .agents/PROJECT-CONTEXT.md for project conventions.
```

## Verification Checklist

Run `npx agents-analyze --verify` to check:

- [ ] `.agents-project.json` exists
- [ ] `.agents/` folder exists
- [ ] `.agents/AGENTS.md` exists
- [ ] All configured agent files exist
- [ ] `.agents/PROJECT-CONTEXT.md` exists
- [ ] Framework matches detected stack
- [ ] No config version mismatches

## Troubleshooting

### "No agents configuration found"
Run `npx agents-init` first to create the base configuration.

### Outdated PROJECT-CONTEXT.md
Re-run `npx agents-analyze` to regenerate with latest project state.

### Missing conventions
The analysis is based on file patterns. For non-standard project structures, manually edit PROJECT-CONTEXT.md.

### AI not following conventions
1. Verify the agent config references PROJECT-CONTEXT.md
2. Check the agent's context window limit (some truncate)
3. Put most important patterns first in the file

## Best Practices

1. **Run after `agents-init`**: Always run analyze after initial setup
2. **Commit generated files**: Version control .agents/ for team consistency
3. **Update periodically**: Re-run when project structure changes
4. **Customize manually**: Add domain-specific patterns to PROJECT-CONTEXT.md
5. **Keep it concise**: AI agents work better with focused, actionable context
6. **Use verify**: Run `--verify` in CI to catch configuration drift

---

## Related Skills

- [setup-orchestration.md](./setup-orchestration.md) - Full setup workflow
- [sdd-workflow.md](./sdd-workflow.md) - Spec-driven development process
