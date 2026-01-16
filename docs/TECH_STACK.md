# Tech Stack - Eat, Hike & Art

## Overview

| Layer | Technology | ADR |
|-------|------------|-----|
| Frontend | Astro (SSR) + React Islands | [ADR-002](adr/002-astro-frontend-framework.md) |
| Styling | Tailwind CSS | [ADR-003](adr/003-tailwind-css-with-shadcn-ui.md) |
| UI Components | shadcn/ui (React) | [ADR-003](adr/003-tailwind-css-with-shadcn-ui.md) |
| Backend/API | Astro Server Endpoints | [ADR-004](adr/004-astro-server-endpoints-with-service-layer.md) |
| Content Storage | Markdown + YAML frontmatter | [ADR-001](adr/001-file-based-storage-with-markdown.md) |
| Image Storage | Local filesystem | [ADR-001](adr/001-file-based-storage-with-markdown.md) |
| Authentication | Session Cookie | [ADR-005](adr/005-simple-password-authentication.md) |
| Speech-to-Text | OpenAI Whisper API | [ADR-006](adr/006-voice-to-publish-with-whisper-and-claude.md) |
| Content Generation | Claude API | [ADR-006](adr/006-voice-to-publish-with-whisper-and-claude.md) |
| Hosting | Self-hosted Linux | - |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                 Browser                                      │
│  ┌────────────────────────────┐  ┌────────────────────────────────────────┐ │
│  │     Public Pages           │  │           Admin Area                   │ │
│  │     (Astro SSR)            │  │        (React Islands)                 │ │
│  │                            │  │                                        │ │
│  │  • Homepage                │  │  • Login (shadcn/ui)                   │ │
│  │  • Category listings       │  │  • Entry CRUD forms                    │ │
│  │  • Entry details           │  │  • Voice recorder                      │ │
│  │  • Leaderboards            │  │  • Image upload                        │ │
│  │  • Impressum               │  │  • Draft review                        │ │
│  └────────────────────────────┘  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Nginx / Caddy                                     │
│                                                                              │
│   /images/*  →  /var/www/data/images/   (static files)                      │
│   /*         →  localhost:4321          (Astro SSR)                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Astro Application                                    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        src/pages/                                    │   │
│  │                                                                      │   │
│  │  Public Routes          API Endpoints           Admin Routes         │   │
│  │  ─────────────          ─────────────           ────────────         │   │
│  │  /                      /api/entries/*          /admin               │   │
│  │  /restaurants           /api/voice/*            /admin/entries       │   │
│  │  /kunst                 /api/images/*           /admin/new           │   │
│  │  /touren                /api/auth/*             /admin/edit/[id]     │   │
│  │  /[category]/[slug]                                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        src/lib/services/                             │   │
│  │                                                                      │   │
│  │  entries.ts    →  CRUD operations on Markdown files                  │   │
│  │  voice.ts      →  Whisper API + Claude API integration               │   │
│  │  images.ts     →  Image upload and management                        │   │
│  │  auth.ts       →  Session validation and password verification       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
          │                            │                            │
          ▼                            ▼                            ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────────────┐
│  /var/www/data/  │     │   OpenAI API     │     │     Anthropic API        │
│                  │     │                  │     │                          │
│  content/        │     │  Whisper         │     │  Claude                  │
│    restaurants/  │     │  Speech-to-Text  │     │  Content Generation      │
│    art/          │     │                  │     │                          │
│    tours/        │     │  ~$0.90/year     │     │  ~$0.25/year             │
│  images/         │     │                  │     │                          │
│  sessions/       │     └──────────────────┘     └──────────────────────────┘
└──────────────────┘
```

---

## Dependencies

### Production

| Package | Purpose |
|---------|---------|
| `astro` | Core framework |
| `@astrojs/node` | Node.js adapter for SSR |
| `@astrojs/react` | React integration for Islands |
| `@astrojs/tailwind` | Tailwind CSS integration |
| `react` | UI library for admin components |
| `react-dom` | React DOM renderer |
| `tailwindcss` | Utility-first CSS |
| `gray-matter` | Parse Markdown frontmatter |
| `marked` | Convert Markdown body to HTML |
| `@tailwindcss/typography` | Prose styling for rendered HTML |
| `openai` | Whisper API client |
| `@anthropic-ai/sdk` | Claude API client |
| `argon2` | Password hashing |

### Development

| Package | Purpose |
|---------|---------|
| `typescript` | Type safety |
| `@types/react` | React type definitions |
| `prettier` | Code formatting |
| `prettier-plugin-astro` | Astro formatting |
| `prettier-plugin-tailwindcss` | Tailwind class sorting |

### shadcn/ui Components (copy-paste, not npm)

| Component | Usage |
|-----------|-------|
| `button` | All buttons |
| `input` | Form inputs |
| `textarea` | Multiline text |
| `select` | Dropdowns (cuisine, category) |
| `dialog` | Modals (confirm delete) |
| `card` | Entry cards |
| `form` | Form wrapper with validation |
| `toast` | Notifications |

---

## Markdown Processing

Entry content is stored as Markdown files with YAML frontmatter. The processing pipeline:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Markdown File  │ ──▶ │   gray-matter   │ ──▶ │     marked      │
│                 │     │                 │     │                 │
│  ---            │     │  Extracts:      │     │  Converts:      │
│  name: ...      │     │  • frontmatter  │     │  • Markdown to  │
│  rating: 4.5    │     │  • body content │     │    HTML         │
│  ---            │     │                 │     │                 │
│  Review text... │     └─────────────────┘     └─────────────────┘
└─────────────────┘
```

| Package | Purpose |
|---------|---------|
| `gray-matter` | Parses YAML frontmatter from markdown files |
| `marked` | Converts markdown body to HTML for rendering |
| `@tailwindcss/typography` | Provides `prose` classes for styled HTML content |

### Typography Customization

Custom settings in `tailwind.config.mjs`:

```javascript
typography: {
  DEFAULT: {
    css: {
      h2: {
        marginTop: '2em',
        marginBottom: '0.75em',
        fontWeight: '700',
      },
    },
  },
},
```

### Usage in Templates

```astro
<!-- Entry detail page -->
{entry.content && (
  <div class="prose prose-neutral max-w-none dark:prose-invert">
    <Fragment set:html={entry.content} />
  </div>
)}
```

---

## Directory Structure

```
eat-hike-art/
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   ├── EntryCard.astro        # Public entry card
│   │   ├── GableRating.tsx        # Rating display (1-5 gables)
│   │   ├── ImageGallery.astro     # Image gallery
│   │   └── admin/                 # React admin components
│   │       ├── EntryForm.tsx
│   │       ├── VoiceRecorder.tsx
│   │       ├── ImageUpload.tsx
│   │       └── LoginForm.tsx
│   ├── layouts/
│   │   ├── BaseLayout.astro       # Public layout
│   │   └── AdminLayout.astro      # Admin layout
│   ├── pages/
│   │   ├── index.astro            # Homepage (latest 3)
│   │   ├── restaurants/
│   │   │   ├── index.astro        # Restaurant listing
│   │   │   ├── [slug].astro       # Restaurant detail
│   │   │   └── bestenliste.astro  # Leaderboard
│   │   ├── art/
│   │   │   └── ...
│   │   ├── tours/
│   │   │   └── ...
│   │   ├── impressum.astro
│   │   ├── admin/
│   │   │   ├── index.astro        # Admin dashboard
│   │   │   ├── login.astro        # Login page
│   │   │   ├── entries/
│   │   │   │   ├── index.astro    # Entry list
│   │   │   │   ├── new.astro      # New entry (voice/manual)
│   │   │   │   └── [id].astro     # Edit entry
│   │   │   └── ...
│   │   └── api/
│   │       ├── entries/
│   │       │   ├── index.ts       # GET (list), POST (create)
│   │       │   └── [id].ts        # GET, PUT, DELETE
│   │       ├── voice/
│   │       │   ├── transcribe.ts  # POST: audio → text
│   │       │   └── generate.ts    # POST: text → markdown
│   │       ├── images/
│   │       │   └── upload.ts      # POST: image upload
│   │       └── auth/
│   │           ├── login.ts       # POST: login
│   │           └── logout.ts      # POST: logout
│   ├── lib/
│   │   ├── services/
│   │   │   ├── entries.ts         # Content CRUD
│   │   │   ├── voice.ts           # Whisper + Claude
│   │   │   ├── images.ts          # Image handling
│   │   │   └── auth.ts            # Authentication
│   │   └── utils/
│   │       ├── markdown.ts        # Frontmatter helpers
│   │       └── slugify.ts         # URL slug generation
│   └── styles/
│       └── globals.css            # Tailwind imports + custom
├── public/
│   ├── favicon.svg               # Site favicon (gable icon)
│   ├── gable.svg                 # Full gable (magenta)
│   ├── gable_half.svg            # Half gable (for 0.5 ratings)
│   └── gable_empty.svg           # Empty gable (light pink)
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── package.json
└── .env.example

# External data directory (NOT in Git)
/var/www/data/
├── content/
│   ├── restaurants/
│   │   └── 2025-01-04-maelzer.md
│   ├── art/
│   └── tours/
├── images/
│   ├── restaurants/
│   │   └── maelzer/
│   │       ├── hero.jpg
│   │       └── interior-01.jpg
│   ├── art/
│   └── tours/
└── sessions/
    └── abc123-def456.json
```

---

## Static Assets

### Favicon

- **Location:** `/public/favicon.svg`
- **Design:** Lüneburger Giebel in magenta (#a31545)
- **Referenced in:** `BaseLayout.astro`, `AdminLayout.astro`, `login.astro`

### Rating Icons

The Giebel rating system uses three SVG files in `/public/`:

| File | Color | Usage |
|------|-------|-------|
| `gable.svg` | Magenta (#a31545) | Full rating point |
| `gable_half.svg` | Magenta + light pink overlay | Half rating point (0.5) |
| `gable_empty.svg` | Light pink (#deacbd) | Empty/unfilled rating point |

These are used by `src/components/GableRating.tsx` via `<img>` tags for optimal simplicity and maintainability.

---

## Environment Variables

```bash
# .env (not committed to Git)

# Data directory
DATA_DIR=/var/www/data

# Authentication
ADMIN_PASSWORD_HASH=$argon2id$v=19$m=65536,t=3,p=4$...

# External APIs
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Optional
NODE_ENV=production
PORT=4321
```

---

## Hosting Setup

### Server Requirements

- Linux (Ubuntu/Debian recommended)
- Node.js 20+
- Nginx or Caddy (reverse proxy)
- ~1 GB disk space (grows ~125 MB/year)

### Deployment

```bash
# Clone and install
git clone <repo> /var/www/eat-hike-art
cd /var/www/eat-hike-art
npm install

# Build
npm run build

# Run with PM2
pm2 start npm --name "eat-hike-art" -- run start
pm2 save
```

### Nginx Config

```nginx
server {
    listen 80;
    server_name eat-hike-art.de;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name eat-hike-art.de;

    ssl_certificate /etc/letsencrypt/live/eat-hike-art.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/eat-hike-art.de/privkey.pem;

    # Static images from data directory
    location /images/ {
        alias /var/www/data/images/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Astro application
    location / {
        proxy_pass http://localhost:4321;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Design System

### Typography

| Role | Font | Usage |
|------|------|-------|
| Headlines | Playfair Display | h1, h2, h3, Kategorie-Titel |
| Body | DM Sans | Fließtext, Buttons, Navigation |

Fonts werden via Google Fonts geladen (Import in `src/styles/globals.css`).

### Color Palette (Painting-Inspired)

The color scheme is derived from an original abstract expressionist painting, giving the site a unique, personal aesthetic. The painting features warm sand tones, olive depths, gold highlights, and striking magenta paint splatters.

| Token | HSL | Hex | Usage |
|-------|-----|-----|-------|
| `--primary` (Magenta) | 340 78% 36% | #A31545 | Primary actions, CTAs, Restaurants category |
| `--background` (Cream) | 40 45% 94% | #F0EBE0 | Page background |
| `--foreground` (Olive) | 60 12% 18% | #302F28 | Primary text |
| `--magenta` | 340 78% 36% | #A31545 | Accent splatters, Restaurants |
| `--gold` | 45 53% 54% | #C9A84C | Highlights, Kunst category |
| `--olive` | 60 12% 30% | #4A4A3A | Text, Touren category |
| `--sand` | 37 30% 74% | #D4C4A8 | Secondary backgrounds |
| `--cream` | 40 45% 94% | #F0EBE0 | Light backgrounds |

#### Category Color Mapping

Each content category has an assigned accent color from the painting:

| Category | Color Token | Badge Class |
|----------|-------------|-------------|
| Restaurants | `magenta` | `.badge-restaurant` |
| Kunst | `gold` | `.badge-kunst` |
| Touren | `olive` | `.badge-tour` |

### Custom CSS Utilities

| Class | Purpose |
|-------|---------|
| `.grain-overlay` | Canvas-like texture over entire page |
| `.card-hover` | Lift effect on hover (-translate-y-1, shadow) |
| `.image-hover` | Zoom effect on images (scale-105) |
| `.badge-restaurant` | Magenta badge for Restaurants |
| `.badge-kunst` | Gold badge for Kunst |
| `.badge-tour` | Olive badge for Touren |
| `.stagger-1` to `.stagger-6` | Animation delays (0.1s - 0.6s) |
| `.brush-underline` | Gradient underline mimicking a brush stroke |

### Animations

| Animation | Keyframes | Usage |
|-----------|-----------|-------|
| `fade-up` | opacity 0→1, translateY 20px→0 | Page load reveals |
| `fade-in` | opacity 0→1 | Simple fades |
| `slide-in` | opacity + translateX | Navigation items |
| `scale-in` | opacity + scale 0.95→1 | Modal/Dialog entry |

**Timing Function:** `ease-out-expo` (cubic-bezier(0.16, 1, 0.3, 1)) für elegante Übergänge.

**Grain Overlay:** Verwendet SVG noise filter mit `mix-blend-mode: multiply` für organisches, print-artiges Gefühl.

---

## Tailwind Gotchas

### Dynamische Klassen vermeiden

Tailwind generiert nur Klassen, die als **vollständige Strings** im Quellcode vorkommen. Dynamische Interpolation funktioniert nicht:

```javascript
// FALSCH - Tailwind erkennt diese Klassen nicht
const color = 'terracotta';
<div class={`bg-${color}/10`}>      // wird nicht generiert
<div class={`text-${color}`}>       // wird nicht generiert

// RICHTIG - vollständige Klassennamen als Strings
const category = {
  bgClass: 'bg-terracotta/10',
  textClass: 'text-terracotta',
};
<div class={category.bgClass}>      // funktioniert
<div class={category.textClass}>    // funktioniert
```

**Alternative:** Klassen in `tailwind.config.mjs` unter `safelist` hinzufügen (nicht empfohlen für viele Klassen).

---

## Annual Costs

| Item | Cost |
|------|------|
| Domain | ~€10 |
| Server (existing) | €0 |
| Whisper API | ~$0.90 |
| Claude API | ~$0.25 |
| **Total** | **~€12/year** |
