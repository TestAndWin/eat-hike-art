# CLAUDE.md - Eat, Hike & Art

## Project Overview

Web application for a couple from Lüneburg to review:
- Restaurants
- Art exhibitions
- Hiking/City tours

Rating system: 1-5 Lüneburg Gables as symbol (half gables allowed: 1, 1.5, 2, ... 5).

## Language Policy
- **Frontend/UI**: German
- **Source code, comments, documentation**: English

## Current Phase: Implementation

**Status:** Active development

### Guidelines
- Follow architecture decisions documented in ADRs
- Use skills for recurring tasks (`/create-component`, `/create-api-endpoint`)
- Use plugins for workflow (`/commit`, `/commit-push-pr`)
- **After completing work**: Use `/simplify` and `/verify` to ensure code quality
- Write code in English, UI text in German
- Keep it simple (KISS, YAGNI)

## Architecture Decisions

| Bereich | Entscheidung | ADR |
|---------|--------------|-----|
| Storage | File-based Markdown, Runtime außerhalb Git | [ADR-001](docs/adr/001-file-based-storage-with-markdown.md) |
| Frontend | Astro + React Islands | [ADR-002](docs/adr/002-astro-frontend-framework.md) |
| Styling | Tailwind CSS + shadcn/ui | [ADR-003](docs/adr/003-tailwind-css-with-shadcn-ui.md) |
| Backend | Astro Server Endpoints + Service Layer | [ADR-004](docs/adr/004-astro-server-endpoints-with-service-layer.md) |
| Auth | Simple Password + Session Cookie | [ADR-005](docs/adr/005-simple-password-authentication.md) |
| Voice | Whisper API + Claude API | [ADR-006](docs/adr/006-voice-to-publish-with-whisper-and-claude.md) |
| Hosting | Self-hosted Linux | - |

## Architecture Principles

Consider for all decisions:
- **Form Follows Function** - Choose technology matching requirements
- **KISS** - Keep It Simple Stupid
- **YAGNI** - You Ain't Gonna Need It
- **DRY** - Don't Repeat Yourself
- **SOLID** - Where applicable
- **Convention over Configuration**

## Coding Conventions

### Page Layout Pattern

All pages using `BaseLayout` must wrap their content in a `container` class for proper horizontal spacing:

```astro
<BaseLayout title="Page Title">
  <div class="container py-8 md:py-12">
    <!-- Page content here -->
  </div>
</BaseLayout>
```

Or for article pages:

```astro
<BaseLayout title="Article Title">
  <article class="container py-8 md:py-12">
    <!-- Article content here -->
  </article>
</BaseLayout>
```

**Important:** The `BaseLayout` does NOT automatically add container padding to the main content area. Each page is responsible for its own container wrapper.

**Exception:** The homepage (`index.astro`) uses section-based containers for different visual sections.

## Design Philosophy

The visual design is inspired by an original abstract expressionist painting featuring:
- **Warm sand/cream base tones** - The background and card colors
- **Bold magenta accent splatters** - Primary actions, restaurant category
- **Olive/brown depth colors** - Text and tour category
- **Gold metallic highlights** - Kunst category and decorative accents
- **Horizontal spatula texture** - Subtle background patterns

When creating new UI elements, reference these artistic qualities rather than generic design patterns. The goal is a distinctive, personal aesthetic that reflects the owners' connection to art.

### Decorative Components

#### PaintSplatter

Use for artistic, organic decorations inspired by the painting's magenta dots:

```astro
import PaintSplatter from '@/components/PaintSplatter.astro';

<!-- Subtle splatters in corner -->
<PaintSplatter intensity="subtle" position="top-right" />

<!-- Bold splatters across full area -->
<PaintSplatter intensity="bold" position="full" class="opacity-60" />
```

**Props:**
| Prop | Values | Default |
|------|--------|---------|
| `intensity` | `subtle`, `medium`, `bold` | `medium` |
| `position` | `top-right`, `bottom-left`, `full` | `full` |
| `class` | any CSS classes | - |

