---
name: scaffold-component
description: Create a new React component following project constraints (Tailwind, MUI, or Vanilla).
---

# `scaffold-component` (Global Fallback)

Use this skill when the user asks to "create a component". This skill is designed to be framework-agnostic and will adapt to the current project's stack. Adhere to the following process and development philosophy and approach.

## Development Process

**Philosophy & Approach**

- **Spec-Driven Development (SDD)**: Always start by creating a technical specification using the [sdd-workflow](../workflows/sdd-workflow.md) template. Adhere to the `spec-driven-development.md` global rule.
  - Create the spec as `[ComponentName].spec.md` within the component folder before starting implementation.
  - **Living Document**: Refactor the spec for every new feature or discovery and maintain a timestamped **Changelog** at the bottom.
- **Component Architecture**: Follow the `component-architecture.md` global rule (Folder-per-Component).

## Usage
1.  **Draft the Spec**: Follow the [sdd-workflow](../workflows/sdd-workflow.md) template and create `src/components/[ComponentName]/[ComponentName].spec.md`. Initialize the **Changelog** section.
2.  **Detect Framework & Stack**: Check `package.json` for dependencies (e.g., `@mui/material`, `tailwindcss`, `react` version). Adhere to project-specific rules like `three-js-react.md` if applicable.
3.  **Implement & Update**: Follow the spec strictly. If architecture changes during build, update the spec and the changelog **before** proceeding.

## Framework-Specific Rules

### If MUI is detected:
- Use MUI components (`Box`, `Typography`, `Grid`).
- Use the `sx` prop for custom styling.
- Use `Grid` (v2) if on MUI v6+.
- Follow [mui.md](../../rules/mui.md) architecture patterns.

### If Tailwind CSS is detected:
- Use standard HTML tags (`div`, `header`, `main`).
- Use `className` with Tailwind utility classes.
- Follow mobile-first responsive patterns (e.g., `sm:`, `md:`, `lg:`).
- Follow [tailwind-v4.md](../../rules/tailwind-v4.md) patterns.

### Default (Vanilla React/CSS):
- Use standard HTML tags.
- Use CSS Modules or standard CSS
- Use CSS Custom Properties to build a light/dark theme.

## Base Template

```tsx
import React from 'react';

/**
 * Props for the [ComponentName] component.
 */
export interface [ComponentName]Props {
  /** ARIA label for accessibility */
  'aria-label'?: string;
  title?: string;
  children?: React.ReactNode;
}

/**
 * [Brief description of the component]
 */
export const [ComponentName]: React.FC<[ComponentName]Props> = ({
  'aria-label': ariaLabel,
  title,
  children,
  ...props
}) => {
  // IMPLEMENTATION: Adapt based on detected framework (MUI vs Tailwind)
  return (
    <div className="[component-name-kebab-case]" {...props}>
      {title && <h2>{title}</h2>}
      <div role="region" aria-label={ariaLabel || "[Default Label]"}>
        {children || <p>New component: [ComponentName]</p>}
      </div>
    </div>
  );
};
```
