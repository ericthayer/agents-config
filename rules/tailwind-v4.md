---
description: Best practices for using Tailwind CSS v4 in a performance-oriented React environment.
---

**OBJECTIVE:**
Leveraging the CSS-first architecture of Tailwind CSS v4 to build high-performance, maintainable UIs.

**REASON:**
Tailwind v4 moves configuration into CSS and utilizes a high-performance engine (Lightning CSS), requiring a shift in how themes and utilities are managed compared to v3.

**DESCRIPTION:**
Guidelines for using Tailwind v4's `@theme` block, CSS variables, and modern engine features while avoiding legacy configuration patterns.

**INSTRUCTIONS:**

### CSS-First Configuration
- **Use `@theme` in CSS**: Define all theme extensions (colors, fonts, spacing) inside the `@theme` block in your main CSS file, not in a JS configuration file.
- **Prefer CSS Variables**: Use CSS custom properties defined in `@theme`. Reference them as `var(--name)` when needed in custom styles.
- **Avoid `tailwind.config.js`**: Do not create or use a `tailwind.config.js` file unless strictly necessary for legacy plugin compatibility.

### Performance & Engine
- **Leverage Lightning CSS**: Be aware that Tailwind v4 uses Lightning CSS for ultra-fast builds. Avoid complex PostCSS plugins that might slow down the pipeline.
- **Built-in Modern Features**: Use modern CSS features like `@import "tailwindcss"` and direct variable references which are optimized by the v4 engine.

### Implementation Patterns
- **Prioritize Container Queries**: Use `@container` queries for component-level styling and layout before resorting to viewport-based media queries whenever a component's layout depends on its parent's width.
- **Dual Color Palettes**: Always define and implement both **light and dark** color mode palettes within the `@theme` block. Use native CSS color-scheme support and variables to ensure seamless transitions.
- **Utility First**: Maintain the utility-first mindset, but use standard CSS for complex layouts that utilities cannot cleanly handle.
- **Modern Color Palettes**: Use the expanded Oklch color space support provided by v4 for better perceptual uniformity in gradients and UI elements.
