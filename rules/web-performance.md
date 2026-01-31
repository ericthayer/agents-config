---
trigger: always_on
description: Web performance and Core Web Vitals optimization guidelines.
---

**OBJECTIVE:**
Ensuring fast load times, smooth interactions, and stable layouts for both 3D and standard web content.

**REASON:**
Large 3D assets can easily degrade performance, leading to poor Core Web Vitals scores and high bounce rates, especially on mobile devices.

**DESCRIPTION:**
Rules for asset budgeting, layout stability, and resource prioritization.

**INSTRUCTIONS:**

### Core Web Vitals
- **Prevent Layout Shifts (CLS)**: Always set explicit `width` and `height` dimensions (or aspect ratio) on the canvas container to reserve space before the scene initializes.
- **Optimize LCP**: Identify the largest above-fold element (often a hero texture or font), and utilize the CSS property, [content visibility](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/content-visibility) to help with more performant rendering. Use `<link rel="preload">` for these critical assets and **Inline Critical CSS** in the HTML `<head>` for a near-instant first paint.

### Asset Budgeting
- **Texture Compression**: Use `.webp` or `.ktx2` for textures. Avoid large 4K textures unless viewed up close; 1K or 2K is usually sufficient for web.
- **Geometry Optimization**: Use Draco compression for GLTF models. Aim for a total initial bundle size (including models) under 5MB for the primary interactive state.
- **Lazy Loading**: Use dynamic imports `React.lazy()` or the `useLoader` cleanup mechanism for non-critical assets (e.g., objects in future scenes or footer elements).

### Rendering Performance
- **Font Display**: Use `font-display: swap` for all web fonts to ensure text is visible while the custom font (and 3D scene) loads.
- **Avoid Long Tasks**: Ensure that Three.js initialization or heavy computations don't block the main thread for more than 50ms. Use `setTimeout` or `requestIdleCallback` to chunk initialization if necessary.
- **Asset Caching**: Leverage service workers or strong Cache-Control headers for 3D assets that don't change frequently.