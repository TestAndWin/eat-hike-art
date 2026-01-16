---
name: create-api-endpoint
description: Creates an Astro API endpoint with service layer following project conventions. Use this skill when the user wants to create a new REST API endpoint.
---

# API Endpoint Generator

## Purpose

Create consistent, well-structured API endpoints following the project's architecture:
- Astro Server Endpoints for HTTP handling
- Service layer for business logic
- Proper authentication where required

## Architecture Overview

```
Request → src/pages/api/[endpoint].ts → src/lib/services/[service].ts → Response
                    │                              │
                    │                              ├── File system (content)
                    │                              ├── External APIs (Whisper, Claude)
                    └── Auth check (if protected)  └── Sessions
```

## Steps

1. **Clarify requirements:**
   - Ask for endpoint path (e.g., `/api/entries`, `/api/voice/transcribe`)
   - Ask for HTTP methods needed (GET, POST, PUT, DELETE)
   - Ask if authentication is required
   - Ask for brief description of functionality

2. **Determine file locations:**

   | Component | Location |
   |-----------|----------|
   | Endpoint | `src/pages/api/[path].ts` |
   | Service | `src/lib/services/[name].ts` |
   | Types | `src/lib/types/[name].ts` |

3. **Create files:**
   - Create endpoint file with HTTP method handlers
   - Create or extend service file with business logic
   - Add types if needed

4. **Verify:**
   - Check TypeScript types are correct
   - Ensure error handling is in place
   - Verify auth is applied to protected endpoints

## Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Endpoint file | kebab-case.ts | `entries.ts`, `[id].ts` |
| Service file | kebab-case.ts | `entries.ts`, `voice.ts` |
| Service function | camelCase | `getEntries()`, `createEntry()` |
| Types | PascalCase | `Entry`, `CreateEntryRequest` |

## Existing Services

| Service | Location | Functions |
|---------|----------|-----------|
| entries | `src/lib/services/entries.ts` | CRUD for content files |
| voice | `src/lib/services/voice.ts` | Whisper + Claude integration |
| images | `src/lib/services/images.ts` | Image upload/management |
| auth | `src/lib/services/auth.ts` | Session validation |

## Templates

### Simple GET Endpoint (public)

```typescript
// src/pages/api/entries/index.ts

import type { APIRoute } from 'astro';
import { getEntries } from '@/lib/services/entries';

export const GET: APIRoute = async ({ url }) => {
  try {
    const type = url.searchParams.get('type') || 'restaurants';
    const entries = await getEntries(type);

    return new Response(JSON.stringify(entries), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching entries:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch entries' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```

### Dynamic Route Endpoint (protected)

```typescript
// src/pages/api/entries/[id].ts

import type { APIRoute } from 'astro';
import { getEntry, updateEntry, deleteEntry } from '@/lib/services/entries';
import { requireAuth } from '@/lib/services/auth';

export const GET: APIRoute = async ({ params }) => {
  try {
    const entry = await getEntry(params.id!);

    if (!entry) {
      return new Response(JSON.stringify({ error: 'Entry not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(entry), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching entry:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch entry' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PUT: APIRoute = async ({ params, request, cookies }) => {
  // Auth check
  if (!await requireAuth(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const data = await request.json();
    const entry = await updateEntry(params.id!, data);

    return new Response(JSON.stringify(entry), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating entry:', error);
    return new Response(JSON.stringify({ error: 'Failed to update entry' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ params, cookies }) => {
  // Auth check
  if (!await requireAuth(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await deleteEntry(params.id!);

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting entry:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete entry' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```

### POST Endpoint with Request Body (protected)

```typescript
// src/pages/api/entries/index.ts

import type { APIRoute } from 'astro';
import { createEntry, type CreateEntryRequest } from '@/lib/services/entries';
import { requireAuth } from '@/lib/services/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  // Auth check
  if (!await requireAuth(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const data: CreateEntryRequest = await request.json();

    // Validation
    if (!data.name || !data.type) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const entry = await createEntry(data);

    return new Response(JSON.stringify(entry), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating entry:', error);
    return new Response(JSON.stringify({ error: 'Failed to create entry' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```

