---
description: Framework-neutral accessibility requirements for web applications.
---

# Accessibility

Target WCAG 2.2 Level AA unless the project requires a stricter standard. Use
native semantics first; custom widgets must implement the relevant
[WAI-ARIA interaction pattern](https://www.w3.org/WAI/ARIA/apg/patterns/).

## Structure and names

- Use buttons for actions, anchors with real destinations for navigation, and
  headings, landmarks, lists, and tables that reflect the content structure.
- Provide a skip link when pages contain repeated navigation.
- Give every control an accessible name. Prefer visible labels associated with
  inputs; placeholders are not labels. Name icon-only buttons by their action.
- Supply meaningful image alternatives; use `alt=""` for decorative images.
  Hide decorative icons from assistive technology, not focusable controls.
- Provide text or tabular alternatives for charts and canvas content, and
  equivalent semantic controls for essential graphical interactions.

## Keyboard and focus

- Make every action usable without a pointer. Follow native key behavior; use
  arrow-key navigation only where the widget pattern calls for it.
- Preserve logical focus order and a visible, unobscured focus indicator.
  Never remove outlines without an equivalent replacement.
- For modal dialogs, move focus inside, contain it while open, support dismissal,
  and restore focus to the trigger or a sensible successor. Do not trap focus in
  ordinary page content.
- Provide a non-drag alternative for drag interactions. Avoid hover-only help.

## Forms and updates

- Use appropriate `type`, `inputmode`, `name`, and `autocomplete` attributes.
  Allow paste, password managers, and browser zoom.
- Identify errors in text, associate them with fields using `aria-describedby`,
  and set `aria-invalid` when appropriate. On failed submission, focus the first
  invalid field or an error summary with links to the fields.
- Announce meaningful async status through `role="status"` or a polite live
  region. Avoid announcing every keystroke or streamed token. Reserve alerts for
  urgent information; `aria-busy` alone is not a progress message.

## Perception and adaptation

- Meet text contrast of 4.5:1, or 3:1 for large text, and applicable 3:1
  non-text contrast requirements for controls and graphical information.
  Do not convey status through color alone.
- Support text resizing to 200% and reflow at 320 CSS pixels without loss of
  information or functionality, except content that requires two dimensions.
- Meet the 24 by 24 CSS pixel target-size requirement or its WCAG exceptions;
  prefer at least 44 by 44 for primary touch targets.
- Honor `prefers-reduced-motion`, provide controls for ongoing automatic motion,
  and avoid flashing content. Provide captions and other required media alternatives.

Use the [accessibility audit](../skills/accessibility-audit/SKILL.md) to combine
automated findings with keyboard, zoom, contrast, and assistive-technology checks.
A passing automated scan alone does not establish compliance.
