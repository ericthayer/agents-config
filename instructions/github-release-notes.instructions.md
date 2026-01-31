---
applyTo: '**/*.md, **/*.mdx'
---

# GitHub Release Notes Instructions

This document provides comprehensive instructions for creating professional, well-structured GitHub release notes for the Application Development. Release notes are published in two formats: a **detailed version** and a **summary version**.

## File Naming and Location

### Detailed Release Notes

- **Filename:** `release-vX.X.X.md`
- **Location:** `docs/published/`
- **Purpose:** Comprehensive documentation of all changes with code examples, technical details, and migration guidance

### Summary Release Notes

- **Filename:** `release-vX.X.X.summary.md`
- **Location:** `docs/published/`
- **Purpose:** Condensed version highlighting key changes for quick review

## Release Type Determination

Determine the release type based on semantic versioning and commit messages:

### Patch Release (x.x.X)

- Bug fixes (`fix:`)
- Documentation updates (`docs:`)
- Minor code quality improvements
- Non-breaking changes
- **Example:** v18.31.1, v18.31.3

### Minor Release (x.X.0)

- New features (`feat:`)
- Enhancements to existing features
- New components or utilities
- Non-breaking additions
- **Example:** v18.29.0, v18.31.0

### Major Release (X.0.0)

- Breaking changes (`BREAKING CHANGE:`)
- API changes requiring migration
- Major architectural changes
- **Example:** v19.0.0

---

## Detailed Release Notes Structure

### Required Sections

#### 1. Title and Metadata

```markdown
# Release Notes: vX.X.X

**Release Date:** Month DD, YYYY
```

**Rules:**
- Use H1 heading for title
- Include version number with `v` prefix
- Release date in bold, format: "Month DD, YYYY"
- No emojis in the H1 title

---

#### 2. Overview (## 🎉 Overview)

**Purpose:** Provide high-level summary of the release focus and impact

**Structure:**
- 2-3 paragraphs
- First sentence states release type and primary focus
- Explain what changed and why
- Describe overall impact

**Template:**

```markdown
## 🎉 Overview

This [patch/minor/major] release [primary focus/goal]. [Additional context about the changes].

[Impact statement and benefits overview].
```

**Example:**

```markdown
## 🎉 Overview

This patch release fixes utility export issues and improves code consistency by consolidating exports and updating function syntax. The primary change resolves missing utility exports from the main library entry point, ensuring all utilities introduced in v18.31.0 are properly accessible to consumers.
```

---

#### 3. Main Content Sections

Organize changes by category with appropriate emoji headers:

**For Features (✨):**

```markdown
## ✨ New Features

### Feature Name

Description of the feature and its purpose.

#### **Key Aspects**

Detailed explanation with sub-sections as needed.

**Code Example:**

```tsx
// Usage example
```

**Benefits:**

- ✅ Benefit one
- ✅ Benefit two
- ✅ Benefit three
```

**For Bug Fixes (🐛):**

```markdown
## 🐛 Bug Fixes

### Issue Name

Description of the problem that was fixed.

#### **Root Cause Analysis**

Explanation of why the issue occurred.

**Before (vX.X.X):**

```tsx
// Problematic code
```

**After (vX.X.X):**

```tsx
// Fixed code
```

**Impact:**

- ✅ What is now fixed
- ✅ What users can now do
```

**For Enhancements (🔧):**

```markdown
## 🔧 Code Quality Improvements

### Improvement Name

Description of what was improved and why.

**Before:**

```tsx
// Old approach
```

**After:**

```tsx
// Improved approach
```

**Benefits:**

- 📦 Bundle size impact
- ⚡ Performance improvement
- 🔍 Developer experience enhancement
```

**For Documentation (📚):**

```markdown
## 📚 Documentation

### Documentation Updates

Description of documentation changes.

**New Documentation:**
- Document name and purpose
- Location/link

**Updated Documentation:**
- What was updated
- Why it was updated
```

**For Testing (🧪):**

