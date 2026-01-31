---
description: Standardized directory and file structure for React components in this workspace.
---

**OBJECTIVE:**
Maintaining a consistent, scalable, and discoverable component architecture.

**REASON:**
As the project grows, a standardized folder structure prevents "file sprawl" and makes it easier to locate styles, tests, and assets related to a specific component.

**DESCRIPTION:**
The "Folder-per-Component" pattern used throughout the `src/components` directory.

**INSTRUCTIONS:**

### Directory Structure
- **Component Folders**: Every major component should live in its own folder under `src/components/`.
- **Primary File**: The main component file must be named `ComponentName.tsx` (PascalCase).
- **Associated Files**: Styles, local assets, and sub-components should reside within the same component folder.

Example:
```
src/components/Hero/
├── Hero.tsx
├── Hero.css (if not using Tailwind)
└── HeroBackground.tsx (local child component)
```

### Exports
- **Named Exports**: Prefer named exports for components to ensure better IDE support and tree-shaking.
- **Clear Boundaries**: Avoid importing local child components (e.g., `HeroBackground`) from outside their parent's folder. If a component is reused elsewhere, move it to the root of `src/components/`.

### Prop Types
- **Interfaces over Types**: Use `interface` for component props to allow for better extensibility and cleaner error messages.