### File Upload Endpoint (protected)

```typescript
// src/pages/api/images/upload.ts

import type { APIRoute } from 'astro';
import { saveImage } from '@/lib/services/images';
import { requireAuth } from '@/lib/services/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  // Auth check
  if (!await requireAuth(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    const slug = formData.get('slug') as string;

    if (!file || !type || !slug) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const filename = await saveImage(file, type, slug);

    return new Response(JSON.stringify({ filename }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return new Response(JSON.stringify({ error: 'Failed to upload image' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```

### Service Layer Template

```typescript
// src/lib/services/[name].ts

import { readFile, writeFile, readdir, unlink } from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

const DATA_DIR = import.meta.env.DATA_DIR || '/var/www/data';
const CONTENT_DIR = path.join(DATA_DIR, 'content');

// Types
export interface Entry {
  slug: string;
  type: string;
  name: string;
  rating: number;
  status: 'draft' | 'active' | 'inactive';
  date: string;
  content: string;
  // ... additional fields
}

export interface CreateEntryRequest {
  type: string;
  name: string;
  rating: number;
  content: string;
  // ... additional fields
}

// Functions
export async function getEntries(type: string): Promise<Entry[]> {
  const dir = path.join(CONTENT_DIR, type);
  const files = await readdir(dir);

  const entries = await Promise.all(
    files
      .filter((f) => f.endsWith('.md'))
      .map(async (file) => {
        const filePath = path.join(dir, file);
        const fileContent = await readFile(filePath, 'utf-8');
        const { data, content } = matter(fileContent);
        return {
          slug: file.replace('.md', ''),
          ...data,
          content,
        } as Entry;
      })
  );

  return entries.filter((e) => e.status === 'active');
}

export async function getEntry(id: string): Promise<Entry | null> {
  // Parse id format: "type/slug" or find by slug
  // Implementation...
}

export async function createEntry(data: CreateEntryRequest): Promise<Entry> {
  // Generate slug, create file
  // Implementation...
}

export async function updateEntry(id: string, data: Partial<Entry>): Promise<Entry> {
  // Read, update, write file
  // Implementation...
}

export async function deleteEntry(id: string): Promise<void> {
  // Delete file (or soft-delete by setting status: inactive)
  // Implementation...
}
```

## HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success (GET, PUT) |
| 201 | Created (POST) |
| 204 | No Content (DELETE) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (auth failed) |
| 404 | Not Found |
| 500 | Internal Server Error |

## API Response Format

**Success:**
```json
{
  "slug": "maelzer-brauhaus",
  "name": "Mälzer Brauhaus",
  "rating": 4.5,
  ...
}
```

**Error:**
```json
{
  "error": "Human-readable error message"
}
```

**List:**
```json
[
  { "slug": "...", "name": "...", ... },
  { "slug": "...", "name": "...", ... }
]
```

## Endpoint Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/entries` | No | List entries (filter by type) |
| POST | `/api/entries` | Yes | Create entry |
| GET | `/api/entries/[id]` | No | Get single entry |
| PUT | `/api/entries/[id]` | Yes | Update entry |
| DELETE | `/api/entries/[id]` | Yes | Delete entry |
| POST | `/api/voice/transcribe` | Yes | Audio → Text |
| POST | `/api/voice/generate` | Yes | Text → Markdown |
| POST | `/api/images/upload` | Yes | Upload image |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/logout` | Yes | Logout |

## Checklist Before Completion

- [ ] Endpoint follows REST conventions
- [ ] Auth check applied to protected endpoints
- [ ] Request validation in place
- [ ] Error handling with appropriate status codes
- [ ] Service function created/updated
- [ ] TypeScript types defined
- [ ] Response format is consistent (JSON)
