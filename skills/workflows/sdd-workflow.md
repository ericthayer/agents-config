---
description: Template for creating a product and technical specification for a new component or feature.
---

# SPEC: [Component Name]

## 1. Goal & Intent
> Provide a brief description of what this component does and why we are building it.

## 2. Usage & Interface
> Show how this component will be called in code. Include prop definitions.

```tsx
<ComponentName 
  prop1="value"
  prop2={true}
/>
```

## 3. Technical Implementation
- **State Management**: (e.g., Local React state, Zustand, etc.)
- **Logic**: (e.g., Use cases for specific hooks like `useEffect` or `useMemo`)
- **Dependencies**: (e.g., Three.js, Lucide icons, etc.)

## 4. Visuals & Interaction
- **Aesthetics**: (e.g., "Glassmorphic," "High-contrast dark mode")
- **Animations**: (e.g., "Fades in using Framer Motion," "Parallax scrolling")
- **Container Queries**: How does it respond to its parent container?

## 5. Accessibility (WCAG 2.1)
- [ ] ARIA Labels defined
- [ ] Keyboard navigation (Tab index, Enter key)
- [ ] Reduced Motion compatibility
- [ ] Sufficient color contrast

## 6. Performance
- [ ] Soft asset limit (e.g., < 500kb textures)
- [ ] Component-level optimization (Render loops capped)
- [ ] Critical CSS inlined

## 7. Implementation Checklist
- [ ] Initial scaffolding
- [ ] Core logic / State
- [ ] Visual styling (Tailwind v4)
- [ ] Interaction / Animation
- [ ] Final Accessibility audit

## 8. Changelog
- **[TIMESTAMP]**: Initial spec creation.
