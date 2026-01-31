# Material-UI (MUI) Architecture & Patterns

**Framework Version**: MUI v7.3+  
**Purpose**: Architectural patterns, constraints, and anti-patterns for building React applications with Material-UI.

---

## Component Extension Philosophy

### When to Extend vs Compose

**Extend MUI Components** when:
- Adding custom variants to existing MUI components
- Building a design system with consistent theming
- Need to preserve all MUI component APIs and behaviors
- Creating reusable, branded versions (e.g., branded Button, Card)

**Compose MUI Components** when:
- Building domain-specific components (e.g., UserCard, ProductList)
- Combining multiple MUI components into a pattern
- Need custom logic that doesn't fit MUI's API
- Creating one-off layouts or pages

### Extension Pattern

```tsx
// ✅ Good: Extend with TypeScript, preserve MUI props
import { Button, ButtonProps } from '@mui/material/Button';

interface BrandedButtonProps extends ButtonProps {
  customVariant?: 'primary' | 'secondary' | 'danger';
}

export const BrandedButton: React.FC<BrandedButtonProps> = ({
  customVariant,
  ...muiProps
}) => {
  return <Button {...muiProps} />;
};
```

```tsx
// ❌ Bad: Reimplementing MUI functionality
const BrandedButton = ({ onClick, children }) => {
  return <div onClick={onClick}>{children}</div>;
};
```

---

## Theme Architecture

### Theme Provider Structure

**Rule**: Use MUI's theme provider with `cssVariables` enabled for optimal performance and SSR support.

```tsx
// ✅ Good: CSS variables for dynamic theming
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles';

function App() {
  return (
    <CssVarsProvider>
      {/* Your app */}
    </CssVarsProvider>
  );
}
```

```tsx
// ❌ Bad: Traditional theme provider (no CSS variables)
import { ThemeProvider } from '@mui/material/styles';

function App() {
  return (
    <ThemeProvider theme={theme}>
      {/* Your app */}
    </ThemeProvider>
  );
}
```

### Theme Token Hierarchy

**Rule**: Organize theme tokens in layers of specificity.

1. **Base tokens** - Design primitives (spacing, typography scale, breakpoints)
2. **Semantic tokens** - Purpose-based (colors.primary, colors.error)
3. **Component tokens** - Component-specific overrides

```tsx
// ✅ Good: Layered theme structure
const theme = createTheme({
  // Base tokens
  spacing: 8,
  typography: {
    fontFamily: '"Inter", sans-serif',
  },
  
  // Semantic tokens
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
  
  // Component tokens
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});
```

### Dark Mode Implementation

**Rule**: Respect system preference, persist user choice, prevent flash.

```tsx
// ✅ Good: Proper dark mode setup
<CssVarsProvider
  defaultMode="system"
  modeStorageKey="app-color-mode"
  disableTransitionOnChange={false}
>
```

**Anti-pattern**: Manual class toggling or localStorage reading in components.

---

## Performance Rules

### Import Optimization

**Rule**: Use named imports for tree-shaking, avoid barrel imports.

```tsx
// ✅ Good: Named imports
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
```

```tsx
// ❌ Bad: Barrel import (breaks tree-shaking)
import { Button, TextField } from '@mui/material';
```

### `sx` Prop Usage

**Rule**: Use `sx` prop for dynamic, one-off styles. Use `styled` for reusable component variants.

```tsx
// ✅ Good: sx for dynamic styles
<Box sx={{ 
  p: isLarge ? 3 : 2,
  color: error ? 'error.main' : 'text.primary' 
}} />

// ✅ Good: styled for reusable patterns
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[2],
}));
```

```tsx
// ❌ Bad: sx for static, reusable styles
<Card sx={{ borderRadius: 2, boxShadow: 2 }} />
<Card sx={{ borderRadius: 2, boxShadow: 2 }} />
<Card sx={{ borderRadius: 2, boxShadow: 2 }} />
```

### Theme Caching

**Rule**: Create theme once, memoize custom theme functions.

```tsx
// ✅ Good: Memoized theme creation
const theme = useMemo(
  () => createTheme({
    palette: { mode: colorMode },
  }),
  [colorMode]
);
```

```tsx
// ❌ Bad: Theme recreation on every render
function App() {
  const theme = createTheme({ /* ... */ });
  return <ThemeProvider theme={theme}>...</ThemeProvider>;
}
```

---

## Grid System

### Use Grid v2 Syntax

**Rule**: Always use the new Grid2 component for layouts.

```tsx
// ✅ Good: Grid v2 with container queries
import Grid from '@mui/material/Unstable_Grid2';

<Grid container spacing={2}>
  <Grid xs={12} md={6}>Column 1</Grid>
  <Grid xs={12} md={6}>Column 2</Grid>
</Grid>
```

```tsx
// ❌ Bad: Old Grid syntax
import Grid from '@mui/material/Grid';

<Grid container spacing={2}>
  <Grid item xs={12} md={6}>Column 1</Grid>
</Grid>
```

---

## Styling Constraints

### CSS Variables Over Inline Styles

**Rule**: Use theme CSS variables instead of hardcoded values.

