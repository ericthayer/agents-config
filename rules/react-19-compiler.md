---
description: Guidelines for writing code optimized for the React Compiler (React 19+).
---

**OBJECTIVE:**
Writing "Rules of React" compliant code to enable automatic memoization and optimization by the React Compiler.

**REASON:**
The React Compiler (`babel-plugin-react-compiler`) automatically optimizes components, but only if they follow strict functional purity and reactivity rules.

**DESCRIPTION:**
Best practices for ensuring components are "Compiler-safe," reducing the need for manual `useMemo` and `useCallback`.

**INSTRUCTIONS:**

### Component Purity
- **No Mutations in Render**: Never mutate variables or objects during the render phase. Always treat props and state as immutable.
- **Pure Functions**: Ensure components and hooks are idempotent—calling them multiple times with the same inputs should produce the same results.

### Hook Usage
- **Standard Hook Patterns**: Only use hooks at the top level and follow the standard React lifecycle. 
- **Avoid Manual Memoization**: Stop using `useMemo` and `useCallback` for performance optimization; the compiler handles this. Only use them if they are required for stable references in external libraries or deep dependency arrays.

### Compiler Safety
- **Validate with ESLint**: Ensure `eslint-plugin-react-compiler` is active to catch potential issues that would prevent optimization.
- **Side Effect Isolation**: Keep side effects strictly inside `useEffect` or event handlers.
