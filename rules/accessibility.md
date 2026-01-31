---
description: Accessibility standards for Three.js and React applications.
---

**OBJECTIVE:**
Building inclusive 3D web experiences that are accessible to keyboard users, screen reader users, and those with motion sensitivities.

**REASON:**
3D environments are inherently non-semantic. Without explicit effort, they are invisible to assistive technologies and can cause physical discomfort for users with vestibular disorders.

**DESCRIPTION:**
Guidelines for semantic canvas layering, focus management, and motion preference handling.

**INSTRUCTIONS:**

### Instant Perceptual Feedback
- **Critical CSS Inlining**: Inline the minimum CSS required to render a themed background and loading indicator directly in the `<head>` of `index.html`. This prevents the "blank white screen" during bundle download.
- **Pre-Hydration Status**: Provide a `role="status"` or `aria-live="polite"` container in the initial HTML structure. Use CSS `:empty` pseudo-classes to show a loading message that automatically disappears once React hydrates the root.
- **Theme-Aware Loading**: Ensure the initial "Critical" background color matches the user's system preference (light/dark) to avoid "flash of un-themed content" (FOUT/FOIT).

### Scene Accessibility
- **Canvas Metadata**: Always provide a descriptive `aria-label` or `title` on the `<canvas>` element. Use `role="img"` if the scene is purely visual, or `role="application"` if it is interactive.
- **Fallback Content**: Place a text description of the scene inside the `<canvas>` tag for older browsers or screen readers that don't support canvas metadata.

### Motion Control (CRITICAL)
- **Respect `@media (prefers-reduced-motion)`**: Use the `useMediaQuery` hook or CSS to detect if the user prefers reduced motion.
- **Auto-Pause/Slow**: If reduced motion is active, automatically pause or significantly slow down ambient animations (rotations, particle systems, floating effects).
- **Toggle Visibility**: Avoid rapid flashing or strobing effects in 3D scenes.

### Interaction & Focus
- **Standard UI Elements**: Use standard HTML `<button>` or `<a>` tags for interactions whenever possible, layered over the canvas.
- **Keyboard Navigation**: Ensure every interactive element in the 3D scene can be reached and activated via the `Tab` and `Enter/Space` keys.
- **Visual Focus States**: Never remove focus outlines (`outline: none`) without providing a clear, high-contrast alternative for navigated elements.

### Contrast & Legibility
- **Text over 3D**: Ensure text labels overlaying 3D scenes have sufficient contrast (WCAG AA 4.5:1). Use text-shadows or semi-transparent backgrounds to guarantee legibility over dynamic backgrounds.
