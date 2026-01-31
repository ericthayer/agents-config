---
name: accessibility-audit
description: Verify that a component or page meets the high accessibility standards defined in AGENTS.md.
---

# `accessibility-audit`

Use this skill before marking any feature as "Done". It helps you catch common accessibility issues that are strictly forbidden by [AGENTS.md](../../AGENTS.md).

## Checklist

### 1. Semantic Structure
- [ ] Are buttons used for actions (`<button>`) and links for navigation (`<a>`)?
- [ ] Do headings (`h1`-`h6`) follow a logical hierarchy? (Only one `h1` per page).
- [ ] Are lists (`ul`, `ol`) used for grouped items?

### 2. Interactive Elements
- [ ] **Focus**: Can you tab to every interactive element?
- [ ] **Visual Focus**: Does every element have a visible focus ring? (No `outline: none` without replacement).
- [ ] **Labels**: Do all icon-only buttons have `aria-label`?
- [ ] **Forms**: Do all inputs have a linked `<label>` or `aria-label`?

### 3. Images & Media
- [ ] Do all images have `alt` text (or `alt=""` if decorative)?
- [ ] do user-uploaded or AI-generated images have proper error states?
- [ ] Are explicit `width` and `height` attributes set to prevent layout shifts?

### 4. Dynamic Content
- [ ] **Loading**: Are loading states announced? (e.g., `aria-busy="true"` or `role="status"`).
- [ ] **Streaming**: Is the streaming text container using `aria-live="polite"`?
- [ ] **Updates**: Do dynamic updates trigger screen reader notifications?

### 5. Motion & Validation
- [ ] **Reduced Motion**: Is `prefers-reduced-motion` respected?
- [ ] **Validation**: Are form errors linked to inputs via `aria-describedby`?
- [ ] **Focus Management**: Is focus moved to the error summary or first error on submit failure?

## Failure Conditions
If any of the above are "No", the feature is **NOT** ready. Stop and fix it.
