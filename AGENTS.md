# Agents guidelines when building React applications with AI-powered tools

**OBJECTIVE:**
Building production-ready React applications with TypeScript and AI-powered tools.

**REASON:**
Enables rapid prototyping and design collaboration while delivering production-quality, maintainable code.

**DESCRIPTION:**
Use these instructions when building React applications in TypeScript, independent of specific UI frameworks.

**INSTRUCTIONS:**
Create responsive, accessible React applications with TypeScript using strict configuration.

> **📋 Project Context:** For project-specific conventions, patterns, and technology stack details, see [PROJECT-CONTEXT.md](./PROJECT-CONTEXT.md). That file contains customizations specific to this codebase that override or extend these general guidelines.

**IMPORTANT!** Before you start a task, or make a new change, follow these _rules_:

- DO NOT change the visual design, theme styling, or composition of the UI once a `checkpoint`, and/or a component or pattern has been established. 

- DO NOT revert any "styling" (CSS/Layout) or "scripting" (TS/JSX) change intentionally by me.

- DO NOT make changes outside the scope of the requested feature, i.e., don't modify the main navigation when asked to build a data table.

- ALWAYS break out code into reusable components ready for export via ES module

- ALWAYS follow the [Component Architecture](./rules/component-architecture.md) folder-per-component pattern

- ALWAYS create SPEC.md before coding new features (see [Spec-Driven Development](./rules/spec-driven-development.md))

Include the following specifications:

1. **Accessibility & Performance**: Prioritize as first-class features. Follow [Web Interface Guidelines](./instructions/web-interface-guidelines.instructions.md):
   - Semantic HTML (`<button>`, `<a>`, `<label>`, `<form>`)
   - ARIA labels for icon-only buttons and form controls
   - Keyboard navigation and visible focus states
   - Screen reader support with `aria-live` for async updates
   - No paste-blocking or zoom-disabling
   - Images with explicit dimensions

2. **Adaptive Layout & Mobile-First UX**: Use CSS custom properties, Container Queries, and dynamic viewport units (`cqw`, `svh`) for responsive design. Implement touch-friendly interactions.

3. **TypeScript**: Use strict typing throughout. Define interfaces for component props. Avoid `any`.

4. **Component Structure**:
   - One component per file with PascalCase filename (`.tsx`)
   - Functional components with hooks
   - Explicit prop types via interfaces
   - `defaultProps` for optional props
   - Named exports or single default export

5. **State Management**: 
   - Use `useState` and `useContext` for local/shared state
   - Consider Context API for multi-level prop passing (2-3+ levels)
   - URL state for filters, tabs, pagination, expanded panels (use libraries like `nuqs`)

6. **Styling**: 
   - Use a consistent CSS-in-JS solution (Emotion, styled-components) or utility-based CSS
   - Create reusable design tokens (colors, typography, spacing)
   - Support light/dark modes; persist user preference
   - Avoid `transition: all`; list properties explicitly
   - Honor `prefers-reduced-motion`

7. **Forms & Inputs**:
   - Inputs require `<label>` or `aria-label`
   - Use correct `type` and `inputmode`
   - Include validation inline near fields
   - Disable submit button during requests; show loading state
   - Focus first error on submit
   - No paste-blocking; allow autocomplete

8. **Icons**: Use inline SVG or icon libraries (e.g., Lucide). No webfont icons.

9. **Images**: 
   - Explicit `width` and `height` to prevent layout shift
   - Lazy load below-fold images
   - Preload critical above-fold images

10. **Performance**:
    - Virtualize large lists (>50 items)
    - Avoid layout reads in render (`getBoundingClientRect`, `offsetHeight`)
    - Batch DOM operations
    - Use uncontrolled inputs where possible
    - Memoize expensive computations (`useMemo`, `useCallback`)

11. **Navigation & Deep Linking**: 
    - Use `<a>` or router `<Link>` (support Cmd/Ctrl+click)
    - Sync URL with component state
    - Support deep linking for all interactive features

12. **Destructive Actions**: Require confirmation modal or undo window. Never immediate.

13. **Testing & Documentation**: 
    - Unit tests for core components and utilities
    - Visual regression tests when possible
    - Storybook or equivalent for documentation
    - Accessibility audits (WCAG)

14. **Web Standards Compliance**: Follow all guidelines in [Web Interface Guidelines](./instructions/web-interface-guidelines.instructions.md) for forms, focus, animations, content handling, hydration, and copy.