```markdown
## 🧪 Testing Updates

### Test Changes

Description of test updates.

**New Tests:**
- Test description
- Coverage area

**Updated Tests:**
- What was updated
- Why it was updated
```

---

#### 4. Technical Details (## 🔧 Technical Details)

**Purpose:** Provide in-depth technical information for developers

**Include:**
- API changes with TypeScript interfaces
- Component structure changes
- Implementation details
- Code examples showing internal changes

**Template:**

```markdown
## 🔧 Technical Details

### Component API Changes

**Updated Interface:**

```typescript
interface ComponentProps {
  existingProp: string;
  newProp?: boolean;  // NEW
}
```

### Component Structure

Explanation of structural changes with code examples.
```

---

#### 5. Files Changed (## 📊 Files Changed)

**Purpose:** Show what files were modified and the scope of changes

**Format:** Use a table with columns: File | Changes | Description

```markdown
## 📊 Files Changed

| File | Changes | Description |
|------|---------|-------------|
| `src/components/Component.tsx` | 87 +/- | Component implementation |
| `src/utils/utility.ts` | 24 +/- | Utility function |
| `docs/GUIDE.md` | 175 + | New documentation |

**Total:** X files changed, X insertions(+), X deletions(-)
```

**Rules:**
- Use inline code for file paths
- Show +/- for modifications, + for new files, - for deletions
- Include total summary
- Order by significance (main changes first)

---

#### 6. Migration Guide (## 🔄 Migration Guide)

**Purpose:** Help users upgrade from previous version

**Structure:**

```markdown
## 🔄 Migration Guide

### For Existing Users

**Breaking Changes:**

[If none:]
✅ **No breaking changes** - Backward compatible

[If yes:]
⚠️ **Breaking Changes:**

- Change description
- Required action

**To Upgrade:**

```typescript
// Before
oldCode();

// After
newCode();
```

### For New Users

- Getting started guidance
- Key features to know
- Important notes
```

---

#### 7. Benefits Summary (## 🎯 Benefits Summary)

**Purpose:** Highlight improvements across different concerns

**Required Subsections:**

```markdown
## 🎯 Benefits Summary

### Developer Experience

- ✅ Benefit related to development workflow
- ✅ Benefit related to API usage
- ✅ Benefit related to documentation

### User Experience

- ✅ Benefit for end users
- ✅ Benefit for interaction
- ✅ Benefit for visual design

### Code Quality

- ✅ Benefit for maintainability
- ✅ Benefit for performance
- ✅ Benefit for best practices
```

**Rules:**
- Always use checkmarks (✅)
- 3-5 bullets per subsection
- Be specific and measurable when possible
- Use blank lines around each subsection

---

#### 8. Installation (## 📦 Installation)

```markdown
## 📦 Installation

```bash
npm install @YOUR_PACKAGE_NAME.X.X.X
```
```

---

#### 9. Resources (## 📚 Resources)

```markdown
## 📚 Resources

- [Full Changelog](https://github.com/YOUR_REPO_NAME/compare/vPREV...vCURRENT)
- [Component Documentation](link-if-applicable)
- [Related Documentation](link-if-applicable)
- [GitHub Repository](https://github.com/YOUR_REPO_NAME)
```

---

#### 10. Footer Metadata

```markdown
---

**Version:** X.X.X  
**Release Date:** Month DD, YYYY  
**Previous Version:** X.X.X  
**Type:** Patch/Minor/Major Release
```

---

## Summary Release Notes Structure

### Key Differences from Detailed Version

1. **Shorter sections** - 1-2 paragraphs vs 3-5
2. **Fewer code examples** - Only essential ones
3. **Condensed tables** - Simplified information
4. **No deep technical details** - High-level only
5. **Bottom Line section** - Single sentence summary at end

### Required Sections

#### 1. Title and Metadata

```markdown
# Release Summary: vX.X.X

**Release Date:** Month DD, YYYY
```

---

#### 2. Overview

```markdown
## Overview

Single paragraph summarizing the release. [One sentence about the main change or focus].
```

---

#### 3. Key Changes

