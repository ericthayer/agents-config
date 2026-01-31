# agents-config

A comprehensive knowledge base and skill library for building production-grade React applications with AI-powered tools and best practices.

[![npm version](https://img.shields.io/npm/v/agents-config.svg)](https://www.npmjs.com/package/agents-config)
[![npm downloads](https://img.shields.io/npm/dm/agents-config.svg)](https://www.npmjs.com/package/agents-config)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/ericthayer/agents-config.svg)](https://github.com/ericthayer/agents-config/stargazers)
[![Node.js](https://img.shields.io/node/v/agents-config.svg)](https://nodejs.org/)
[![CI](https://github.com/ericthayer/agents-config/actions/workflows/ci.yml/badge.svg)](https://github.com/ericthayer/agents-config/actions/workflows/ci.yml)

## Overview

This package provides curated guidelines, instructions, skills, and rules for developing React/TypeScript applications. It serves as a **single source of truth** for AI-powered development agents and human developers to ensure consistency, accessibility, and performance across all your projects.

## Installation

```bash
npm install agents-config --save-dev
```

After installation, run the interactive setup:

```bash
npx agents-init
```

This will:
1. Detect your project's framework, styling, and database
2. Ask which AI agents you use (Copilot, Claude, Cursor, Gemini, etc.)
3. Generate adapter files that reference the shared guidelines
4. Create a `.agents-project.json` for project-specific configuration

### CLI Options

```bash
npx agents-init              # Interactive mode
npx agents-init --dry-run    # Preview without writing files
npx agents-init --force      # Overwrite existing files
npx agents-init --help       # Show help
```

## Supported AI Agents

| Agent | Config File | Notes |
|-------|-------------|-------|
| **GitHub Copilot** | `.github/copilot-instructions.md` | VS Code, JetBrains |
| **Claude** | `CLAUDE.md` | Anthropic's Claude |
| **Cursor** | `.cursorrules` | Cursor IDE |
| **Gemini** | `.gemini/config.md` | Google Gemini |
| **Codex** | `.codex/AGENTS.md` | OpenAI Codex |
| **Windsurf** | `.windsurfrules` | Codeium Windsurf |

## IDE-Specific Caveats

### GitHub Copilot
- Reads from `.github/copilot-instructions.md`
- **Context limit**: Keep under 8KB for optimal performance
- Works in VS Code, JetBrains IDEs, and Neovim

### Claude (Anthropic)
- Reads `CLAUDE.md` from project root
- Supports rich markdown with tables and code blocks
- Excellent for multi-step reasoning tasks

### Cursor
- Uses `.cursorrules` (no file extension, markdown format)
- **Context limit**: Keep under 10KB
- Uses Claude under the hood, same reasoning capabilities

### Gemini (Google)
- Configuration at `.gemini/config.md`
- Handles long contexts well
- Strong multimodal capabilities (can reference images)

### Codex (OpenAI)
- Reads from `.codex/AGENTS.md` directory
- Works best with explicit, step-by-step instructions

### Windsurf (Codeium)
- Uses `.windsurfrules` in project root
- Fast autocomplete, respects existing code style

## Directory Structure

### 📋 `AGENTS.md`
Core guidelines for building React applications with AI-powered tools. Establishes the foundational principles and rules for development:
- Accessibility & performance as first-class features
- Component architecture patterns
- TypeScript strict typing
- State management strategies
- Form handling and validation
- Testing and documentation standards
- Web standards compliance

### 📂 `instructions/`
Detailed operational guidelines for specific development tasks:

- **`development-standards.instructions.md`** - General development standards and best practices
- **`github-issue.instructions.md`** - Process for creating and managing GitHub issues
- **`github-release-notes.instructions.md`** - Guidelines for writing release notes
- **`mui.instructions.md`** - Material-UI (MUI v7+) specific patterns, theming, and dark mode implementation
- **`storybook.instructions.md`** - Setting up and maintaining Storybook documentation
- **`web-interface-guidelines.instructions.md`** - Accessibility and UX standards for web interfaces

### 📂 `rules/`
Deep-dive technical rules and patterns for specific technologies and approaches:

- **`accessibility.md`** - Comprehensive accessibility guidelines and WCAG compliance
- **`component-architecture.md`** - Folder-per-component pattern and structure
- **`spec-driven-development.md`** - Creating technical specifications before implementation
- **`react-19-compiler.md`** - React 19 compiler integration and optimization
- **`gemini.md`** - Google Gemini AI integration rules, security constraints, and UX patterns
- **`mui.md`** - Material-UI architecture patterns, constraints, and anti-patterns
- **`supabase.md`** - Supabase backend integration patterns
- **`tailwind-v4.md`** - Tailwind CSS v4 usage and configuration
- **`three-js-react.md`** - Three.js integration with React
- **`web-performance.md`** - Performance optimization strategies

### 📂 `prompts/`
Pre-written prompt templates for AI-powered code generation and assistance:

- **`create-pr.prompt.md`** - Template for generating pull request descriptions
- **`scaffold-component.prompt.md`** - Template for component scaffolding requests

### 📂 `skills/`
Reusable skill modules for common development tasks. Each skill includes specific guidance and workflows:

#### **`accessibility-audit/`**
Verify components meet accessibility standards before marking features as "Done". Includes checklist for:
- Semantic HTML structure
- Focus management and keyboard navigation
- ARIA labels and form associations
- Dynamic content handling

#### **`scaffold-component/`**
Create new React components following project constraints. Implements:
- Spec-Driven Development workflow
- Framework detection (Tailwind, MUI, Vanilla)
- Component architecture patterns
- Framework-specific rules and conventions

#### **`integrate-gemini/`**
Implement Google Gemini API integration with:
- Secure API key handling
- Streaming response patterns
- Error handling and rate limiting
- Loading and streaming UI states
- Attribution and safety requirements

#### **`vercel-react-best-practices/`**
Performance optimization guidelines from Vercel Engineering. Covers 45+ rules across 8 categories:
- Eliminating waterfalls (async patterns)
- Bundle size optimization
- Server-side performance
- Client-side data fetching
- Rendering optimization
- Re-render prevention
- Event handling and refs
- JavaScript optimization

Includes subdirectories:
- **`rules/`** - Individual rule documents (45+ files organized by category)
- **`workflows/`** - Task-specific workflows:
  - `sdd-workflow.md` - Spec-driven development workflow
  - `setup-orchestration.md` - Project setup orchestration

## Key Principles

1. **Accessibility First** - WCAG compliance and inclusive design are non-negotiable
2. **Performance Matters** - Optimize for real-world conditions and user experience
3. **Spec-Driven** - Create specifications before implementation
4. **Component-Focused** - Folder-per-component architecture for maintainability
5. **Type Safety** - Strict TypeScript throughout
6. **Web Standards** - Follow semantic HTML and platform conventions

## Usage

### For AI Agents
Reference the appropriate skill or rule based on the development task:
- Use `accessibility-audit` before marking features complete
- Use `scaffold-component` when creating new components
- Use `integrate-gemini` for AI feature implementation
- Reference `vercel-react-best-practices` for performance optimization

### For Developers
- Start with [AGENTS.md](AGENTS.md) for core principles
- Reference relevant files in `rules/` and `instructions/` for specific guidance
- Use `prompts/` as templates for consistent communication
- Follow the workflows in `skills/` for common tasks

## Integration

This repository is designed to be used as:
- A knowledge base for AI coding assistants (GitHub Copilot, Claude, etc.)
- A reference guide for development teams
- A configuration source for agent-based development workflows
- A source of truth for coding standards and best practices

## Project Configuration

After running `npx agents-init`, a `.agents-project.json` file is created:

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
  "agents": ["copilot", "claude", "cursor"],
  "rules": {
    "include": ["accessibility", "component-architecture", "tailwind-v4"],
    "exclude": []
  },
  "overrides": {}
}
```

### Customization

Add project-specific overrides in the generated adapter files or in `.agents-project.json`:

```json
{
  "overrides": {
    "accessibility": {
      "minContrastRatio": 7.0
    },
    "component-architecture": {
      "maxComponentSize": 300
    }
  }
}
```

## Versioning

This package follows [Semantic Versioning](https://semver.org/):

- **Major** (1.0.0 → 2.0.0): Breaking changes to rules or agent configurations
- **Minor** (1.0.0 → 1.1.0): New rules, skills, or agent support added
- **Patch** (1.0.0 → 1.0.1): Bug fixes, typo corrections, clarifications

## Contributing

Contributions welcome! Please read the guidelines in [AGENTS.md](AGENTS.md) before submitting.

## License

MIT © Eric Thayer

---

**Last Updated:** January 31, 2025
