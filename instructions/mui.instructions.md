# Material-UI (MUI) Coding Instructions

**INSTRUCTIONS:**
Create responsive React applications using Material-UI (MUI v7.3+) and TypeScript with strict type safety.

Include the following specifications:

1. **Accessibility & Performance**: Prioritize as first-class features. Follow [Web Interface Guidelines](./web-interface-guidelines.instructions.md)—semantic HTML, ARIA labels, keyboard navigation, focus states, and screen reader support.

2. **Adaptive Layout & Mobile-First UX**: Use Container Queries, dynamic viewport units (`cqw`, `dvh`), and `clamp()` for responsive spacing and visual hierarchy. Test on mobile-first.

3. **Grid System**: Use [MUI Grid v2 syntax](https://mui.com/material-ui/react-grid/).

4. **Modern CSS & Progressive Enhancement**: Apply [CSS Wrapped 2025](https://chrome.dev/css-wrapped-2025/) principles.

5. **Theming**: 
   - Use MUI's theme provider with `cssVariables` enabled
   - Support light/dark modes via [CSS Theme Variables](https://mui.com/material-ui/customization/css-theme-variables/usage/#light-and-dark-modes)
   - Respect system preference (`prefers-color-scheme`) and persist user choice to `localStorage`
   - Avoid color-mode flicker per [MUI docs](https://mui.com/material-ui/customization/dark-mode/#dark-mode-flicker)

6. **Typography & Design Tokens**: Create elegant color palettes, typography scales, and spacing systems. Follow copy guidelines (curly quotes, ellipsis `…`, non-breaking spaces).

7. **Icons**: Use `@mui/icons-material`—no webfont icons.

8. **Dark Mode Toggle**: Implement [MUI's prescribed method](https://mui.com/material-ui/customization/dark-mode/#toggling-color-mode) with smooth transitions.

9. **Component Architecture**: Extend MUI base components with TypeScript. Use PascalCase for filenames (`.tsx`). One component per file. Prefer functional components with hooks.

10. **Testing & Documentation**: Create Storybook documentation and visual regression tests (Playwright/Chromatic when possible).

11. **Web Standards Compliance**: Ensure forms, inputs, focus states, and interactive elements meet standards in the Web Interface Guidelines:
    - Form inputs require labels and proper `type`/`inputmode`
    - Icon-only buttons need `aria-label`
    - Focus-visible states required (no `outline-none` without replacement)
    - Semantic HTML (`<button>`, `<a>`, `<label>`) before ARIA
    - Skip link for main content; heading hierarchy
    - No paste-blocking; no zoom-disabling viewport settings
    - Images need `width`/`height` to prevent CLS
    - Virtualize large lists (>50 items)
    - URL state for filters, tabs, pagination, expanded panels
    - Destructive actions need confirmation
    - Honor `prefers-reduced-motion`
    - Animations use `transform`/`opacity` only; no `transition: all`
    
    **NOTE:**
    - Use MUI's theme provider with `cssVariables` enabled
    - Support light/dark modes via [CSS Theme Variables](https://mui.com/material-ui/customization/css-theme-variables/usage/#light-and-dark-modes)
    - Respect system preference (`prefers-color-scheme`) and persist user choice to `localStorage`
    - Avoid color-mode flicker per [MUI docs](https://mui.com/material-ui/customization/dark-mode/#dark-mode-flicker)