```markdown
## Key Changes / Key Feature

### Change/Feature Name

Brief description (1-2 paragraphs).

**Essential Code Example:**

```tsx
// Minimal example showing the change
```

**Key Points:**

- Important point 1
- Important point 2
```

---

#### 4. Benefits (Condensed)

```markdown
## Benefits

- ✅ Key benefit 1
- ✅ Key benefit 2
- ✅ Key benefit 3
- ✅ Key benefit 4
```

---

#### 5. Files Changed (Condensed)

```markdown
## Files Changed

X files changed, X insertions(+), X deletions(-)

- `file1.tsx` - Brief description
- `file2.ts` - Brief description
- `docs/FILE.md` - **New** documentation
```

---

#### 6. Migration (Brief)

```markdown
## Migration

✅ **No breaking changes** - Backward compatible

[Or if changes needed:]

**To upgrade:**

```typescript
// Quick example
```
```

---

#### 7. Resources

```markdown
## Resources

- [GitHub Comparison](https://github.com/YOUR_REPO_NAME/compare/vPREV...vCURRENT)
- [Documentation](link-if-applicable)
- Commit: `hash`
```

---

#### 8. Bottom Line

```markdown
---

**Bottom Line:** [One sentence summary of what this release achieves and why it matters].
```

---

## Formatting Rules

### Markdown Linting Compliance

**Critical Rules:**

1. **MD032** - Lists must have blank lines before and after
2. **MD031** - Code fences must have blank lines before and after
3. **MD022** - Headings must have blank lines before and after
4. **MD026** - No trailing punctuation in headings (colons allowed in sub-headings only)
5. **MD009** - No trailing spaces

**Correct:**

```markdown
Description text.

**Label:**

- List item 1
- List item 2

Next section.
```

**Incorrect:**

```markdown
Description text.
**Label:**
- List item 1
- List item 2
Next section.
```

---

### Code Blocks

**Requirements:**
- Always specify language: ```tsx```, ```typescript```, ```bash```
- Use blank lines before and after
- Include comments for clarity
- Use single quotes in code examples
- Show file paths in comments when relevant

**Example:**

```markdown
Description text.

```tsx
// src/components/Component.tsx
import Component from '@mui/material/Component';

export const MyComponent = () => {
  return <Component prop='value' />;
};
```

Next section.
```

---

### Tables

**Requirements:**
- Proper alignment with pipes
- Header row with separators
- Consistent spacing
- Use inline code for technical terms

**Example:**

```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| `code` | Value | Description |
| `code2` | Value2 | Description2 |
```

---

### Emoji Usage

**Standard Emojis:**
- 🎉 Overview
- ✨ New Features
- 🐛 Bug Fixes
- 🔧 Enhancements/Technical Details/Code Quality
- 📚 Documentation
- 🧪 Testing
- 📊 Files Changed
- 🔄 Migration Guide
- 🎯 Benefits Summary
- 📦 Installation
- 💡 Use Cases
- 🎨 Visual Impact

**In Lists:**
- ✅ Positive benefits/features
- ❌ Anti-patterns/what not to do
- ⚠️ Warnings/breaking changes
- 📦 Bundle size
- ⚡ Performance
- 🔍 Developer experience

---

### Text Formatting

**Bold (`**text**`):**
- Important terms
- Section labels (Before:, After:, Benefits:)
- Emphasized points

**Inline Code (`` `text` ``):**
- File paths
- Function names
- Variable names
- Property names
- npm commands
- Short code snippets

