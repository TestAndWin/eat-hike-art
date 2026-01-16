---
name: create-component
description: Creates an Astro or React component following project conventions and design system. Use this skill when the user wants to create a new UI component.
---

# Component Generator

## Purpose

Create consistent, well-structured components following project conventions for Astro (public pages) and React (admin area).

## Steps

1. **Clarify requirements:**
   - Ask for component name
   - Ask for component type: Astro (.astro) or React (.tsx)
   - Ask for location: `components/`, `components/ui/`, or `components/admin/`
   - Ask for brief description of functionality

2. **Determine component location:**

   | Type | Location | Use Case |
   |------|----------|----------|
   | Astro | `src/components/` | Public pages, static content |
   | Astro | `src/components/ui/` | Shared UI elements (public) |
   | React | `src/components/ui/` | shadcn/ui components |
   | React | `src/components/admin/` | Admin area interactive components |

3. **Create component file:**
   - Use appropriate template (see below)
   - Follow naming conventions
   - Apply design system tokens

4. **Verify:**
   - Check TypeScript types are correct
   - Ensure Tailwind classes follow conventions

## Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Astro component | PascalCase.astro | `EntryCard.astro` |
| React component | PascalCase.tsx | `VoiceRecorder.tsx` |
| Props interface | ComponentNameProps | `EntryCardProps` |
| CSS classes | Tailwind utilities | `class="flex items-center gap-2"` |

## Design System

### Colors

```
Primary (Amber/Gold - Lüneburg brick):
- amber-500 (accent)
- amber-600 (hover)

Neutral:
- gray-50 (background light)
- gray-100 (card background)
- gray-600 (text muted)
- gray-900 (text primary)

Status:
- green-500 (active/success)
- yellow-500 (draft/warning)
- red-500 (inactive/error)
```

### Typography

```
Headings: font-serif (elegant, editorial feel)
- text-4xl font-serif font-bold (h1)
- text-2xl font-serif font-semibold (h2)
- text-xl font-serif font-medium (h3)

Body: font-sans (readable)
- text-base (default)
- text-sm text-gray-600 (muted)
```

### Spacing & Layout

```
Container: max-w-6xl mx-auto px-4
Card padding: p-4 md:p-6
Gap in flex/grid: gap-2 (tight), gap-4 (normal), gap-6 (loose)
Border radius: rounded-lg (cards), rounded-md (buttons/inputs)
Shadow: shadow-sm (subtle), shadow-md (cards), shadow-lg (modals)
```

### Responsive Breakpoints

```
sm: 640px   - Tablet portrait
md: 768px   - Tablet landscape
lg: 1024px  - Desktop
xl: 1280px  - Large desktop

Mobile-first: Start with mobile, add md: and lg: prefixes
```

### Common Patterns

**Card:**
```html
<div class="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow">
```

**Button (primary):**
```html
<button class="bg-amber-500 hover:bg-amber-600 text-white font-medium px-4 py-2 rounded-md transition-colors">
```

**Button (secondary):**
```html
<button class="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-md transition-colors">
```

**Input:**
```html
<input class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
```

**Gable Rating Display:**
```html
<div class="flex items-center gap-0.5 text-amber-500">
  <!-- Repeat GableIcon for each full/half gable -->
</div>
```

## Templates

### Astro Component Template

```astro
---
// src/components/[ComponentName].astro

interface Props {
  // Define props here
  title: string;
  variant?: 'default' | 'highlight';
}

const { title, variant = 'default' } = Astro.props;
---

<div class:list={[
  'base-classes',
  { 'variant-classes': variant === 'highlight' }
]}>
  <h2 class="text-xl font-serif font-semibold text-gray-900">
    {title}
  </h2>
  <slot />
</div>
```

### React Component Template

```tsx
// src/components/admin/[ComponentName].tsx

'use client';

import { useState } from 'react';

interface ComponentNameProps {
  // Define props here
  initialValue?: string;
  onSubmit: (value: string) => void;
}

export function ComponentName({ initialValue = '', onSubmit }: ComponentNameProps) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = () => {
    onSubmit(value);
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
      />
      <button
        onClick={handleSubmit}
        className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-4 py-2 rounded-md transition-colors"
      >
        Submit
      </button>
    </div>
  );
}
```

### React Component with shadcn/ui

```tsx
// src/components/admin/[ComponentName].tsx

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ComponentNameProps {
  title: string;
  onSave: () => void;
}

export function ComponentName({ title, onSave }: ComponentNameProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input placeholder="Enter value..." />
        <Button onClick={onSave}>
          Save
        </Button>
      </CardContent>
    </Card>
  );
}
```

## Gable Rating Component Reference

The project uses a custom gable icon (Lüneburg brick gable) for ratings:

```astro
---
// src/components/GableRating.astro

interface Props {
  rating: number;  // 1-5, supports 0.5 increments
  size?: 'sm' | 'md' | 'lg';
}

const { rating, size = 'md' } = Astro.props;

const fullGables = Math.floor(rating);
const hasHalf = rating % 1 !== 0;
const emptyGables = 5 - fullGables - (hasHalf ? 1 : 0);

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6'
};
---

<div class="flex items-center gap-0.5">
  {Array(fullGables).fill(0).map(() => (
    <svg class:list={[sizeClasses[size], 'text-amber-500']} ...>
      <!-- Full gable icon -->
    </svg>
  ))}
  {hasHalf && (
    <svg class:list={[sizeClasses[size], 'text-amber-500']} ...>
      <!-- Half gable icon -->
    </svg>
  )}
  {Array(emptyGables).fill(0).map(() => (
    <svg class:list={[sizeClasses[size], 'text-gray-300']} ...>
      <!-- Empty gable icon -->
    </svg>
  ))}
</div>
```

## Integration with frontend-design Plugin

When the frontend-design plugin is active, follow this hierarchy:

### Design System Has Priority

The project's design system (colors, typography, spacing) defined above **takes precedence** over plugin suggestions. This ensures visual consistency across the application.

### Plugin Creativity Zones

| Aspect | Plugin Freedom | Constraint |
|--------|---------------|------------|
| Animations | ✅ Full freedom | Keep performant (prefer CSS transitions) |
| Micro-interactions | ✅ Full freedom | Subtle, not distracting |
| Hover/Focus states | ✅ Can enhance | Base colors from design system |
| Layout variations | ✅ Creative layouts | Respect spacing tokens |
| Shadows/Gradients | ✅ Can add depth | Complement amber/gray palette |

### Plugin Restrictions

| Aspect | Restriction | Reason |
|--------|-------------|--------|
| Primary colors | Must use amber-500/600 | Brand identity (Lüneburg brick) |
| Typography base | Must use font-serif/sans | Editorial feel consistency |
| Border radius | Must use rounded-lg/md | Unified card/button appearance |
| Core button styles | Must follow templates | Recognizable interaction patterns |

### Example: Good Plugin Enhancement

```tsx
// ✅ Good: Plugin adds animation while respecting design system
<button
  className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-4 py-2 rounded-md
             transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
>
  Submit
</button>
```

### Example: Bad Plugin Override

```tsx
// ❌ Bad: Plugin ignores design system colors
<button
  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-full"
>
  Submit
</button>
```

## Checklist Before Completion

- [ ] Component follows naming convention
- [ ] Props are properly typed
- [ ] Tailwind classes follow design system
- [ ] Responsive behavior considered (mobile-first)
- [ ] Accessibility attributes added where needed (aria-labels, roles)
- [ ] Component is placed in correct directory
- [ ] If frontend-design plugin was used: verify design system compliance