---

## Available Agents

### 1. Component Scaffolding Agent
**Purpose**: Create new React components following project architecture patterns

**Skill**: [scaffold-component](./skills/scaffold-component/SKILL.md)

**Capabilities**:
- Generates component following folder-per-component architecture
- Creates complete file structure: `.tsx`, `.stories.tsx`, `.mdx`, `index.ts`
- Applies Spec-Driven Development workflow
- Auto-detects framework (Tailwind, MUI, Vanilla CSS)
- Ensures accessibility standards and TypeScript strict typing
- Initializes component specification before implementation

**Required Inputs**:
- Component name (PascalCase)
- Component category (if applicable to project structure)
- Framework/styling approach
- Custom props/features needed

**Example**:
```
Create a StatusBadge component using Tailwind CSS
Category: dataDisplay
Features: status variants (success, warning, error, info), size variants
```

---

### 2. Accessibility Audit Agent
**Purpose**: Verify components and pages meet WCAG accessibility standards

**Skill**: [accessibility-audit](./skills/accessibility-audit/SKILL.md)

**Capabilities**:
- Scans components for WCAG violations
- Verifies semantic HTML structure
- Validates ARIA attributes and roles
- Checks keyboard navigation and focus management
- Validates color contrast ratios
- Tests screen reader compatibility
- Generates remediation plan

**Required Inputs**:
- Component or page to audit
- WCAG level target (A, AA, AAA)
- Specific concerns (keyboard, screen reader, color)

**Example**:
```
Audit Modal component for WCAG 2.1 Level AA compliance
Focus on: keyboard trap prevention, focus management, ARIA roles
Generate remediation plan with priority levels
```

---

### 3. AI Integration Agent (Gemini)
**Purpose**: Implement Google Gemini API integration with streaming and error handling

**Skill**: [integrate-gemini](./skills/integrate-gemini/SKILL.md)

**Capabilities**:
- Implements secure API key handling
- Sets up streaming response patterns
- Handles rate limiting and network errors
- Creates proper loading and streaming UI states
- Ensures AI attribution and safety requirements
- Implements TypeScript type safety

**Required Inputs**:
- Integration type (chat, completion, embedding, etc.)
- UI requirements for loading/streaming
- Error handling preferences

**Example**:
```
Add Gemini chat integration to ChatInterface component
Requirements: streaming responses, loading states, error recovery
Include: retry logic, rate limit handling, proper attribution
```

---

### 4. Performance Optimization Agent
**Purpose**: Analyze and optimize React component performance

**Rule**: [web-performance](./rules/web-performance.md)

**Capabilities**:
- Analyzes bundle size and tree-shaking opportunities
- Identifies re-render issues and optimization opportunities
- Implements memoization patterns (`React.memo`, `useMemo`, `useCallback`)
- Optimizes large list rendering with virtualization
- Reviews lazy loading and code splitting strategies
- Eliminates request waterfalls
- Optimizes async dependencies

**Required Inputs**:
- Component or feature to optimize
- Performance metrics to target
- Specific bottlenecks observed
- Priority level (quick wins vs deep optimization)

**Example**:
```
Optimize DataTable component for 10,000+ rows
Metrics: < 100ms initial render, < 50ms scroll lag
Implement: virtualization, memoization, lazy loading
Priority: Apply bundle optimization and re-render prevention patterns
```

---

### 5. Component Refactor Agent
**Purpose**: Refactor existing components to follow standards and best practices

**Process**: Follows [Spec-Driven Development](./skills/workflows/sdd-workflow.md) workflow

**Capabilities**:
- Creates or updates component spec before refactoring
- Updates components to latest framework patterns
- Applies TypeScript best practices
- Applies performance optimization patterns
- Improves accessibility (ARIA labels, keyboard navigation)
- Optimizes performance (memoization, lazy loading)
- Maintains backward compatibility where possible
- Updates spec changelog with all changes

**Required Inputs**:
- Component to refactor
- Specific issues to address
- Breaking change tolerance (patch/minor/major)
- Target standards/patterns

**Example**:
```
Refactor UserProfile component to:
- Use latest React hooks patterns
- Add keyboard navigation
- Improve TypeScript types
- Apply memoization for expensive computations
Maintain backward compatibility (minor version bump)
```

---