```tsx
// ✅ Good: Theme-aware
<Box sx={{ 
  bgcolor: 'background.paper',
  color: 'text.primary',
  p: 2,
}} />
```

```tsx
// ❌ Bad: Hardcoded values
<Box sx={{ 
  backgroundColor: '#fff',
  color: '#000',
  padding: '16px',
}} />
```

### Component Style Overrides

**Rule**: Override MUI component styles through theme, not inline.

```tsx
// ✅ Good: Theme-level overrides
const theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
      defaultProps: {
        disableRipple: true,
      },
    },
  },
});
```

```tsx
// ❌ Bad: Per-instance overrides
<Button sx={{ textTransform: 'none' }} disableRipple>Click</Button>
<Button sx={{ textTransform: 'none' }} disableRipple>Submit</Button>
```

---

## Icon Usage

### Material Icons

**Rule**: Use `@mui/icons-material` for MUI projects. Use SVG icons for custom designs.

```tsx
// ✅ Good: MUI icons
import DeleteIcon from '@mui/icons-material/Delete';
<IconButton><DeleteIcon /></IconButton>
```

```tsx
// ❌ Bad: Icon fonts or inconsistent libraries
<i className="fa fa-trash"></i>
```

### Icon Size & Color

**Rule**: Let icons inherit size and color from parent component.

```tsx
// ✅ Good: Inherited sizing
<Button startIcon={<AddIcon />}>Add Item</Button>
```

```tsx
// ❌ Bad: Manual sizing that breaks consistency
<Button startIcon={<AddIcon sx={{ fontSize: 20 }} />}>Add Item</Button>
```

---

## Anti-Patterns

### ❌ Don't Override Internal Class Names

```tsx
// ❌ Bad: Brittle, breaks with MUI updates
<Button className="MuiButton-root" />
```

### ❌ Don't Mix Theme Systems

```tsx
// ❌ Bad: Mixing MUI theme with external CSS variables
<Box sx={{ color: 'var(--custom-color)' }} /> // Use MUI theme instead
```

### ❌ Don't Bypass Theme Provider

```tsx
// ❌ Bad: Direct theme access without provider
import { createTheme } from '@mui/material/styles';
const theme = createTheme();
<Box sx={{ p: theme.spacing(2) }} />
```

### ❌ Don't Use `transition: all`

```tsx
// ❌ Bad: Performance killer
sx={{ transition: 'all 0.3s' }}

// ✅ Good: Specific properties
sx={{ transition: 'opacity 0.3s, transform 0.3s' }}
```

---

## Accessibility Requirements

### Icon-Only Buttons

**Rule**: All icon-only buttons must have `aria-label`.

```tsx
// ✅ Good
<IconButton aria-label="Delete item">
  <DeleteIcon />
</IconButton>

// ❌ Bad
<IconButton>
  <DeleteIcon />
</IconButton>
```

### Form Components

**Rule**: All MUI form components require labels.

```tsx
// ✅ Good: Visible label
<TextField label="Email" />

// ✅ Good: Accessible without visible label
<TextField aria-label="Search" placeholder="Search..." />

// ❌ Bad: No label
<TextField placeholder="Enter email" />
```

---

## TypeScript Integration

### Extend MUI Types

**Rule**: Augment MUI's module declarations for custom theme properties.

```tsx
// ✅ Good: Type-safe theme extensions
declare module '@mui/material/styles' {
  interface Palette {
    tertiary: Palette['primary'];
  }
  interface PaletteOptions {
    tertiary?: PaletteOptions['primary'];
  }
}

const theme = createTheme({
  palette: {
    tertiary: {
      main: '#ff9800',
    },
  },
});
```

### Strict Prop Types

**Rule**: Use MUI's provided TypeScript types, extend when needed.

```tsx
// ✅ Good: Proper typing
import { ButtonProps } from '@mui/material/Button';

interface CustomButtonProps extends ButtonProps {
  loading?: boolean;
}
```

---

## Testing Considerations

### Theme in Tests

**Rule**: Wrap components with theme provider in tests.

```tsx
// ✅ Good: Themed test
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();
render(
  <ThemeProvider theme={theme}>
    <MyComponent />
  </ThemeProvider>
);
```

### Snapshot Testing

**Rule**: Mock theme for consistent snapshots.

```tsx
// ✅ Good: Stable snapshots
const testTheme = createTheme({
  palette: { mode: 'light' },
});
```

---

## Migration & Compatibility

### Upgrading from MUI v5/v6

**Rule**: Use codemods for safe migrations.

```bash
# ✅ Good: Automated migration
npx @mui/codemod v7.0.0/preset-safe <path>
```

### Deprecated API Usage

**Rule**: Check MUI changelog for deprecated features, replace immediately.

```tsx
// ❌ Deprecated (v7)
import { makeStyles } from '@mui/styles';

// ✅ Current
import { styled } from '@mui/material/styles';
```

---

## Related Resources

- [MUI Documentation](https://mui.com/material-ui/)
- [MUI GitHub](https://github.com/mui/material-ui)
- [CSS Theme Variables Guide](https://mui.com/material-ui/customization/css-theme-variables/usage/)
- [Dark Mode Best Practices](https://mui.com/material-ui/customization/dark-mode/)