**Headings:**
- Use proper hierarchy (don't skip levels)
- Title case for main headings
- Sentence case for descriptive headings
- No emojis in H1 titles
- Emojis in H2 section headers

---

## Content Guidelines

### What to Include

**Always Include:**
- Version number and release date
- Overview of changes
- Code examples (before/after when applicable)
- Benefits and impact
- Migration guidance
- Files changed
- Resources and links

**Include When Applicable:**
- Breaking changes
- New components or utilities
- API changes
- Performance improvements
- Visual changes
- Test coverage updates

### What to Avoid

**Don't Include:**
- Internal implementation details unless relevant
- Overly technical jargon without explanation
- Incomplete code examples
- Vague benefits ("better performance" without context)
- Personal opinions or subjective statements

### Writing Style

**Tone:**
- Professional and clear
- Factual and specific
- Helpful and educational
- Positive but honest

**Voice:**
- Use active voice
- Be direct and concise
- Explain "why" not just "what"
- Provide context for decisions

---

## Comparison Tables

Use comparison tables to show:
- Before/After values
- Old/New API
- Different approaches
- Feature comparisons

**Template:**

```markdown
| Previous | New | Impact |
|----------|-----|--------|
| Old value | New value | What this means |
```

---

## Code Example Patterns

### Before/After Pattern

```markdown
**Before (vX.X.X):**

```tsx
// Old implementation
const old = 'approach';
```

**After (vX.X.X):**

```tsx
// New implementation
const new = 'approach';
```
```

### Usage Example Pattern

```markdown
**Usage:**

```tsx
import { utility } from '@YOUR_PACKAGE_NAME';

// Example usage
const result = utility(input);
```
```

### Problem/Solution Pattern

```markdown
**Problem:**

```tsx
// Code showing the issue
```

**Solution:**

```tsx
// Code showing the fix
```
```

---

## Version References

**In Text:**
- Always use `v` prefix: v18.31.3
- Reference previous version in comparisons
- Include version in code comments when showing changes

**In Links:**
- GitHub comparison: `vPREV...vCURRENT`
- Use full version numbers
- Link to specific commits when relevant

---

## Validation Checklist

Before publishing, verify:

### Detailed Release Notes

- [ ] Title follows format: "# Release Notes: vX.X.X"
- [ ] Release date included and formatted correctly
- [ ] Overview section (2-3 paragraphs)
- [ ] All changes categorized appropriately
- [ ] Code examples include language specification
- [ ] Before/After examples where applicable
- [ ] Benefits listed with checkmarks
- [ ] Files changed table included
- [ ] Migration guide included
- [ ] Benefits summary with 3 subsections
- [ ] Installation section
- [ ] Resources section with links
- [ ] Footer metadata
- [ ] No markdown linting errors
- [ ] All blank lines properly placed
- [ ] Consistent emoji usage

### Summary Release Notes

- [ ] Title follows format: "# Release Summary: vX.X.X"
- [ ] Overview is single paragraph
- [ ] Key changes highlighted
- [ ] Essential code examples only
- [ ] Benefits condensed to single list
- [ ] Files changed condensed
- [ ] Migration brief
- [ ] Bottom Line section at end
- [ ] No markdown linting errors

---

## Example Patterns by Release Type

### Patch Release Example

**Focus:** Bug fixes, minor improvements, documentation

**Key Sections:**
- Bug Fixes (primary)
- Code Quality Improvements
- Documentation (if applicable)
- Migration (emphasize no breaking changes)

### Minor Release Example

**Focus:** New features, enhancements

**Key Sections:**
- New Features (primary)
- Enhancements
- Documentation
- Testing
- Use Cases/Examples
- Migration (new capabilities)

### Major Release Example

**Focus:** Breaking changes, major features

**Key Sections:**
- Breaking Changes (highlight at top)
- New Features
- Migration Guide (comprehensive)
- Benefits Summary (emphasize value of upgrade)

---

## Cross-References

**Link to:**
- Related GitHub issues
- Related pull requests
- Component documentation
- External documentation (MUI, etc.)
- Previous release notes
- Migration guides

**Format:**

```markdown
- [Issue #123](url) - Description
- [PR #456](url) - Description
- [Component Docs](url)
```

---

## Final Notes

- **Consistency is key** - Follow the established patterns
- **Be thorough** - Include all relevant information
- **Be clear** - Write for developers of all skill levels
- **Be helpful** - Provide migration guidance and examples
- **Validate** - Check markdown linting before committing
- **Review examples** - Reference existing release notes in `docs/published/`
