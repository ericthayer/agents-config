---
description: Browser loading, interaction responsiveness, and layout stability.
---

# Web performance

Measure representative user journeys before optimizing. Record the device,
network, dataset, cache state, and production build used for comparison.
Prefer real-user evidence when available; lab results help diagnose causes.

## Loading and layout stability

- Aim for good Core Web Vitals at the 75th percentile: LCP at most 2.5 seconds,
  INP at most 200 milliseconds, and CLS at most 0.1. Set additional feature
  budgets in its spec where needed.
- Make critical content discoverable early. Do not lazy-load the likely LCP
  image or hide above-the-fold content with `content-visibility`.
- Use responsive image sources and appropriate compression. Set explicit image
  dimensions and reserve space for embeds, canvas, placeholders, and async content.
- Lazy-load below-the-fold media and defer nonessential modules using the
  project's supported loading mechanism.
- Preload only measured critical resources; excessive preloads compete with one
  another. Use preconnect only for important cross-origin connections.
- Subset fonts where practical, use a suitable `font-display` policy, and choose
  fallback metrics that reduce shifts. Avoid downloading unused font weights.

## Responsiveness

- Profile long tasks, especially work exceeding 50 milliseconds. Split expensive
  work into interruptible chunks or move suitable computation to a worker.
- Keep input handlers inexpensive. Avoid repeated derived calculations, cancel
  obsolete requests, and prevent stale responses from replacing newer results.
- Batch DOM reads separately from writes; avoid forced synchronous layout loops.
  Prefer CSS layout over measuring element positions in application code.
- For large collections, measure pagination, incremental rendering, or
  virtualization. Preserve focus, accessible names, and navigation when limiting
  rendered content; item count alone is not proof of a bottleneck.
- Prefer `transform` and `opacity` for animation and list transition properties
  explicitly. Honor reduced-motion preferences and pause unnecessary background work.

## Transfer and measurement

- Avoid independent-request waterfalls. Cache deliberately with correct
  invalidation and privacy boundaries; never share personalized responses through
  a public cache.
- Review dependency and asset cost before adding them. Use existing bundle
  tooling to identify unused code rather than adding speculative abstractions.
- Compare before and after with browser performance and network tools under
  realistic throttling. Verify that the change improves the measured bottleneck
  without sacrificing [accessibility](./accessibility.md) or correctness.
