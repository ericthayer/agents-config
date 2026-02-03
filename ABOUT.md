# Introducing agents-config: A Single Source of Truth for AI Coding Assistants

**The Problem**: Every AI coding assistant has its own configuration format. You're maintaining `.github/copilot-instructions.md`, `CLAUDE.md`, `.cursorrules`, `.gemini/config.md`... and they're all out of sync.

**The Solution**: `agents-config` – a universal configuration package that generates consistent AI guidelines for all your coding assistants from a single source.

## The Multi-Agent Reality

Modern developers don't use just one AI assistant. We switch between:

- **GitHub Copilot** for autocomplete and inline suggestions
- **Claude (Anthropic)** for complex refactoring and reasoning
- **Cursor** for AI-first coding workflows
- **Gemini (Google)** for long-context tasks and multimodal input
- **Codex (OpenAI)** for OpenAI-powered workflows
- **Windsurf (Codeium)** for fast autocomplete and code intelligence

Each has different capabilities, different instruction formats, and different expectations. Keeping them aligned manually is a maintenance nightmare.

## How agents-config Works

### 1. Install and Initialize

```bash
npm install agents-config --save-dev
npx agents-init
```

### 1.5 Customize for Your Codebase

After initialization, run the analyzer to generate project-specific context:

```bash
npx agents-analyze
```

This scans your codebase and generates:
- `.agents/ANALYSIS.md` - Full project analysis report
- `.agents/PROJECT-CONTEXT.md` - AI-ready project summary

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
  ◉ Claude (Anthropic)
  ◉ Cursor
  ◯ Gemini (Google)
  ◯ Codex (OpenAI)
  ◯ Windsurf/Codeium
```

### 4. Generated Files

The CLI generates adapter files for each agent that reference the shared guidelines from `node_modules/agents-config/`:

```
my-project/
├── .agents-project.json              # Project config
├── .github/
│   └── copilot-instructions.md       # GitHub Copilot
├── CLAUDE.md                         # Claude (Anthropic)
├── .cursorrules                      # Cursor IDE
├── .gemini/
│   └── config.md                     # Google Gemini
├── .codex/
│   └── AGENTS.md                     # OpenAI Codex
└── .windsurfrules                    # Windsurf/Codeium

node_modules/agents-config/
├── AGENTS.md                         # Core guidelines
├── rules/                            # 10 curated rules
├── skills/                           # Reusable workflows and automation
├── instructions/                     # 6 task-specific guides
└── schemas/                          # Configuration schemas
```

## What's in the Rules?

The package includes **10 curated rules** covering different aspects of modern web development:

**Core Rules** (always included):
- `accessibility.md` - WCAG 2.2 AA compliance, color contrast (4.5:1), keyboard navigation, screen reader support
- `component-architecture.md` - Folder-per-component pattern, file organization, export strategies
- `spec-driven-development.md` - SPEC.md-first development workflow
- `web-performance.md` - Core Web Vitals, lazy loading, bundle optimization

**Framework/Library Rules**:
- `tailwind-v4.md` - Modern Tailwind patterns, CSS variables, container queries, no `@apply`
- `mui.md` - Material-UI best practices, theming, component customization
- `supabase.md` - Database patterns, authentication, RLS policies
- `gemini.md` - Google Gemini AI integration patterns
- `react-19-compiler.md` - React 19 compiler optimization rules
- `three-js-react.md` - 3D graphics with Three.js in React

## Skills: Reusable AI Workflows

Skills are multi-step instructions for common tasks, packaged as self-contained `SKILL.md` files:

**Available Skills:**
- `scaffold-component/` - Create component with tests, stories, and accessibility
- `integrate-gemini/` - Add Google Gemini AI capabilities to your app
- `accessibility-audit/` - Comprehensive a11y review workflow
- `github-automation/` - GitHub workflow automation (PRs, commits, releases)

**Workflow Skills:**
- `workflows/sdd-workflow.md` - Complete spec-driven development process
- `workflows/setup-orchestration.md` - Multi-agent task orchestration
- `workflows/codebase-analysis.md` - Codebase analysis and context generation

**Instructions** (task-specific guides):
- Development standards, GitHub issues, release notes, Storybook, MUI, web interface guidelines

One skill, consistent output across all AI assistants.

## The .agents-project.json Schema

Customize what gets generated:

```json
{
  "$schema": "https://raw.githubusercontent.com/ericthayer/agents-config/main/schemas/agents-project.schema.json",
  "version": "1.0.0",
  "project": {
    "name": "my-app",
    "framework": "next",
    "styling": "tailwind",
    "database": "supabase"
  },
  "agents": ["copilot", "claude", "cursor", "gemini", "codex", "windsurf"],
  "rules": {
    "include": ["tailwind-v4", "supabase", "mui"],
    "exclude": ["three-js-react"]
  },
  "overrides": {
    "accessibility": {
      "minContrastRatio": 7.0
    }
  }
}
```

**Supported Options:**
- **Frameworks**: `next`, `react`, `remix`, `astro`, `vue`, `svelte`, `other`
- **Styling**: `tailwind`, `mui`, `vanilla`, `styled`, `emotion`, `css-modules`, `other`
- **Database**: `supabase`, `firebase`, `prisma`, `drizzle`, `none`, `other`
- **Agents**: `copilot`, `claude`, `cursor`, `gemini`, `codex`, `windsurf`

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

# Analyze codebase and generate project context
npx agents-analyze

# Preview without writing
npx agents-init --dry-run
npx agents-analyze --dry-run

# Force overwrite existing files
npx agents-init --force

# Verify configuration
npx agents-analyze --verify
```

## Real-World Examples

The package includes two complete example projects:

- **`next-tailwind-supabase/`** - Next.js app with Tailwind CSS and Supabase backend
- **`react-mui-gemini/`** - React app with Material-UI and Gemini AI integration

Each example shows the complete `.agents-project.json` configuration and generated adapter files.

## What's Next

- **More rules**: TypeScript strict mode, Testing patterns, CI/CD, GraphQL, tRPC
- **More agents**: JetBrains AI Assistant, Amazon Q, Continue.dev
- **Team features**: Shared team overrides, org-level defaults, ESLint integration
- **IDE integration**: VS Code extension for live preview and validation
- **Analytics**: Track which rules are most used, effectiveness metrics

## Links

- **npm**: [npmjs.com/package/agents-config](https://www.npmjs.com/package/agents-config)
- **GitHub**: [github.com/ericthayer/agents-config](https://github.com/ericthayer/agents-config)
- **Issues**: [Report bugs or request features](https://github.com/ericthayer/agents-config/issues)

---

*Stop maintaining six instruction files. Maintain one source of truth.*

`npm install agents-config`
