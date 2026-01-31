---
agent: agent
description: Create a React component named [ComponentName] that accepts props defined in [ComponentName]Props interface.
---
# Create Starter Component
**Read Instructions** from `./instructions/development-standards.instructions.md` before proceeding to see if there is anything specific to this prompt and helpful context when building React components.

**Development Process**: Follow [Spec-Driven Development](../workflows/sdd-workflow.md)
- Create component spec FIRST using the SDD template before generating code
- Spec location: `src/components/${category}/${componentName}/${componentName}.spec.md`
- Update spec changelog for any changes during development

**Alternative**: Use the `scaffold-component` skill from `../skills/scaffold-component/SKILL.md` for full SDD workflow integration

## Context Variables
- Current file: ${file}
- Working directory: ${fileDirname}
- Component name hint: ${fileBasenameNoExtension}

## Required Inputs
Don't assume, always ask for the following inputs before generating code:
1. **Component Name** (must start with "Cb", e.g., "CbButton", "CbDataGrid")
2. **MUI Base Component** (what MUI component to extend, e.g., "Button", "Card")
3. **Category** (one of: dataDisplay, inputs, navigation, surfaces, feedback, entitlements, templates)

## Generation Rules
- Create 4 files in `./src/components/${category}/${componentName}/`:
  - `${componentName}.tsx` - Main component
  - `${componentName}.stories.tsx` - Storybook stories (must include 'visual:check' tag)
  - `${componentName}.mdx` - Documentation
  - `index.ts` - Exports

## Templates
Reference files in `src/examples/StarterComponent/` for structure patterns:
- Use `CbStarter.tsx` pattern for component structure
- Use `CbStarter.stories.tsx` pattern for stories (includes visual:check tag)
- Use `CbStarter.mdx` pattern for documentation

## MDX Structure (CRITICAL)
**MUST include these wrappers** (see `.github/instructions/mdx.instructions.md`):
1. Import `Unstyled` from `@storybook/addon-docs/blocks`
2. Wrap all content in `<Unstyled>` → `<CSSTransition>` → `<div className="cbds-spec">` → `<ThemeProvider>`

```mdx
<Meta of={ComponentStories} />

<Unstyled>
  <CSSTransition in={true} appear timeout={300} classNames="fade">
    <div className="cbds-spec">
      <ThemeProvider theme={createCoBankTheme()}>
        <CssBaseline />
        {/* Content here */}
      </ThemeProvider>
    </div>
  </CSSTransition>
</Unstyled>
```