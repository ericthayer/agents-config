---
applyTo: '**/*.md, **/*.mdx'
---

# GitHub Issue Creation Instructions

Use these instructions to create well-structured, comprehensive GitHub issues for the DevLog application.

## Issue Structure Template

Every GitHub issue should follow this standardized structure:

```markdown
# [Clear, Descriptive Title - No Emojis]

## Problem Description

[2-3 paragraph overview of the issue, providing context and impact]

## Current Behavior ❌

[Describe what's currently happening]

### [Subsection 1]
- **Issue point**: Description
- **Issue point**: Description

### [Subsection 2]
- Bullet points describing specific problems
- Include technical details and symptoms

## Expected Behavior ✅

[Describe the desired outcome]

### [Subsection 1]
- **Expected point**: Description
- **Expected point**: Description

## Technical Context

[Provide implementation details and technical background]

### Current Implementation Issues

1. **[Issue Category]**:
```typescript
// Code example showing current problematic implementation
// Include file path and line numbers as comments
```

2. **[Another Issue]**:
```typescript
// More code examples
```

## Proposed Solution

[Detailed explanation of how to fix the issue]

### 1. [Solution Step 1]
```typescript
// Code example showing proposed solution
// Include comments explaining changes
```

### 2. [Solution Step 2]
```typescript
// More solution code
```

## Testing Requirements

### Manual Testing
- [ ] Test case 1
- [ ] Test case 2
- [ ] Test case 3

### Visual Regression Testing
- [ ] Update Playwright snapshots
- [ ] Test in light mode
- [ ] Test in dark mode

### Accessibility Testing
- [ ] WCAG compliance check
- [ ] Screen reader testing
- [ ] Keyboard navigation

## Acceptance Criteria

- [ ] **Criterion 1**: Description
- [ ] **Criterion 2**: Description
- [ ] **Criterion 3**: Description
- [ ] **Documentation**: Updated examples and best practices

## Priority

**[High/Medium/Low]** - [Brief justification]

## Labels

`label1`, `label2`, `label3`, `component-name`, `priority-level`

## Related Issues

- Issue/PR #123
- Related feature work
- Migration tasks

## Additional Notes

[Any additional context, considerations, or future work]

---

**Environment:**
- MUI v7 with colorSchemes API
- React 18.3+
- TypeScript 5+
- [Other relevant tools/versions]

**Related Files:**
- `path/to/file.ts` (lines X-Y) - Description
- `path/to/another/file.tsx` - Description
```

## Formatting Guidelines

### Headings
- **H1 (`#`)**: Issue title only - NO EMOJIS
- **H2 (`##`)**: Major sections (Problem Description, Current Behavior, etc.)
- **H3 (`###`)**: Subsections within major sections

### Emojis Usage
- **Section headers**: Use ❌ for "Current Behavior" and ✅ for "Expected Behavior" only
- **Bullet lists**: Optional emojis for emphasis (⚡, 🚀, 💾, 🎯, 🛠️, etc.)
- **Title**: NEVER use emojis in the H1 title

### Code Blocks
- Always specify language: ```typescript```, ```tsx```, ```bash```
- Include file paths in comments: `// src/components/MyComponent.tsx`
- Include line numbers when referencing existing code: `// Line 45-60`
- Add explanatory comments: `// ❌ Wrong` or `// ✅ Correct`

### Lists and Checkboxes
- Use `- [ ]` for unchecked items in testing and acceptance criteria
- Use `- [x]` for completed items (if updating existing issue)
- Use bullet lists (`-`) for descriptions and problem statements
- Use numbered lists (`1.`) for sequential steps

### Emphasis
- **Bold** for key terms, component names, and important points
- `Inline code` for file paths, function names, props, and code references
- _Italic_ sparingly for slight emphasis

## Content Guidelines

### Problem Description
- Provide context: What component/feature is affected?
- Explain impact: How does this affect users or developers?
- Keep it concise: 2-3 paragraphs maximum

### Current Behavior
- Be specific about symptoms
- Include visual descriptions for UI issues
- Group related issues under subsections
- Use bullet points for clarity

