# Pull Request Description Template

> Use this file as a template for PR descriptions generated from commits.
> Copy the content below and paste it into your GitHub PR body.

---

## Summary

Comprehensive project restructuring moving all source code into `src/` directory, establishing a complete AI guidance framework in `.github/` for consistent development standards, and implementing testing infrastructure with Vitest and React Testing Library.

## Changes

### 1. Project Restructuring (`src/` Directory Migration)
- **Moved**: All source files (components, services, utils, contexts, App.tsx, types.ts, constants.tsx, index.tsx, index.css) into `src/` directory
- **Updated**: Configuration files (index.html, tsconfig.json, vite.config.ts, vitest.config.ts) to reference new src/ paths
- **Fixed**: All import paths throughout codebase to resolve correctly from new locations
- **Result**: Standard project structure following React/TypeScript conventions

### 2. AI Guidance System (`.agent/` Framework)
Complete AI development framework with three layers:

#### Instructions (Scope-Specific Guidelines)
- `development-standards.instructions.md` - TypeScript/React standards, Airbnb style guide compliance, APCA contrast requirements
- `web-interface-guidelines.instructions.md` - MUST/SHOULD/NEVER UI rules, accessibility requirements (24px hit targets, keyboard support)
- `github-issue.instructions.md` - Issue creation standards
- `github-release-notes.instructions.md` - Release documentation format
- `storybook.instructions.md` - Storybook usage patterns

#### Rules (Architectural Principles)
- `component-architecture.md` - Folder-per-Component pattern with named exports
- `spec-driven-development.md` - SDD methodology with SPEC.md template requirement
- `supabase.md` - Database, auth, and RLS best practices
- `accessibility.md` - WCAG compliance guidelines
- `react-19-compiler.md` - React 19 compiler optimization rules
- `tailwind-v4.md` - Tailwind CSS v4 setup patterns
- `three-js-react.md` - Three.js integration patterns
- `web-performance.md` - Performance optimization guidelines

#### Skills (Executable Workflows)
- `scaffold-component/` - Component creation workflow with SDD process
- `accessibility-audit/` - Accessibility testing and compliance audit
- `integrate-gemini/` - Google Gemini API integration patterns

#### Prompts (Reusable Templates)
- `create-pr.prompt.md` - PR creation from commit template
- `scaffold-component.prompt.md` - Component scaffolding prompt

### 3. Testing Infrastructure
- **Created**: `vitest.config.ts` with jsdom environment and jest-dom setup
- **Added**: `src/tests/setup.ts` for test initialization
- **Created**: Example tests:
  - `src/tests/Button.test.tsx` - Component testing pattern
  - `src/tests/geminiService.test.ts` - Service mocking pattern
- **Updated**: `package.json` with test scripts (test, test:ui, test:coverage)
- **Updated**: `tsconfig.json` with vitest and @testing-library/jest-dom types

### 4. Enhanced Documentation
- **Updated**: `.github/copilot-instructions.md` with src/ path references
- **Created**: `AGENTS.md` - AI agent contribution guidelines
- **Created**: `DEPLOYMENT.md` - Complete deployment guide (Vercel, Netlify, Supabase)
- **Created**: `IMPLEMENTATION_SUMMARY.md` - Feature implementation details
- **Updated**: `README.md` with project structure, testing, and deployment sections

### 5. Database & Authentication
- **Created**: `supabase/migrations/001_auth_and_rls.sql`
  - User roles table (publisher/reader) with approval workflow
  - RLS policies for case_studies, assets tables
  - Storage bucket policies for authenticated access
  - OAuth provider setup instructions

### 6. GitHub Utilities
- **Created**: `./prompts/create-pr.prompt.md` - PR creation automation template

## Type of Change
- [x] Refactoring (project structure and organization)
- [x] Documentation update (comprehensive guides added)
- [x] New feature (testing infrastructure, AI guidance system)
- [x] Build/infrastructure change (TypeScript config updates)

## Testing
- ✅ Build succeeds: `npm run build` produces valid production bundle
- ✅ Dev server runs: `npm run dev` starts without errors
- ✅ Tests configured: `npm test` runs Vitest in watch mode
- ✅ TypeScript validation: All imports resolve correctly, no type errors
- ✅ Manual verification: Project structure follows React/TypeScript conventions

## Benefits
1. **Standard Structure**: Follows industry best practices for React projects
2. **AI-Assisted Development**: Complete guidance system for consistent code quality
3. **Testing Ready**: Infrastructure in place for comprehensive test coverage
4. **Documentation**: Extensive guides for development, deployment, and AI collaboration
5. **Maintainability**: Clear folder organization and import paths

## Checklist
- [x] Code follows project style guidelines
- [x] All documentation updated with new paths
- [x] Build succeeds without errors
- [x] TypeScript compilation passes
- [x] Test infrastructure configured and verified
- [x] No breaking changes to existing functionality
- [x] All imports resolve correctly
