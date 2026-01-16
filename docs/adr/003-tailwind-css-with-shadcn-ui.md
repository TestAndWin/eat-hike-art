# ADR-003: Tailwind CSS with shadcn/ui

**Status:** Accepted
**Date:** 2026-01-04
**Decision Makers:** Michael Schlottmann

## Context

The application needs a styling solution that supports:

- Modern, high-quality design
- Responsive layouts
- Consistent design system
- Admin UI components (forms, buttons, dialogs)
- Integration with Astro and React Islands (ADR-002)

The team has no prior experience with the considered frameworks.

## Decision

**Use Tailwind CSS as the styling foundation with shadcn/ui for UI components.**

### Tailwind CSS

Utility-first CSS framework providing:
- Consistent spacing, colors, typography via design tokens
- Responsive design with breakpoint prefixes (`md:`, `lg:`)
- Zero-runtime CSS (compiled at build time)

### shadcn/ui

Component library for React providing:
- Pre-built, accessible components (Button, Form, Dialog, etc.)
- Copy-paste approach (no npm dependency lock-in)
- Built on Radix UI primitives
- Tailwind-styled, fully customizable

### Usage Pattern

**Public pages (Astro components):**
```astro
<article class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
  <h2 class="text-xl font-semibold text-gray-900">Restaurant Name</h2>
</article>
```

**Admin area (React Islands with shadcn/ui):**
```tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

<form>
  <Input placeholder="Restaurant name" />
  <Button type="submit">Save Draft</Button>
</form>
```

## Alternatives

### CSS Modules

| Pro | Contra |
|-----|--------|
| Classic CSS syntax | No design system out-of-the-box |
| Scoped styles | More files to maintain |
| No new syntax to learn | Manual responsive handling |

**Rejected because:** Requires building a design system from scratch. More code for the same result. No ready-made component library.

### Astro Scoped Styles

| Pro | Contra |
|-----|--------|
| Zero config | No sharing between components |
| Single-file components | No design system |
| Native Astro feature | Doesn't help with React Islands |

**Rejected because:** Not suitable for a consistent design across the application. Would need to duplicate styles.

### styled-components / Emotion

| Pro | Contra |
|-----|--------|
| CSS-in-JS flexibility | Runtime overhead |
| Component-scoped | Less optimal for Astro |
| | Different paradigm than Astro's static approach |

**Rejected because:** CSS-in-JS adds runtime overhead contrary to Astro's zero-JS philosophy. Not the idiomatic choice for Astro projects.

### Pure CSS / Vanilla

| Pro | Contra |
|-----|--------|
| No dependencies | No design system |
| Full control | Everything from scratch |
| | Inconsistency risk |

**Rejected because:** Would require significant effort to achieve a modern, consistent design. No component library for Admin UI.

## Consequences

### Positive

- **Rapid development**: Utility classes enable fast prototyping
- **Consistent design**: Built-in design tokens ensure uniformity
- **Responsive by default**: Breakpoint prefixes make responsive design trivial
- **Admin UI ready**: shadcn/ui provides professional form components
- **No runtime cost**: Tailwind compiles to static CSS
- **Customizable**: Both Tailwind config and shadcn components are fully adjustable
- **Excellent documentation**: Both tools are well-documented with examples

### Negative

- **Learning curve**: Utility-first approach requires adjustment
- **Verbose HTML**: Class strings can become long
- **shadcn setup**: Initial component installation takes some effort

### Mitigations

- Use Tailwind CSS IntelliSense VS Code extension for autocomplete
- Extract repeated patterns into Astro/React components
- shadcn CLI simplifies component installation: `npx shadcn-ui@latest add button`
