# Monorepo Migration Plan: @agents-config Packages

## Overview

Migrate from single `agents-config` package to a scoped monorepo with framework-specific packages.

## Target Package Structure

```
@agents-config/core          # Shared rules, skills, instructions (framework-agnostic)
@agents-config/react         # React/Next.js/Remix specific
@agents-config/vue           # Vue.js/Nuxt specific
@agents-config/angular       # Angular specific
@agents-config/web-components # Vanilla/Lit/Stencil specific
```

---

## Phase 1: Preparation

### 1.1 Create npm Organization
- [ ] Go to https://www.npmjs.com/org/create
- [ ] Create org: `agents-config`
- [ ] This reserves the `@agents-config/*` namespace

### 1.2 Set Up Monorepo Structure
```
agents-config/
├── packages/
│   ├── core/
│   │   ├── package.json        # @agents-config/core
│   │   ├── AGENTS.md
│   │   ├── rules/
│   │   │   ├── accessibility.md
│   │   │   ├── spec-driven-development.md
│   │   │   └── web-performance.md
│   │   ├── skills/
│   │   │   └── accessibility-audit/
│   │   ├── instructions/
│   │   │   ├── development-standards.instructions.md
│   │   │   └── web-interface-guidelines.instructions.md
│   │   ├── prompts/
│   │   └── schemas/
│   │       └── agents-project.schema.json
│   │
│   ├── react/
│   │   ├── package.json        # @agents-config/react
│   │   ├── bin/
│   │   │   └── agents-init.js
│   │   ├── adapters/
│   │   ├── rules/
│   │   │   ├── component-architecture.md
│   │   │   ├── react-19-compiler.md
│   │   │   └── three-js-react.md
│   │   ├── skills/
│   │   │   ├── scaffold-component/
│   │   │   └── integrate-gemini/
│   │   └── instructions/
│   │       └── storybook.instructions.md
│   │
│   ├── vue/
│   │   ├── package.json        # @agents-config/vue
│   │   ├── bin/
│   │   ├── adapters/
│   │   ├── rules/
│   │   │   ├── composition-api.md
│   │   │   ├── vue-3-patterns.md
│   │   │   └── nuxt.md
│   │   └── skills/
│   │
│   ├── angular/
│   │   ├── package.json        # @agents-config/angular
│   │   └── ...
│   │
│   └── web-components/
│       ├── package.json        # @agents-config/web-components
│       └── ...
│
├── package.json                # Root workspace config
├── pnpm-workspace.yaml         # or npm workspaces
├── turbo.json                  # Optional: Turborepo for builds
├── README.md
├── ABOUT.md
├── CONTRIBUTING.md
└── LICENSE
```

### 1.3 Choose Monorepo Tooling
**Recommended: pnpm workspaces + Turborepo**

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
```

```json
// Root package.json
{
  "name": "agents-config-monorepo",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "build": "turbo run build",
    "test": "turbo run test",
    "publish-all": "pnpm -r publish --access public"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  }
}
```

---

## Phase 2: Extract Core Package

### 2.1 Create @agents-config/core

**Framework-agnostic content:**
- `AGENTS.md` (base version, without React-specific references)
- Core rules:
  - `accessibility.md`
  - `spec-driven-development.md`
  - `web-performance.md`
- Core skills:
  - `accessibility-audit/`
- Core instructions:
  - `development-standards.instructions.md`
  - `web-interface-guidelines.instructions.md`
- Prompts (generic):
  - `create-pr.prompt.md`
- Schema:
  - `agents-project.schema.json` (updated for framework field)

```json
// packages/core/package.json
{
  "name": "@agents-config/core",
  "version": "1.0.0",
  "description": "Shared rules and skills for AI coding assistants",
  "files": ["AGENTS.md", "rules/", "skills/", "instructions/", "prompts/", "schemas/"],
  "keywords": ["ai", "agents", "copilot", "claude", "cursor", "gemini"]
}
```

### 2.2 Update Schema for Framework Support

```json
{
  "project": {
    "framework": {
      "type": "string",
      "enum": ["next", "react", "remix", "vue", "nuxt", "angular", "lit", "stencil", "vanilla"]
    }
  }
}
```

---

## Phase 3: Create React Package

### 3.1 Create @agents-config/react

```json
// packages/react/package.json
{
  "name": "@agents-config/react",
  "version": "1.0.0",
  "description": "AI agent configuration for React applications",
  "bin": {
    "agents-init": "./bin/agents-init.js"
  },
  "dependencies": {
    "@agents-config/core": "^1.0.0"
  },
  "files": ["bin/", "adapters/", "rules/", "skills/", "instructions/"],
  "keywords": ["react", "next", "remix", "ai", "agents", "copilot", "claude"]
}
```

### 3.2 React-Specific Content
- Rules:
  - `component-architecture.md`
  - `react-19-compiler.md`
  - `three-js-react.md`
  - `tailwind-v4.md` (shared, but React examples)
  - `mui.md`
  - `supabase.md`
  - `gemini.md`
- Skills:
  - `scaffold-component/`
  - `integrate-gemini/`
- Instructions:
  - `storybook.instructions.md`
  - `mui.instructions.md`

### 3.3 Update CLI to Merge Core + React

```javascript
// packages/react/bin/agents-init.js
import { coreRules, coreSkills } from '@agents-config/core';

