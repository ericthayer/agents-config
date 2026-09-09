---
name: accessibility-audit
description: Audit web components and pages for semantic, keyboard, visual, and assistive-technology accessibility.
---

# Accessibility audit

Use before delivering a UI feature or when investigating an accessibility issue.
Follow [application guidance](../../AGENTS.md),
[accessibility requirements](../../rules/accessibility.md), and
[web interface guidelines](../../instructions/web-interface-guidelines.instructions.md).

## Scope

Identify the page or component, relevant states, supported browsers, and target
standard (default WCAG 2.2 AA). Include loading, empty, validation, error, and
modal states, not just the initial screen.

## Procedure

1. Inspect rendered semantics: headings, landmarks, lists, tables, button/link
   roles, form labels, accessible names, and image alternatives. Compare names
   with visible labels; decorative content must not create noise.
2. Navigate without a pointer. Check logical order, visible unobscured focus,
   activation keys, widget-specific arrow keys, dialog dismissal and focus return,
   skip navigation, and alternatives to dragging.
3. Submit invalid forms and trigger async updates. Confirm associated error
   messages, useful focus placement, retained input, and understandable status
   announcements without repeated or excessive speech.
4. Check contrast and non-color status cues in every supported theme. Exercise
   text resizing, 320 CSS pixel reflow, long content, touch targets, and reduced
   motion. Inspect media captions and equivalent text where applicable.
5. Run the project's existing automated accessibility checks, then inspect the
   accessibility tree and exercise key journeys with a screen reader where
   available. Automation does not replace manual interaction.
6. Fix confirmed issues within scope and repeat the affected journey. Keep
   unresolved findings and unavailable checks visible in the handoff.

## Output

For each finding, record the file or UI location, reproduction steps, affected
users, expected behavior, severity, and a concrete correction. Link findings to
the relevant requirement when known; do not guess a success criterion.

Summarize coverage separately: tested states, browser/assistive technology,
automated results, manual observations, and unverified areas. Mark a requirement
as not applicable only with a reason. Do not report a passing audit while known
failures remain or imply full compliance from a clean automated scan.