### Expected Behavior
- Describe the ideal state
- Match structure to Current Behavior for easy comparison
- Include user experience improvements

### Technical Context
- Show current implementation code
- Reference specific files and line numbers
- Explain why current approach is problematic
- Include links to MUI documentation when relevant

### Proposed Solution
- Provide concrete code examples
- Break down into numbered steps
- Show complete implementations, not fragments
- Include comments explaining changes

### Testing Requirements
- Cover manual testing scenarios
- Include visual regression testing needs
- Address accessibility testing
- Add integration or performance testing if relevant

### Acceptance Criteria
- Make criteria specific and measurable
- Use checkboxes for tracking
- Include non-functional requirements (performance, accessibility)
- Always include documentation requirement

## Issue Types

### Bug Report
Focus on:
- What's broken
- Steps to reproduce
- Current vs expected behavior
- Impact on users

### Enhancement Request
Focus on:
- Current limitations
- Benefits of enhancement
- Performance improvements
- Developer experience improvements

### Refactor/Technical Debt
Focus on:
- Why current implementation is problematic
- Technical benefits of refactor
- Migration strategy
- Breaking changes

## Priority Levels

### High Priority
- Breaks core functionality
- Security issues
- Significant user experience problems
- Blocks other development work

### Medium Priority
- Visual inconsistencies
- Performance improvements
- Developer experience issues
- Non-critical bugs

### Low Priority
- Nice-to-have features
- Minor optimizations
- Documentation improvements
- Cosmetic issues

## Label Categories

### Type Labels
- `bug` - Something isn't working
- `enhancement` - New feature or improvement
- `documentation` - Documentation updates
- `refactor` - Code restructuring

### Component Labels
- Component name (e.g., `CbAppHeader`, `CbButton`, `CbAlert`)
- System area (e.g., `theme-system`, `storybook`, `build-process`)

### Priority Labels
- `high-priority` - Needs immediate attention
- `medium-priority` - Should be addressed soon
- `low-priority` - Can be deferred

### Status Labels
- `breaking-change` - Will require version bump
- `needs-testing` - Requires additional testing
- `accessibility` - Related to a11y

## Best Practices

1. **Be specific**: Use concrete examples and code snippets
2. **Reference files**: Always include file paths and line numbers
3. **Show, don't tell**: Use code examples to illustrate problems and solutions
4. **Think about testing**: Include comprehensive testing requirements
5. **Consider impact**: Explain how changes affect users and developers
6. **Link resources**: Include MUI docs, related issues, or external references
7. **Use checkboxes**: Make acceptance criteria actionable and trackable
8. **Be consistent**: Follow the template structure for all issues
9. **Update environment**: Keep technology versions current
10. **Think future**: Consider migration paths and breaking changes

## Example Prompts for Creating Issues

### Bug Report Prompt
```
Create a GitHub issue for a bug in [Component Name]. The problem is [brief description].
Include:
- Current behavior with code examples from [file path]
- Expected behavior
- Technical context showing the implementation issue
- Proposed solution with code
- Testing requirements for manual, visual regression, and accessibility
- Acceptance criteria
```

### Enhancement Prompt
```
Create a GitHub issue for enhancing [Feature/Component]. We need to [brief description].
Include:
- Current limitations
- Benefits of enhancement
- Technical approach with code examples
- Migration strategy if breaking changes
- Testing and acceptance criteria
```

### Refactor Prompt
```
Create a GitHub issue for refactoring [System/Component] to [new approach].
Include:
- Problems with current implementation
- Proposed new architecture with code examples
- Migration plan
- Performance/DX benefits
- Comprehensive testing strategy
```

## Validation Checklist

Before submitting an issue, verify:
- [ ] Title is clear and descriptive (no emojis)
- [ ] All required sections are present
- [ ] Code examples include file paths
- [ ] Testing requirements are comprehensive
- [ ] Acceptance criteria are specific and measurable
- [ ] Priority level is justified
- [ ] Labels are appropriate
- [ ] Related issues/PRs are linked
- [ ] Environment details are current
- [ ] Formatting is consistent (emojis only in section headers)