const REACT_RULES = ['component-architecture', 'react-19-compiler', ...];
const ALL_RULES = [...coreRules, ...REACT_RULES];
```

---

## Phase 4: Create Vue Package

### 4.1 Create @agents-config/vue

```json
// packages/vue/package.json
{
  "name": "@agents-config/vue",
  "version": "1.0.0",
  "description": "AI agent configuration for Vue.js applications",
  "dependencies": {
    "@agents-config/core": "^1.0.0"
  }
}
```

### 4.2 Vue-Specific Content to Create
- Rules:
  - `composition-api.md` - Composition API patterns
  - `vue-3-patterns.md` - Vue 3 best practices
  - `nuxt.md` - Nuxt.js specific patterns
  - `pinia.md` - State management
  - `vue-router.md` - Routing patterns
- Skills:
  - `scaffold-vue-component/`
  - `vue-composable/`
- Instructions:
  - `vue-testing.instructions.md`

---

## Phase 5: Create Angular Package

### 5.1 Create @agents-config/angular

- Rules:
  - `angular-signals.md` - Signals pattern (Angular 16+)
  - `angular-standalone.md` - Standalone components
  - `ngrx.md` - State management
  - `angular-forms.md` - Reactive forms patterns
  - `angular-material.md` - Material components
- Skills:
  - `scaffold-angular-component/`
  - `angular-service/`

---

## Phase 6: Create Web Components Package

### 6.1 Create @agents-config/web-components

- Rules:
  - `custom-elements.md` - Native custom elements
  - `lit.md` - Lit framework patterns
  - `stencil.md` - Stencil compiler patterns
  - `shadow-dom.md` - Shadow DOM best practices
- Skills:
  - `scaffold-web-component/`

---

## Phase 7: Migration & Publishing

### 7.1 Deprecate Old Package
```bash
npm deprecate agents-config@"<2.0.0" "This package has moved to @agents-config/react. See https://github.com/ericthayer/agents-config for migration guide."
```

### 7.2 Publish New Packages
```bash
# First publish
cd packages/core && pnpm publish --access public
cd packages/react && pnpm publish --access public
cd packages/vue && pnpm publish --access public
# etc.
```

### 7.3 Update Documentation
- Update README with new install commands
- Create migration guide
- Update all URLs

---

## Migration Guide for Users

### From agents-config to @agents-config/react

**Before:**
```bash
npm install agents-config --save-dev
npx agents-init
```

**After:**
```bash
npm install @agents-config/react --save-dev
npx agents-init
```

That's it! The CLI works the same way.

---

## Timeline Estimate

| Phase | Task | Time |
|-------|------|------|
| 1 | Preparation & setup | 2-3 hours |
| 2 | Extract core package | 2-3 hours |
| 3 | Migrate React package | 2-3 hours |
| 4 | Create Vue package | 4-6 hours |
| 5 | Create Angular package | 4-6 hours |
| 6 | Create Web Components package | 3-4 hours |
| 7 | Migration & publishing | 1-2 hours |
| **Total** | | **18-27 hours** |

---

## Open Questions

1. **Shared styling rules?** Should `tailwind-v4.md` and `mui.md` be in core or framework-specific?
2. **Database rules?** Supabase/Firebase are framework-agnostic - move to core?
3. **CLI per package or shared?** Each package has its own CLI, or one CLI that installs correct package?
4. **Versioning strategy?** Sync versions across packages or independent?

---

## Notes

- Keep the GitHub repo as `agents-config` (not renamed)
- Vue/Angular packages can be created incrementally
- Start with core + react, validate the pattern, then expand
