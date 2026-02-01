---
agent: agent
description: Create a React component following project conventions and accessibility standards.
---
# Scaffold Component

**Read Instructions** from [Development Standards](../instructions/development-standards.instructions.md) before proceeding for helpful context when building React components.

**Development Process**: Follow [Spec-Driven Development](../skills/workflows/sdd-workflow.md)
- Create component spec FIRST before generating code
- Spec location: `src/components/${category}/${componentName}/${componentName}.spec.md`
- Update spec changelog for any changes during development

**Alternative**: Use the `scaffold-component` skill from `../skills/scaffold-component/SKILL.md` for full SDD workflow integration

## Context Variables
- Current file: ${file}
- Working directory: ${fileDirname}
- Component name hint: ${fileBasenameNoExtension}

## Required Inputs
Don't assume, always ask for the following inputs before generating code:
1. **Component Name** (PascalCase, e.g., "Button", "DataGrid", "UserCard")
2. **Base Component** (what to extend if any, e.g., MUI Button, native button)
3. **Category** (e.g., ui, layout, forms, feedback, navigation)

## Generation Rules
- Create files in `./src/components/${category}/${componentName}/`:
  - `${componentName}.tsx` - Main component
  - `${componentName}.test.tsx` - Unit tests
  - `${componentName}.stories.tsx` - Storybook stories (if Storybook is used)
  - `index.ts` - Exports

## Component Structure
```tsx
// ${componentName}.tsx
import type { ComponentProps } from 'react';

export interface ${componentName}Props {
  // Define props with JSDoc comments
}

export function ${componentName}({ ...props }: ${componentName}Props) {
  return (
    // Semantic HTML with accessibility
  );
}
```

## Accessibility Requirements
- Use semantic HTML elements
- Include ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen reader