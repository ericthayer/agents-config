# Introducing agents-config: A Single Source of Truth for AI Coding Assistants

**The Problem**: Every AI coding assistant has its own configuration format. You're maintaining `.github/copilot-instructions.md`, `CLAUDE.md`, `.cursorrules`, `.gemini/config.md`... and they're all out of sync.

**The Solution**: `agents-config` – a universal configuration package that generates consistent AI guidelines for all your coding assistants from a single source.

## The Multi-Agent Reality

Modern developers don't use just one AI assistant. We switch between:

- **GitHub Copilot** for autocomplete
- **Claude** for complex refactoring
- **Cursor** for AI-first coding
- **Gemini** in VS Code
- **Codex** for OpenAI workflows
- **Windsurf** for specialized tasks

Each has different capabilities, different instruction formats, and different expectations. Keeping them aligned is a nightmare.

## How agents-config Works

### 1. Install and Initialize

```bash
npm install agents-config --save-dev
npx agents-init
```

### 2. Auto-Detection

The CLI automatically detects your stack:

```
🔍 Detecting project configuration...

Framework: next (detected from next.config.js)
Styling:   tailwind (detected from tailwind.config.ts)
Database:  supabase (detected from @supabase/supabase-js)
Gemini:    yes (detected from @google/generative-ai)
```

### 3. Select Your Agents

```
Which AI agents do you use? (space to select)
  ◉ GitHub Copilot
  ◉ Claude
  ◉ Cursor
  ◯ Gemini
  ◯ Codex
  ◯ Windsurf
```

### 4. Generated Files

The CLI creates a `.agents/` folder with curated rules and skills, plus adapter files for each agent:

```
my-project/
├── .agents/
│   ├── AGENTS.md           # Master reference
│   ├── rules/              # Shared guidelines
│   │   ├── accessibility.md
│   │   ├── tailwind-v4.md
│   │   └── supabase.md
│   └── skills/             # Reusable workflows
│       ├── scaffold-component/
│       └── accessibility-audit/
├── .agents-project.json    # Project config
├── .github/copilot-instructions.md
├── CLAUDE.md
└── .cursorrules
```

## What's in the Rules?

Each rule codifies best practices. For example, `accessibility.md`:

- WCAG 2.2 AA compliance requirements
- Color contrast ratios (4.5:1 minimum)
- Keyboard navigation patterns
- Screen reader compatibility
- Focus management

Or `tailwind-v4.md`:

- No `@apply` in components (use utility classes)
- CSS variables for design tokens
- Container queries over media queries
- Modern color-mix() syntax

## Skills: Reusable AI Workflows

Skills are multi-step instructions for common tasks. The `scaffold-component` skill guides AI to:

1. Create `ComponentName.tsx` with TypeScript
2. Add `ComponentName.spec.ts` for tests
3. Generate `ComponentName.stories.tsx` for Storybook
4. Include accessibility attributes

One skill, consistent output across all AI assistants.

## The .agents-project.json Schema

Customize what gets generated:

```json
{
  "$schema": "https://..../agents-project.schema.json",
  "version": "1.0.0",
  "project": {
    "name": "my-app",
    "framework": "next",
    "styling": "tailwind",
    "database": "supabase"
  },
  "agents": ["copilot", "claude", "cursor"],
  "rules": {
    "include": ["accessibility", "tailwind-v4"],
    "exclude": ["three-js-react"]
  },
  "overrides": {
    "accessibility": {
      "minContrastRatio": 7.0
    }
  }
}
```

## Why This Matters

### Consistency
All AI assistants follow the same coding standards. No more "Copilot uses semicolons but Claude doesn't."

### Portability
Moving between projects? Same rules, same expectations.

### Team Alignment
Everyone on the team gets the same AI behavior. Onboarding becomes "run `npx agents-init`."

### Version Control
Rules are code. Review changes in PRs. Roll back if needed.

## Get Started

```bash
# Install
npm install agents-config --save-dev

# Initialize (interactive)
npx agents-init

# Preview without writing
npx agents-init --dry-run

# Force overwrite existing files
npx agents-init --force
```

## What's Next

- **More rules**: TypeScript strict mode, Testing patterns, CI/CD
- **More agents**: JetBrains AI, Amazon Q, Codeium
- **Team features**: Shared overrides, org-level defaults
- **IDE integration**: VS Code extension for live preview

## Links

- **npm**: [npmjs.com/package/agents-config](https://www.npmjs.com/package/agents-config)
- **GitHub**: [github.com/ericthayer/agents-config](https://github.com/ericthayer/agents-config)
- **Issues**: [Report bugs or request features](https://github.com/ericthayer/agents-config/issues)

---

*Stop maintaining six instruction files. Maintain one source of truth.*

`npm install agents-config`
