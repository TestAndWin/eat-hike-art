# ADR-004: Astro Server Endpoints with Service Layer

**Status:** Accepted
**Date:** 2026-01-04
**Decision Makers:** Michael Schlottmann

## Context

The application needs backend functionality for:

- CRUD operations on Markdown content files
- Voice-to-Publish workflow (Speech-to-Text → Claude API → Markdown)
- Image upload handling
- Admin authentication

Given the decisions already made:
- File-based Markdown storage (ADR-001)
- Astro frontend framework (ADR-002)
- Self-hosted Linux server
- Expected volume: ~50 entries per year

The question: Should the API be built into Astro or as a separate service?

## Decision

**Use Astro Server Endpoints with a structured service layer.**

Astro runs in SSR mode (Node adapter) and handles all API requests. Business logic is extracted into testable service modules.

### Project Structure

```
src/
  pages/
    api/
      entries/
        index.ts              ← GET (list), POST (create)
        [id].ts               ← GET, PUT, DELETE
      voice/
        transcribe.ts         ← POST: Audio → Text
        generate.ts           ← POST: Text → Markdown via Claude
      images/
        upload.ts             ← POST: Image upload
      auth/
        login.ts              ← POST: Admin login
        logout.ts             ← POST: Admin logout
  lib/
    services/
      entries.ts              ← CRUD logic for content
      voice.ts                ← Speech-to-Text + Claude integration
      images.ts               ← Image storage logic
      auth.ts                 ← Authentication logic
    utils/
      markdown.ts             ← Parse/serialize frontmatter
      files.ts                ← File system operations
```

### API Endpoint Pattern

```typescript
// src/pages/api/entries/[id].ts
import { getEntry, updateEntry, deleteEntry } from '@/lib/services/entries';
import { requireAuth } from '@/lib/services/auth';

export async function GET({ params }) {
  const entry = await getEntry(params.id);
  if (!entry) return new Response(null, { status: 404 });
  return new Response(JSON.stringify(entry));
}

export async function PUT({ params, request, cookies }) {
  const auth = await requireAuth(cookies);
  if (!auth) return new Response(null, { status: 401 });

  const data = await request.json();
  await updateEntry(params.id, data);
  return new Response(JSON.stringify({ success: true }));
}

export async function DELETE({ params, cookies }) {
  const auth = await requireAuth(cookies);
  if (!auth) return new Response(null, { status: 401 });

  await deleteEntry(params.id);
  return new Response(null, { status: 204 });
}
```

### Voice-to-Publish Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. Admin records audio in browser                          │
│                         ↓                                   │
│  2. POST /api/voice/transcribe                              │
│     → Speech-to-Text service (e.g., Whisper API)            │
│     → Returns German transcript                             │
│                         ↓                                   │
│  3. POST /api/voice/generate                                │
│     → Claude API extracts structured data                   │
│     → Generates complete Markdown with frontmatter          │
│     → Saves as draft file                                   │
│                         ↓                                   │
│  4. Admin reviews in UI, edits if needed                    │
│                         ↓                                   │
│  5. PUT /api/entries/{id} with status: "active"             │
└─────────────────────────────────────────────────────────────┘
```

## Alternatives

### Separate Express/Fastify Server

| Pro | Contra |
|-----|--------|
| Full control over API | Two services to deploy |
| Familiar pattern | CORS configuration needed |
| Scales independently | More infrastructure |
| Easier to test in isolation | Overkill for this scope |

**Rejected because:** Adds operational complexity without benefit. ~50 entries/year doesn't justify a separate service. KISS principle.

### Go Backend

| Pro | Contra |
|-----|--------|
| Extremely performant | Different language than frontend |
| Single binary deployment | Massive overkill |
| | Harder to integrate with Astro |

**Rejected because:** Performance is irrelevant for this use case. Would introduce unnecessary complexity and a second language.

### Serverless Functions (Vercel/Netlify)

| Pro | Contra |
|-----|--------|
| No server management | Not self-hosted (requirement) |
| Auto-scaling | File system access problematic |

**Rejected because:** Self-hosted Linux server is already decided. File-based storage requires persistent filesystem.

### Astro Endpoints without Structure

| Pro | Contra |
|-----|--------|
| Fastest to implement | Logic mixed with HTTP handling |
| | Hard to test |
| | Becomes messy as it grows |

**Rejected because:** While Astro endpoints are the right choice, unstructured code leads to maintenance problems. Service layer adds minimal overhead but significant clarity.

## Consequences

### Positive

- **Single deployment**: One Astro project handles everything
- **Simple infrastructure**: Just Node.js on Linux
- **Testable services**: Business logic isolated from HTTP layer
- **Native file access**: Node.js `fs` for Markdown operations
- **Consistent codebase**: TypeScript throughout
- **Easy to extend**: Add new endpoints as needed

### Negative

- **Astro SSR required**: Cannot use pure static mode
- **Node.js limitations**: Single-threaded (irrelevant for this load)
- **Less familiar**: Astro endpoints less common than Express

### Mitigations

- Astro's Node adapter is stable and well-documented
- Service layer pattern is framework-agnostic and portable
- Can extract to separate service later if truly needed
