# ADR-001: File-based Storage with Markdown

**Status:** Accepted
**Date:** 2026-01-04
**Decision Makers:** Michael Schlottmann

## Context

The application needs to store review entries for three categories (Restaurants, Art, Tours) with different fields per category. Key requirements:

- ~50 entries per year (low volume)
- Voice-to-Publish workflow: Claude LLM creates entries from spoken German text
- Admin review process (draft → active)
- Content changes should be immediately live (no deploy required)
- SEO-optimized frontend (SSR)
- Self-hosted on Linux server

The central questions:
1. How should content be stored and managed?
2. Where should content and images physically live?

## Decision

**Use file-based storage with Markdown files and YAML frontmatter, stored outside the Git repository for runtime access.**

### Content Format

Each entry is stored as a `.md` file with structured metadata in the frontmatter and free-form content in the body.

```markdown
---
type: restaurant
name: "Mälzer Brau- und Tafelhaus"
rating: 4.5
cuisine: deutsch
ratings:
  service: 4
  food: 5
  ambiance: 4.5
  value: 4
address: "Heiligengeiststraße 39, Lüneburg"
link: "https://..."
status: draft
date: 2025-01-04
images:
  - maelzer-01.jpg
  - maelzer-02.jpg
---

Das Mälzer überzeugt mit seiner rustikalen Atmosphäre...
```

### Storage Location

Content and images are stored **outside the Git repository** for immediate publishing without deployment.

```
/var/www/
  eat-hike-art/                    ← Git repository (code only)
    src/
    public/
    astro.config.mjs
    package.json

  data/                            ← NOT in Git, persistent storage
    content/
      restaurants/
        2025-01-04-maelzer.md
        2025-01-02-lueners.md
      art/
        2025-01-03-kunsthalle.md
      tours/
        2024-12-28-elbe-radweg.md
    images/
      restaurants/
        maelzer/
          hero.jpg
          interior-01.jpg
      art/
      tours/
```

### What Goes Where

| Component | Location | In Git? | Changes via |
|-----------|----------|---------|-------------|
| Application code | `/var/www/eat-hike-art/` | ✅ Yes | git pull + deploy |
| Markdown content | `/var/www/data/content/` | ❌ No | Admin UI / Voice |
| Images | `/var/www/data/images/` | ❌ No | Admin UI upload |

### Runtime Content Access

Astro runs in SSR mode and reads content files at request time:

```typescript
// src/lib/services/entries.ts
import matter from 'gray-matter';
import { readFile, readdir, writeFile } from 'fs/promises';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR || '/var/www/data';
const CONTENT_DIR = path.join(DATA_DIR, 'content');

export async function getEntries(type: string) {
  const dir = path.join(CONTENT_DIR, type);
  const files = await readdir(dir);

  const entries = await Promise.all(
    files
      .filter(f => f.endsWith('.md'))
      .map(async (file) => {
        const content = await readFile(path.join(dir, file), 'utf-8');
        const { data, content: body } = matter(content);
        return { ...data, body, slug: file.replace('.md', '') };
      })
  );

  return entries.filter(e => e.status === 'active');
}
```

### Image Serving

Images are served via reverse proxy (Nginx/Caddy):

```nginx
server {
  location /images/ {
    alias /var/www/data/images/;
    expires 30d;
    add_header Cache-Control "public, immutable";
  }

  location / {
    proxy_pass http://localhost:4321;  # Astro
  }
}
```

### Backup Strategy

```bash
#!/bin/bash
# /etc/cron.daily/backup-eat-hike-art

BACKUP_DIR="/backups/eat-hike-art"
DATE=$(date +%Y-%m-%d)

tar -czf "$BACKUP_DIR/data-$DATE.tar.gz" /var/www/data/
find "$BACKUP_DIR" -name "data-*.tar.gz" -mtime +30 -delete
```

## Alternatives

### SQLite / PostgreSQL

| Pro | Contra |
|-----|--------|
| SQL queries for filtering | Requires INSERT/UPDATE for Voice-to-Publish |
| Standard tooling | Overkill for ~50 entries/year |
| | Admin UI required for content editing |

**Rejected because:** The Voice-to-Publish workflow is more natural with Markdown. Claude can generate a complete, human-readable file directly.

### Content in Git Repository

| Pro | Contra |
|-----|--------|
| Version control for content | Requires git commit + deploy for every change |
| Simple initial setup | Breaks Voice-to-Publish workflow |

**Rejected because:** Fundamentally incompatible with the desired admin workflow where content changes are immediately live.

### Headless CMS (Sanity, Contentful)

| Pro | Contra |
|-----|--------|
| Admin UI out-of-the-box | Vendor lock-in |
| Image handling built-in | Custom Voice-to-Publish integration needed |

**Rejected because:** Adds external dependency, less control.

### Cloud Storage for Images (S3, R2)

| Pro | Contra |
|-----|--------|
| Unlimited scale | External dependency |
| CDN-ready | Additional cost and complexity |

**Rejected because:** ~250 images/year (~125 MB) is trivial for local storage. Can migrate later if needed.

## Consequences

### Positive

- **Natural Voice-to-Publish**: Claude generates complete Markdown files directly
- **Immediate publishing**: Content changes are live without deployment
- **Human-readable content**: Files can be edited with any text editor
- **Clean Git repository**: Only code, no content or binary files
- **Simple backup**: One directory contains all user data
- **No external dependencies**: Everything on one server
- **Maximum simplicity**: Aligns with KISS principle

### Negative

- **No content versioning**: No automatic Git history for content changes
- **SSR required**: Cannot use pure static generation
- **Filtering/sorting in code**: No SQL WHERE clause; must parse frontmatter
- **Manual backup responsibility**: Must set up backup cron job

### Mitigations

- Use a content library (`gray-matter`) for parsing frontmatter
- Implement soft-delete (`status: inactive`) instead of hard delete
- Daily automated backups with retention policy
- Store images in organized directory structure: `images/{type}/{slug}/`
