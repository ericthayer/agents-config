---
applyTo: '**/*.stories.@(js|jsx|ts|tsx)'
---
Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

# /build.storybook - Scaffold Storybook Story

Generate a Storybook story file following the Application Development patterns.

## Usage
- `/build.storybook ComponentName` - Creates basic story with Primary/Secondary variants
- `/build.storybook ComponentName --visual` - Includes visual regression testing tag
- `/build.storybook ComponentName --variants variant1,variant2` - Custom story variants

## Story Template Structure

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import Stack from '@mui/material/Stack';
import { ComponentName } from './ComponentName';

const meta: Meta = {
  title: 'Category/Subcategory/ComponentName',
  component: ComponentName,
  argTypes: {
    // Define component prop controls
  },
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [(Story) => <Story />],
  tags: ['!visual:check'], // Use 'visual:check' for visual regression testing
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary = {
  args: {
    // Primary story args
  },
  render: (args) => {
    return (
      <ComponentName {...args} />
    );
  },
} satisfies Story;
```

## Requirements
Don't assume, always ask for the following inputs before generating code:
- Use proper Storybook title categorization matching file structure
- Add `'visual:check'` tag only when component is ready for visual regression testing
- Define argTypes for interactive controls in Storybook
- Use `satisfies` for type safety with Meta and Story types