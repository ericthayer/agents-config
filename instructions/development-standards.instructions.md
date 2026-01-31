---
applyTo: '**'
---
# Development Standards and Best Practices

This document outlines the standards and best practices for DevLog Application Development which uses React, TypeScript, Material UI, and follows the [Airbnb style guide](https://airbnb.io/javascript/) page.

## Web Interface Guidelines - Development Standards and Guidelines
ALWAYS refer to the `.github/instructions/web-interface-guidelines.instructions.md` file for detailed explicit guidelines to follow when building _any_ web interface.

## React

- **Components**:
  - Use PascalCase for filenames. E.g., ReservationCard.jsx.
  - Use .tsx extension for React components.
  - Use the filename as the component name.
  - Only include one React component per file. However, multiple Stateless, or Pure, Components are allowed per file.
  - Prefer functional components and use React Hooks for state and side effects.
  
- **Props**:
  - Always use camelCase for prop names.
  - Define prop types using TypeScript interfaces.
  - Always define explicit defaultProps for all non-required props.
  - Consider using the Context API when passing props more than 2-3 component levels.
  - Use spread props sparingly.
  
- **JSX/TSX**:
  - Keep JSX/TSX readable and concise.
  - Extract complex parts into separate functions or components.
  - Proper JSX/TSX alignment follows the `react/jsx-closing-bracket-location` and `react/jsx-closing-tag-location` linting rules.

## TypeScript

- **Types**: Always specify types. Avoid using `any`.
- **Interfaces**: Use interfaces to define object shapes, especially for component props.
- **Enums**: Use enums for sets of related constants.
- **Variables**: Use `const` and `let` over `var`.
- **Functions**: Use named function expressions instead of function declarations
- **Semicolons**: Use them

## APCA

- Use the [APCA](https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-contrast.html) standard for color contrast calculations instead of the older WCAG 2.0 method.
- Aim for an APCA contrast value of at least 60 for normal text and 45 for large text.
- Use tools like the [APCA Contrast Checker](https://toolness.github.io/apca/) to verify color contrast compliance.
- Ensure that interactive elements have sufficient contrast in all states (default, hover, active, focus, disabled).
- Document any exceptions to the APCA contrast requirements with a clear rationale.