### 6. Pull Request Agent
**Purpose**: Generate comprehensive PR descriptions from git commits

**Skill**: Use [create-pr.md](./skills/github-automation/create-pr.md)

**Capabilities**:
- Analyzes git commit history and diffs
- Generates structured PR descriptions
- Includes summary, changes, testing notes, and breaking changes
- References related issues and tickets
- Follows conventional commit standards
- Provides migration guidance for breaking changes

**Required Inputs**:
- Commit SHA or range
- PR type (feature, fix, refactor, documentation)
- Related issue numbers

**Example**:
```
Generate PR description for last commit
Include: summary of changes, files affected, testing approach
Type: Feature enhancement
Related: Issue #123
```

---

### 7. Specification Development Agent
**Purpose**: Create technical specifications before implementation

**Workflow**: [sdd-workflow.md](./skills/workflows/sdd-workflow.md)

**Capabilities**:
- Creates comprehensive component/feature specifications
- Documents goals, interface, technical implementation
- Defines accessibility and performance requirements
- Establishes implementation checklist
- Maintains changelog of spec updates
- Ensures alignment with [spec-driven-development.md](./rules/spec-driven-development.md)

**Required Inputs**:
- Component or feature name
- High-level requirements
- Technical constraints
- Accessibility requirements

**Example**:
```
Create specification for ImageGallery component
Requirements: responsive grid, lazy loading, keyboard navigation
Constraints: < 500kb initial bundle, WCAG AA compliance
Output: ImageGallery.spec.md following SDD template
```

---

### 8. Storybook Documentation Agent
**Purpose**: Generate comprehensive Storybook stories and documentation

**Instruction**: [storybook.instructions.md](./instructions/storybook.instructions.md)

**Capabilities**:
- Creates interactive stories with all component variants
- Generates MDX documentation with usage examples
- Adds accessibility annotations
- Includes controls for interactive testing
- Creates demo/helper components for complex interactions
- Documents props, events, and customization options

**Required Inputs**:
- Component name or file path
- Story scenarios to demonstrate
- Documentation structure preferences

**Example**:
```
Create Storybook documentation for Alert component
Scenarios: all severity levels, dismissible variants, with/without actions
Include: accessibility section, code examples, interactive controls
```

---

## Agent Selection Guide

| Task | Recommended Agent | Alternative |
|------|------------------|-------------|
| Create new component | Component Scaffolding | Specification Development |
| Write documentation | Storybook Documentation | - |
| Fix accessibility | Accessibility Audit | Component Refactor |
| Improve performance | Performance Optimization | Component Refactor |
| Add AI features | AI Integration (Gemini) | - |
| Refactor existing code | Component Refactor | Performance Optimization |
| Generate PR description | Pull Request | - |
| Create spec before coding | Specification Development | Component Scaffolding |
| Optimize bundle size | Performance Optimization | - |
| Reduce re-renders | Performance Optimization | Component Refactor |
| Add keyboard navigation | Accessibility Audit | Component Refactor |

---

## Development Workflow

### Standard Component Creation Process
1. **Specification Development Agent** → Create `[ComponentName].spec.md`
2. **Component Scaffolding Agent** → Generate component files following spec
3. **Accessibility Audit Agent** → Verify WCAG compliance
4. **Storybook Documentation Agent** → Create interactive documentation
5. **Pull Request Agent** → Generate PR description

### Performance Optimization Process
1. **Performance Optimization Agent** → Identify bottlenecks and apply optimizations
2. **Component Refactor Agent** → Refactor based on recommendations
3. **Accessibility Audit Agent** → Ensure optimizations don't break accessibility
4. **Pull Request Agent** → Document performance improvements

### Refactoring Process
1. **Specification Development Agent** → Update/create component spec
2. **Component Refactor Agent** → Implement refactoring following spec
3. **Accessibility Audit Agent** → Verify accessibility maintained
4. **Performance Optimization Agent** → Optimize if needed
5. **Pull Request Agent** → Generate PR with migration notes

---

## Repository Structure Reference

### Core Files
| File | Purpose | Agent Usage |
|------|---------|-------------|
| `AGENTS.md` | Agent guidelines and workflows | All agents reference for project standards |
| `README.md` | Repository overview and navigation | Context for all agents |

