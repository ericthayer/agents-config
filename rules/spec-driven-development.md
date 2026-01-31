---
description: Methodology for Spec-Driven Development (SDD) based on the "Spec Kit" principles.
---

**OBJECTIVE:**
Ensuring high-quality implementation by defining technical requirements and intent in a structured "Spec" before writing any code.

**REASON:**
SDD eliminates "vibe coding" (vague prompting) by providing the AI with a clear technical roadmap, reducing context loss and ensuring alignment with project standards.

**DESCRIPTION:**
The SDD process involves three distinct phases: Spec Drafting, Implementation, and Verification. The Spec serves as the "source of truth."

**INSTRUCTIONS:**

### 1. Spec Initializing
- **Before coding starts**, create a `SPEC.md` or equivalent in the component/feature folder.
- **Spec Content**:
    - **Intent**: What problem are we solving?
    - **Usage**: How will the component be used (code examples)?
    - **Architecture**: Tech stack, state management, and data flow.
    - **Accessibility**: ARIA roles, focus management, reduced motion.
    - **Performance**: Soft limits for assets, rendering loop optimizations.

### 2. Implementation Phase
- **Pure Implementation**: The implementation phase MUST follow the Spec precisely. If the Spec is missing details, the Spec should be updated first.
- **Incremental Builds**: Build in logical steps (foundation -> features -> polish).
- **Checkpoints**: Use checkpoints after each major component or feature to verify against the Spec.

### 3. Review & Refinement
- **Verification**: Cross-reference the final implementation against the "Implementation Checklist" in the Spec.
- **Zero Vibe Rule**: If the code "feels" right but doesn't meet a spec requirement, it is technically a failure.

### 4. Spec Evolution
- **Living Document**: The spec is not static. If discoveries are made during OR after execution that change the architecture, update the Spec BEFORE continuing with the code, and/or AFTER final updates are made. Make sure to refactor our spec anytime an additional change or feature is added to the component.
- **Add Changelog**: Add small and concise summary and timestamp each time the spec changes.