**Location:** `src/components/PaintSplatter.astro`

### Brand Identity

- **Site name:** "Fünf Giebel" (displayed with "Giebel" in magenta)
- **Domain:** fuenfgiebel.de
- **Logo:** Gable icon (`/gable.svg`) + text, no background box
- **Tagline:** "Lüneburg" (subtitle under logo)
- **Primary color:** Magenta (#a31545)

### Giebel Rating Icons

The rating system uses three SVG files in `/public/`:

| File | Color | Usage |
|------|-------|-------|
| `gable.svg` | Magenta (#a31545) | Full rating point |
| `gable_half.svg` | Magenta + light pink overlay | Half rating point (0.5) |
| `gable_empty.svg` | Light pink (#deacbd) | Empty/unfilled rating point |

These are used by `src/components/GableRating.tsx` via `<img>` tags.

## Requirements Summary

### Functional
- Three categories with specific rating fields:
  - **Restaurants**: 4 sub-ratings (Service, Food, Ambiance, Value) + overall rating
  - **Art**: Overall rating only + museum/gallery, exhibition period
  - **Tours**: Overall rating only + distance, duration, difficulty (optional fields)
- All ratings support half-gables (0.5 increments)
- Homepage with 3 latest entries
- Category view (sorted by date)
- Leaderboard per category (Restaurants filterable by cuisine)
- Image gallery (multiple images per entry)
- Admin: CRUD, drafts, inactive marking (Soft Delete)
- **Voice-to-Publish Workflow** (Human-in-the-loop):
  1. Ingest: Admin speaks review via voice (German)
  2. Processing: LLM analyzes transcript → extracts data
  3. Draft: Entry is saved as DRAFT
  4. Review: Admin checks/corrects → sets to ACTIVE

### Non-functional
- Responsive design
- SEO-optimized (SSR/SSG)
- Fast loading times
- Modern, high-quality design
- Expected volume: ~50 entries per year

### Users & Interaction
- Only the two owners write reviews (no additional authors planned)
- No public comments or user ratings

### Planned Extensions (Phase 2)
- Map integration for tours (GPX track, interactive map)

## Skills Strategy

### Principle
The architecture should be "skill-friendly":
- Consistent file and folder structure
- Clear naming conventions
- Predictable patterns for recurring tasks

### Available Skills

#### Creation Skills
- **create-adr**: Create Architecture Decision Record (`.claude/skills/create-adr/`)
- **create-component**: Create Astro/React component with design system (`.claude/skills/create-component/`)
- **create-api-endpoint**: Create REST API endpoint with service layer (`.claude/skills/create-api-endpoint/`)

#### Quality Assurance Skills
- **simplify**: Review code for unnecessary complexity, ensure KISS/YAGNI principles (`.claude/skills/simplify/`)
- **verify**: Run build checks, test API endpoints, verify UI rendering (`.claude/skills/verify/`)

## Claude Code Plugins

### Recommended Plugins

Install from: https://github.com/anthropics/claude-code/tree/main/plugins

#### 1. frontend-design

**Purpose:** Creates production-grade frontend interfaces with distinctive design.

**Features:**
- Bold aesthetic choices (avoids generic AI look)
- Distinctive typography and color palettes
- High-impact animations and visual details
- Context-aware implementation

**Usage:** Automatically applied when working on frontend code. Just describe what you need:
```
"Create a dashboard for restaurant entries"
"Build the homepage with latest entries"
"Design the admin settings panel"
```

**Why for this project:** Essential for achieving the "modern, high-quality design" requirement.

---

#### 2. commit-commands

**Purpose:** Streamlines git workflow with slash commands.

**Commands:**

| Command | Description |
|---------|-------------|
| `/commit` | Analyzes changes, drafts message matching repo style, commits |
| `/commit-push-pr` | Creates branch, commits, pushes, creates PR with summary |
| `/clean_gone` | Removes local branches deleted from remote |

**Usage:**
```bash
# Quick commit during development
/commit

# Ready to create a pull request
/commit-push-pr

# Clean up after merging PRs
/clean_gone
```

**Requirements:**
- Git installed and configured
- GitHub CLI (`gh`) for `/commit-push-pr`

**Why for this project:** Faster development workflow, consistent commit messages.

---

#### 3. security-guidance

**Purpose:** Security reminder hook that warns about potential vulnerabilities.

**What it detects:**
- Command injection risks
- XSS vulnerabilities
- `eval()` usage
- Dangerous HTML patterns
- Other OWASP concerns

**Usage:** Automatically activates when editing files. Shows warnings when security issues are detected.

**Why for this project:** Important for Admin area with user input (forms, file uploads, auth).


## Documentation

| Document | Description |
|----------|-------------|
| `docs/adr/` | 6 Architecture Decision Records |
| `docs/TECH_STACK.md` | Tech stack, dependencies, project structure |
| `docs/DOMAIN_MODEL.md` | Data model, TypeScript interfaces, file format |
| `docs/UI_WIREFRAMES.md` | Screen descriptions, component mapping |

## Implementation Roadmap

### Phase 1: Project Setup ✅
- [x] Initialize Astro project with Node adapter
- [x] Configure Tailwind CSS
- [x] Set up React integration
- [x] Install shadcn/ui components (button, input, card)
- [x] Create directory structure
- [x] Set up environment variables (.env.example)

### Phase 2: Core Infrastructure ✅
- [x] Create base layouts (public) - BaseLayout.astro
- [x] Create admin layout - AdminLayout.astro with sidebar navigation
- [x] Implement auth service (login, session) - Argon2 password, file-based sessions
- [x] Implement entries service (CRUD for Markdown files) - gray-matter parsing
- [x] Create GableRating component - React component with half-gable support

### Phase 3: Public Pages ✅
- [x] Homepage (latest 3 entries) - EntryCard component, getLatestEntries()
- [x] Category listings (restaurants, art, tours) - /restaurants, /kunst, /touren
- [x] Entry detail pages - Dynamic [slug].astro routes with SSR
- [x] Leaderboards - /[category]/bestenliste, Restaurant cuisine filter
- [x] Impressum - /impressum with placeholder content

### Phase 4: Admin Area ✅
- [x] Login page - /admin/login with password form
- [x] Admin dashboard - /admin with stats overview
- [x] Entry list with filters - /admin/entries with type/status filters
- [x] Entry create/edit form - /admin/entries/new, /admin/entries/[type]/[slug]
- [x] Image upload - /api/images/upload, ImageUploadSection component

### Phase 5: Polish ✅
- [x] SEO optimization (Open Graph, Twitter Cards, canonical URLs, sitemap.xml, robots.txt)
- [x] Performance optimization (font-display: swap already configured)
- [x] Imprint page

### Phase 5.5: Assets ✅
- [x] Giebel SVG upload and use (gable.svg, gable_half.svg, gable_empty.svg)
- [x] Domain name: fuenfgiebel.de
- [x] Favicon: /favicon.svg using gable design
- [x] /impressum (placeholder data replace)
- [x] Self-hosted fonts via @fontsource (DM Sans, Playfair Display)

### Phase 6: Deploy ✅
- [x] Dockerfile (multi-stage build, Node 22 Alpine)
- [x] Kubernetes manifests (namespace, configmap, secret, pvc, deployment, service, ingress)
- [x] deploy.sh helper script for minikube
- [ ] Semantic versioning

### Phase 7: Voice-to-Publish
- [ ] Voice recorder component
- [ ] Whisper API integration
- [ ] Claude API integration
- [ ] Draft preview and editing

### Phase 8: Finalize
- [ ] Backup script
- [ ] README.md 

