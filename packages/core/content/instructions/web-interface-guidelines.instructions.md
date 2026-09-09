---
description: Framework-neutral requirements for accessible, responsive web interfaces.
applyTo: '**'
---

# Web interface guidelines

Preserve established visual design and use existing tokens and components.
Apply the [accessibility rules](../rules/accessibility.md) and
[performance rules](../rules/web-performance.md) alongside these interaction checks.

## Native interaction

- MUST use `<button>` for actions and `<a href="...">` for navigation. Routing
  abstractions must preserve link semantics and modified-click behavior.
- MUST provide accessible names, visible focus, and keyboard operation.
  Prefer native controls instead of recreating their behavior with generic elements.
- MUST use modal focus management only for actual modal interactions, returning
  focus on dismissal. Keep focused content visible beneath sticky elements.
- MUST offer an alternative to dragging and access to tooltip content without
  requiring hover. Do not disable browser zoom.
- SHOULD provide generous touch targets and avoid unexpected autofocus on mobile.

## Forms and feedback

- MUST associate visible labels with controls where possible. Use appropriate
  `name`, `type`, `inputmode`, and `autocomplete` attributes.
- NEVER block paste or password-manager input. Do not trim or transform values
  such as passwords where whitespace may be meaningful.
- MUST preserve entered values and focus during updates. Server-rendered pages
  must not lose pre-initialization input when client code attaches.
- MUST validate without preventing ordinary typing. On failed submission,
  associate inline errors with fields and focus an error summary or first error.
- MUST preserve native form submission behavior. Multiline inputs retain Enter
  for newlines unless an explicit, accessible alternative is provided.
- MUST prevent duplicate submissions during requests and expose progress without
  replacing the action's accessible name with an unlabeled spinner.
- MUST provide recoverable failure states and announce meaningful async updates
  through a suitable live region. Do not announce every incremental text update.
- MUST confirm destructive operations or provide a reliable undo window.
  Protect meaningful unsaved edits when navigating away.

## Navigation and state

- SHOULD encode shareable filters, tabs, and pagination in the URL, excluding
  transient details and sensitive values.
- MUST support direct loading and browser Back/Forward for URL-backed state.
  Manage page title, focus, and scroll appropriately after navigation.
- MUST define loading, empty, sparse, dense, error, and success states, including
  clear recovery actions rather than dead ends.

## Layout, content, and motion

- MUST support narrow viewports, zoom, long content, and translated text without
  hiding essential information. Fix overflow causes rather than masking them.
- SHOULD use flex/grid, relative sizing, container queries, and suitable viewport
  units where supported. Respect device safe areas for edge-aligned controls.
- MUST provide media alternatives and explicit image dimensions. Keep skeleton
  geometry close to final content to prevent layout shifts.
- MUST communicate status with more than color and meet WCAG contrast requirements.
  Format dates, numbers, and currencies with locale-aware APIs.
- MUST honor reduced-motion preferences. Avoid `transition: all`; animate only
  intentional properties and favor `transform` and `opacity`.
- SHOULD keep motion interruptible and use it to explain state changes.
- MUST preserve the project's theme behavior. Where themes exist, align native
  controls using `color-scheme` and ensure every supported theme remains legible.

## Review output

Report concrete findings as `file:line - issue; suggested correction`. Separate
observed failures from risks requiring browser inspection. Include affected
keyboard, touch, or assistive-technology behavior; do not claim compliance from
source inspection alone.
