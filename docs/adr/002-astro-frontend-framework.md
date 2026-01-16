# ADR-002: Astro as Frontend Framework

**Status:** Accepted
**Date:** 2026-01-04
**Decision Makers:** Michael Schlottmann

## Context

The application needs a frontend framework that supports:

- File-based Markdown content (decided in ADR-001)
- SEO optimization (SSR/SSG)
- Fast loading times
- Admin area for CRUD operations and Voice-to-Publish
- Self-hosted deployment on Linux server
- Modern, high-quality design

The team has no prior experience with any of the considered frameworks, so ease of learning is a factor.

## Decision

**Use Astro as the primary frontend framework.**

Key reasons:
- Native Content Collections with type-safe Markdown handling
- Minimal JavaScript shipped to client (Islands Architecture)
- Simple self-hosting (static files or Node adapter)
- Can embed React components for interactive parts (Admin UI)

### Architecture Approach

```
┌─────────────────────────────────────────┐
│                 Astro                    │
├─────────────────────────────────────────┤
│  Public Pages        │  Admin Area      │
│  (Static/SSG)        │  (React Islands) │
│                      │                  │
│  - Homepage          │  - CRUD Forms    │
│  - Category Views    │  - Voice Input   │
│  - Entry Details     │  - Draft Review  │
│  - Leaderboards      │                  │
└─────────────────────────────────────────┘
```

If the Admin area grows too complex, it can be extracted into a separate React application. For the initial scope (CRUD + Voice-to-Publish), Astro with React Islands is sufficient.

## Alternatives

### Next.js (App Router)

| Pro | Contra |
|-----|--------|
| Largest ecosystem | More boilerplate for Markdown |
| Flexible SSR/SSG/ISR | Complexity beyond our needs |
| API Routes built-in | Optimized for Vercel, not self-host |
| Excellent React integration | Steeper learning curve (RSC) |

**Rejected because:** Overkill for a content-focused site. Markdown handling requires additional libraries. More complexity than necessary.

### Remix

| Pro | Contra |
|-----|--------|
| Excellent form handling | No native Markdown support |
| Server-first approach | Smaller ecosystem |
| Good for admin interfaces | Less SSG-optimized |

**Rejected because:** Not designed for content/Markdown sites. Would require significant custom work for our file-based approach.

### Plain HTML + Vanilla JS

| Pro | Contra |
|-----|--------|
| Maximum simplicity | No component reuse |
| No framework overhead | Manual Markdown processing |
| | No type safety |

**Rejected because:** Would require building too much from scratch. No benefit over Astro which is nearly as simple but provides essential tooling.

## Consequences

### Positive

- **Content Collections**: Type-safe Markdown with Zod schema validation
- **Performance**: Minimal JS = fastest possible page loads
- **Flexibility**: React components available for interactive Admin UI
- **Simple deployment**: Build static files or run Node server
- **Low learning curve**: HTML-first approach, familiar syntax
- **Future-proof**: Can add React/Vue/Svelte components as needed

### Negative

- **Smaller ecosystem**: Fewer ready-made components than Next.js
- **Less known**: Fewer tutorials, Stack Overflow answers
- **Admin complexity limit**: Very complex admin UIs might need extraction

### Mitigations

- Use React component libraries (shadcn/ui) for Admin UI
- Astro documentation is excellent and comprehensive
- Keep Admin scope minimal; extract to separate app only if truly necessary
