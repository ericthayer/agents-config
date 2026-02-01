# Example: Next.js + Tailwind CSS + Supabase

This example demonstrates how `agents-config` sets up a project using:
- **Next.js** 14+ (App Router)
- **Tailwind CSS** v4
- **Supabase** for backend

## Generated Files

After running `npx agents-init` and selecting Copilot, Claude, and Cursor:

```
my-nextjs-app/
├── .agents/
│   ├── AGENTS.md
│   ├── rules/
│   │   ├── accessibility.md
│   │   ├── component-architecture.md
│   │   ├── spec-driven-development.md
│   │   ├── tailwind-v4.md
│   │   ├── supabase.md
│   │   └── web-performance.md
│   ├── skills/
│   │   ├── accessibility-audit/SKILL.md
│   │   └── scaffold-component/SKILL.md
│   ├── prompts/
│   │   ├── create-pr.prompt.md
│   │   └── scaffold-component.prompt.md
│   └── instructions/
│       ├── development-standards.instructions.md
│       └── web-interface-guidelines.instructions.md
├── .agents-project.json
├── .github/copilot-instructions.md
├── CLAUDE.md
└── .cursorrules
```

## .agents-project.json

```json
{
  "$schema": "https://raw.githubusercontent.com/ericthayer/agents-config/main/schemas/agents-project.schema.json",
  "version": "1.0.0",
  "project": {
    "name": "my-nextjs-app",
    "framework": "next",
    "styling": "tailwind",
    "database": "supabase"
  },
  "agents": ["copilot", "claude", "cursor"],
  "features": {
    "gemini": false,
    "storybook": false,
    "threejs": false
  },
  "rules": {
    "include": [
      "accessibility",
      "component-architecture",
      "spec-driven-development",
      "tailwind-v4",
      "supabase",
      "web-performance"
    ],
    "exclude": []
  },
  "overrides": {}
}
```

## What Each AI Agent Sees

### GitHub Copilot (`.github/copilot-instructions.md`)

Copilot will follow:
- Tailwind v4 patterns (no `@apply` in components, use design tokens)
- Supabase RLS policies and type-safe queries
- Next.js App Router conventions
- Accessibility requirements (WCAG 2.2 AA)

### Claude (`CLAUDE.md`)

Claude can reference:
- Full rules in `.agents/rules/`
- Skills for component scaffolding and accessibility audits
- Project-specific overrides

### Cursor (`.cursorrules`)

Cursor follows the same guidelines with quick reference patterns.

## Try It

```bash
# Create a new Next.js app
npx create-next-app@latest my-nextjs-app --typescript --tailwind --app

# Navigate and install
cd my-nextjs-app
npm install @supabase/supabase-js
npm install agents-config --save-dev

# Initialize agent configuration
npx agents-init
# Select: Copilot, Claude, Cursor
# Framework will auto-detect as Next.js
# Styling will auto-detect as Tailwind
# Database: select Supabase
```

## Customization

Edit `.agents-project.json` to add overrides:

```json
{
  "overrides": {
    "accessibility": {
      "minContrastRatio": 7.0
    }
  }
}
```