### Instructions
| File | Purpose | Agent Usage |
|------|---------|-------------|
| `instructions/development-standards.instructions.md` | Code style and quality standards | Component Scaffolding, Component Refactor |
| `instructions/web-interface-guidelines.instructions.md` | Accessibility and UX guidelines | All agents building UI components |
| `instructions/mui.instructions.md` | Material-UI (MUI v7+) specific patterns and theming | Component Scaffolding (when MUI detected), Component Refactor |
| `instructions/storybook.instructions.md` | Documentation standards | Storybook Documentation |
| `instructions/github-issue.instructions.md` | Issue creation guidelines | Pull Request, Specification Development |
| `instructions/github-release-notes.instructions.md` | Release documentation standards | Pull Request |

### Rules
| File | Purpose | Agent Usage |
|------|---------|-------------|
| `rules/component-architecture.md` | Folder-per-component pattern | Component Scaffolding, Component Refactor |
| `rules/spec-driven-development.md` | Spec-first development process | All agents creating new features |
| `rules/accessibility.md` | WCAG compliance guidelines | Accessibility Audit, Component Scaffolding |
| `rules/web-performance.md` | Performance optimization patterns | Performance Optimization |
| `rules/react-19-compiler.md` | React 19 optimization guidelines | Performance Optimization, Component Refactor |
| `rules/gemini.md` | Google Gemini AI integration rules, security, and UX patterns | AI Integration (Gemini) |
| `rules/mui.md` | Material-UI architecture patterns and constraints | Component Scaffolding (when MUI detected), Component Refactor |
| `rules/tailwind-v4.md` | Tailwind CSS v4 patterns | Component Scaffolding (when Tailwind detected) |
| `rules/three-js-react.md` | 3D graphics integration | Component Scaffolding (when Three.js detected) |
| `rules/supabase.md` | Backend integration patterns | AI Integration, Component Scaffolding |

### Skills
| Directory | Purpose | Agent Usage |
|-----------|---------|-------------|
| `skills/accessibility-audit/` | Accessibility verification checklist | Accessibility Audit |
| `skills/scaffold-component/` | Component scaffolding workflow | Component Scaffolding |
| `skills/integrate-gemini/` | AI integration patterns | AI Integration |
| `skills/workflows/` | Development workflows (SDD, setup) | All agents following SDD |
| `skills/github-automation/` | PR description template | Pull Request |

---

## Additional Resources

### Accessibility
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG22/quickref/
- **WAI-ARIA Authoring Practices**: https://www.w3.org/WAI/ARIA/apg/patterns/
- **APCA Contrast Calculator**: https://apcacontrast.com/

### React & TypeScript
- **React Documentation**: https://react.dev/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Vercel React Best Practices**: https://github.com/vercel/next.js/tree/canary/examples/with-react-best-practices

### Performance
- **Web.dev Performance**: https://web.dev/fast/
- **Core Web Vitals**: https://web.dev/vitals/
- **React DevTools Profiler**: https://react.dev/learn/react-developer-tools

### Testing & Documentation
- **Storybook Documentation**: https://storybook.js.org/docs/react/
- **Testing Library**: https://testing-library.com/docs/react-testing-library/intro/
- **Playwright**: https://playwright.dev/

### Standards & Patterns
- **MDN Web Docs**: https://developer.mozilla.org/
- **Can I Use**: https://caniuse.com/
- **Modern CSS Solutions**: https://moderncss.dev/

---

## Contributing to This Repository

To extend or modify this agents knowledge base:

### Adding New Rules
1. Create file in `rules/[topic-name].md`
2. Follow existing rule format (problem, solution, examples)
3. Reference from relevant agent in `AGENTS.md`
4. Update `README.md` with description

### Adding New Skills
1. Create directory `skills/[skill-name]/`
2. Add `SKILL.md` with frontmatter and documentation
3. Include examples and integration patterns
4. Reference from relevant agent in `AGENTS.md`

### Adding New Agents
1. Define clear **purpose** and **capabilities**
2. Specify required **inputs** and expected **outputs**
3. Provide concrete **examples** of usage
4. Add to **Agent Selection Guide** table
5. Update **Development Workflow** if applicable
6. Consider which **rules** and **skills** it should reference

### Updating Instructions
1. Edit files in `instructions/` directory
2. Keep guidelines concise and actionable
3. Use MUST/SHOULD/NEVER for clarity
4. Include examples where helpful
5. Update agent references if scope changes

---

**Last Updated**: February 7, 2026

