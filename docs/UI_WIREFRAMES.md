# UI Wireframes - Eat, Hike & Art

## Overview

This document describes the user interface structure using text-based wireframes. The design follows a mobile-first, responsive approach with a modern, high-quality aesthetic.

---

## Site Map

```
Public
├── / (Homepage)
├── /restaurants
│   ├── /restaurants/[slug]
│   └── /restaurants/bestenliste
├── /kunst
│   ├── /kunst/[slug]
│   └── /kunst/bestenliste
├── /touren
│   ├── /touren/[slug]
│   └── /touren/bestenliste
└── /impressum

Admin (protected)
├── /admin (Dashboard)
├── /admin/login
├── /admin/eintraege
│   ├── /admin/eintraege/neu
│   └── /admin/eintraege/[id]
└── /admin/logout
```

---

## Design Tokens

| Element | Value |
|---------|-------|
| Primary Color | Warm amber/gold (Lüneburg brick) |
| Font Headings | Serif (elegant, editorial) |
| Font Body | Sans-serif (readable) |
| Border Radius | Subtle rounded corners |
| Shadows | Soft, layered |
| Gable Icon | Custom SVG of Lüneburg gable |

---

## Public Pages

### Homepage (`/`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                              HEADER                                  │   │
│  │  ┌──────────┐                                    ┌────┬────┬────┐   │   │
│  │  │  Logo    │    Eat, Hike & Art                 │Rest│Kunst│Tour│   │   │
│  │  └──────────┘                                    └────┴────┴────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                              HERO                                    │   │
│  │                                                                      │   │
│  │           Unsere Lieblingsorte in und um Lüneburg                   │   │
│  │                                                                      │   │
│  │              Restaurants • Kunst • Wanderungen                       │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│     Neueste Einträge                                                        │
│     ───────────────                                                         │
│                                                                             │
│  ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐   │
│  │ ┌─────────────────┐ │ │ ┌─────────────────┐ │ │ ┌─────────────────┐ │   │
│  │ │                 │ │ │ │                 │ │ │ │                 │ │   │
│  │ │      Image      │ │ │ │      Image      │ │ │ │      Image      │ │   │
│  │ │                 │ │ │ │                 │ │ │ │                 │ │   │
│  │ └─────────────────┘ │ │ └─────────────────┘ │ │ └─────────────────┘ │   │
│  │  Restaurant          │ │  Kunst              │ │  Tour               │   │
│  │  Mälzer Brauhaus     │ │  C.D. Friedrich     │ │  Elbe-Radweg        │   │
│  │  ⌂⌂⌂⌂½              │ │  ⌂⌂⌂⌂⌂             │ │  ⌂⌂⌂⌂              │   │
│  │  deutsch • Lüneburg  │ │  Hamburger Kunsth.  │ │  55 km • leicht     │   │
│  └─────────────────────┘ └─────────────────────┘ └─────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                              FOOTER                                  │   │
│  │     © 2025 Eat, Hike & Art  •  Impressum                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Components:**
- Header with logo and navigation
- Hero section with tagline
- 3 latest entries as cards (responsive grid)
- Footer with copyright and impressum link

---

### Category Listing (`/restaurants`, `/kunst`, `/touren`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              HEADER                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│     Restaurants                                          [Zur Bestenliste →]│
│     ═══════════                                                             │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ┌───────────┐                                                        │   │
│  │ │           │  Mälzer Brau- und Tafelhaus                           │   │
│  │ │   Image   │  ⌂⌂⌂⌂½  •  deutsch  •  Lüneburg                      │   │
│  │ │           │  04. Januar 2025                                       │   │
│  │ └───────────┘                                                        │   │
│  │  Das Mälzer überzeugt mit rustikaler Atmosphäre und hausgebrauten   │   │
│  │  Bieren. Ein Muss für jeden Lüneburg-Besucher...                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ┌───────────┐                                                        │   │
│  │ │           │  Lüner Mühle                                          │   │
│  │ │   Image   │  ⌂⌂⌂⌂  •  international  •  Lüneburg                 │   │
│  │ │           │  28. Dezember 2024                                     │   │
│  │ └───────────┘                                                        │   │
│  │  Gehobene Küche mit Blick auf die historische Mühle...              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ┌───────────┐                                                        │   │
│  │ │           │  ...                                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│                              FOOTER                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Components:**
- Category title
- Link to leaderboard
- Entry cards (list view, sorted by date descending)
- Each card: image, title, rating, meta info, excerpt

---

### Entry Detail (`/restaurants/[slug]`, etc.)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              HEADER                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ← Zurück zu Restaurants                                                    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │                         HERO IMAGE                                   │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│     Mälzer Brau- und Tafelhaus                                              │
│     ══════════════════════════                                              │
│                                                                             │
│     ⌂⌂⌂⌂½  Gesamtbewertung                                                 │
│                                                                             │
│     ┌─────────────────────────────────────────┐                            │
│     │  Service      ⌂⌂⌂⌂     4.0             │                            │
│     │  Essen        ⌂⌂⌂⌂⌂   5.0             │                            │
│     │  Ambiente     ⌂⌂⌂⌂½   4.5             │                            │
│     │  Preis/Leist. ⌂⌂⌂⌂     4.0             │                            │
│     └─────────────────────────────────────────┘                            │
│                                                                             │
│     🏷️ deutsch  •  📍 Heiligengeiststraße 39, Lüneburg                      │
│     🔗 www.maelzer-lueneburg.de                                             │
│                                                                             │
│     ─────────────────────────────────────────                              │
│                                                                             │
│     Das Mälzer in der Lüneburger Altstadt ist eine Institution.            │
│     Die hausgebrauten Biere sind hervorragend, besonders das               │
│     dunkle Mälzer-Bräu.                                                    │
│                                                                             │
│     ## Essen                                                                │
│                                                                             │
│     Die Küche bietet deftige norddeutsche Hausmannskost. Die               │
│     Bratwurst mit Sauerkraut war perfekt, knusprig gegrillt                │
│     und würzig.                                                            │
│                                                                             │
│     ## Ambiente                                                             │
│                                                                             │
│     Rustikale Einrichtung mit viel Holz und Kupfer. Im Sommer              │
│     ist der Biergarten ein Highlight.                                       │
│                                                                             │
│     ─────────────────────────────────────────                              │
│                                                                             │
│     Galerie                                                                 │
│     ┌──────────┐ ┌──────────┐ ┌──────────┐                                 │
│     │  Thumb 1 │ │  Thumb 2 │ │  Thumb 3 │                                 │
│     └──────────┘ └──────────┘ └──────────┘                                 │
│                                                                             │
│     ─────────────────────────────────────────                              │
│     Veröffentlicht am 04. Januar 2025                                       │
│                                                                             │
│                              FOOTER                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Components:**
- Back link to category
- Hero image (full width)
- Title and overall rating
- Sub-ratings box (restaurants only)
- Meta info (cuisine, address, link)
- Markdown content (rendered)
- Image gallery (lightbox on click)
- Publication date

---

### Leaderboard (`/restaurants/bestenliste`, etc.)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              HEADER                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ← Zurück zu Restaurants                                                    │
│                                                                             │
│     Bestenliste Restaurants                                                 │
│     ═══════════════════════                                                 │
│                                                                             │
│     Filtern nach Küche:  [ Alle           ▼ ]                              │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  #1   ⌂⌂⌂⌂⌂                                                         │   │
│  │       Lüner Mühle                                                    │   │
│  │       international • Lüneburg                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  #2   ⌂⌂⌂⌂½                                                         │   │
│  │       Mälzer Brau- und Tafelhaus                                     │   │
│  │       deutsch • Lüneburg                                             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  #3   ⌂⌂⌂⌂                                                          │   │
│  │       Pizzeria Da Giovanni                                           │   │
│  │       italienisch • Lüneburg                                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ...                                                                        │
│                                                                             │
│                              FOOTER                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Components:**
- Back link
- Title
- Filter dropdown (restaurants only, by cuisine)
- Ranked list (sorted by rating descending)
- Each item: rank, rating, name, meta info

---

### Impressum (`/impressum`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              HEADER                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│     Impressum                                                               │
│     ═════════                                                               │
│                                                                             │
│     Angaben gemäß § 5 TMG                                                  │
│                                                                             │
│     [Name]                                                                  │
│     [Straße]                                                                │
│     [PLZ Ort]                                                               │
│                                                                             │
│     Kontakt                                                                 │
│     ───────                                                                 │
│     E-Mail: [email]                                                         │
│                                                                             │
│     Haftungsausschluss                                                      │
│     ──────────────────                                                      │
│     [Standard legal text...]                                                │
│                                                                             │
│                              FOOTER                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Admin Pages

### Login (`/admin/login`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                                                                             │
│                                                                             │
│                    ┌─────────────────────────────────┐                     │
│                    │                                 │                     │
│                    │        Eat, Hike & Art          │                     │
│                    │           Admin                 │                     │
│                    │                                 │                     │
│                    │  ┌───────────────────────────┐  │                     │
│                    │  │  Passwort                 │  │                     │
│                    │  └───────────────────────────┘  │                     │
│                    │                                 │                     │
│                    │  ┌───────────────────────────┐  │                     │
│                    │  │        Anmelden           │  │                     │
│                    │  └───────────────────────────┘  │                     │
│                    │                                 │                     │
│                    └─────────────────────────────────┘                     │
│                                                                             │
│                                                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Components:**
- Centered card
- Logo/title
- Password input
- Login button
- Error message (if wrong password)

---

### Admin Dashboard (`/admin`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Admin  │  Einträge  │  Zur Website →                    [Abmelden] │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│     Dashboard                                                               │
│     ═════════                                                               │
│                                                                             │
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐         │
│  │                   │ │                   │ │                   │         │
│  │   12              │ │    3              │ │    2              │         │
│  │   Restaurants     │ │    Entwürfe       │ │    Inaktiv        │         │
│  │                   │ │                   │ │                   │         │
│  └───────────────────┘ └───────────────────┘ └───────────────────┘         │
│                                                                             │
│  ┌───────────────────┐ ┌───────────────────┐                               │
│  │                   │ │                   │                               │
│  │    8              │ │    5              │                               │
│  │    Kunst          │ │    Touren         │                               │
│  │                   │ │                   │                               │
│  └───────────────────┘ └───────────────────┘                               │
│                                                                             │
│     ─────────────────────────────────────────                              │
│                                                                             │
│     Schnellzugriff                                                          │
│                                                                             │
│     ┌─────────────────────────────────────────────────────────────────┐    │
│     │  + Neuer Eintrag (Spracheingabe)                                │    │
│     └─────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│     ┌─────────────────────────────────────────────────────────────────┐    │
│     │  + Neuer Eintrag (manuell)                                      │    │
│     └─────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│     ─────────────────────────────────────────                              │
│                                                                             │
│     Letzte Entwürfe                                                         │
│                                                                             │
│     • Pizzeria Bella Italia (Restaurant) - vor 2 Stunden     [Bearbeiten]  │
│     • Schiller-Ausstellung (Kunst) - vor 1 Tag               [Bearbeiten]  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Components:**
- Admin header with navigation
- Stats cards (count per category, drafts, inactive)
- Quick actions (new entry via voice/manual)
- Recent drafts list

---

### Entry List (`/admin/eintraege`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Admin  │  Einträge  │  Zur Website →                         [Abmelden]   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│     Einträge                                        [+ Neuer Eintrag ▼]    │
│     ════════                                                                │
│                                                                             │
│     Filter: [ Alle Kategorien ▼ ]  [ Alle Status ▼ ]   🔍 Suche...         │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ● Aktiv     Mälzer Brauhaus              Restaurant    04.01.2025  │   │
│  │              ⌂⌂⌂⌂½  deutsch                              [Bearb.]  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ○ Entwurf   Pizzeria Bella Italia        Restaurant    04.01.2025  │   │
│  │              ⌂⌂⌂⌂  italienisch                           [Bearb.]  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ● Aktiv     C.D. Friedrich Wanderer      Kunst         02.01.2025  │   │
│  │              ⌂⌂⌂⌂⌂  Hamburger Kunsthalle                 [Bearb.]  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ◌ Inaktiv   Alte Pizzeria               Restaurant    15.12.2024  │   │
│  │              ⌂⌂⌂  italienisch                            [Bearb.]  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ...                                                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Components:**
- New entry button (dropdown: voice/manual)
- Filters (category, status)
- Search input
- Entry list with status indicator, title, category, date
- Edit link per entry

---

### New Entry - Voice (`/admin/eintraege/neu?mode=voice`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Admin  │  Einträge  │  Zur Website →                         [Abmelden]   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ← Zurück                                                                   │
│                                                                             │
│     Neuer Eintrag per Sprache                                               │
│     ═════════════════════════                                               │
│                                                                             │
│     Schritt 1: Kategorie wählen                                             │
│                                                                             │
│     ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                        │
│     │ Restaurant  │ │    Kunst    │ │    Tour     │                        │
│     │     ✓       │ │             │ │             │                        │
│     └─────────────┘ └─────────────┘ └─────────────┘                        │
│                                                                             │
│     ─────────────────────────────────────────                              │
│                                                                             │
│     Schritt 2: Bewertung einsprechen                                        │
│                                                                             │
│     Sprich deine Bewertung frei ein. Nenne den Namen,                      │
│     deine Eindrücke und Bewertungen.                                        │
│                                                                             │
│                    ┌───────────────────┐                                   │
│                    │                   │                                   │
│                    │        🎤         │                                   │
│                    │                   │                                   │
│                    │  Aufnahme starten │                                   │
│                    │                   │                                   │
│                    └───────────────────┘                                   │
│                                                                             │
│     ─────────────────────────────────────────                              │
│                                                                             │
│     Schritt 3: Vorschau prüfen                                              │
│                                                                             │
│     (erscheint nach Verarbeitung)                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**After Recording:**

```
│     Schritt 3: Vorschau prüfen                                              │
│                                                                             │
│     ┌─────────────────────────────────────────────────────────────────┐    │
│     │  Name: Pizzeria Bella Italia                                     │    │
│     │  Bewertung: ⌂⌂⌂⌂  (4.0)                                         │    │
│     │  Küche: italienisch                                              │    │
│     │                                                                  │    │
│     │  Service: ⌂⌂⌂⌂    Essen: ⌂⌂⌂⌂    Ambiente: ⌂⌂⌂⌂½   P/L: ⌂⌂⌂   │    │
│     │                                                                  │    │
│     │  Die Pizzeria liegt etwas versteckt in der Altstadt...          │    │
│     └─────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│     ┌────────────────┐  ┌────────────────┐  ┌────────────────┐             │
│     │  ↻ Neu aufn.   │  │   Bearbeiten   │  │  Als Entwurf   │             │
│     │                │  │                │  │    speichern   │             │
│     └────────────────┘  └────────────────┘  └────────────────┘             │
```

**Components:**
- Category selection (radio buttons)
- Voice recorder (start/stop)
- Processing indicator
- Preview card with extracted data
- Actions: re-record, edit, save as draft

---

### Edit Entry (`/admin/eintraege/[id]`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Admin  │  Einträge  │  Zur Website →                         [Abmelden]   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ← Zurück                                                                   │
│                                                                             │
│     Eintrag bearbeiten                                     [Vorschau →]    │
│     ══════════════════                                                      │
│                                                                             │
│     Status                                                                  │
│     ┌───────────────────────────────────────────────────────────────────┐  │
│     │  ○ Entwurf     ● Aktiv     ○ Inaktiv                             │  │
│     └───────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│     ─────────────────────────────────────────                              │
│                                                                             │
│     Allgemein                                                               │
│                                                                             │
│     Name *                                                                  │
│     ┌───────────────────────────────────────────────────────────────────┐  │
│     │  Mälzer Brau- und Tafelhaus                                       │  │
│     └───────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│     Gesamtbewertung *                                                       │
│     ┌────┐                                                                  │
│     │ 4.5│  ⌂⌂⌂⌂½                                                         │
│     └────┘                                                                  │
│                                                                             │
│     Datum                                                                   │
│     ┌───────────────────────────────────────────────────────────────────┐  │
│     │  2025-01-04                                                        │  │
│     └───────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│     ─────────────────────────────────────────                              │
│                                                                             │
│     Restaurant-Details                                                      │
│                                                                             │
│     Küche *                                                                 │
│     ┌───────────────────────────────────────────────────────────────────┐  │
│     │  deutsch                                                           │  │
│     └───────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│     Bewertungen                                                             │
│     ┌──────────────────┐ ┌──────────────────┐                              │
│     │ Service    [ 4 ] │ │ Essen      [ 5 ] │                              │
│     └──────────────────┘ └──────────────────┘                              │
│     ┌──────────────────┐ ┌──────────────────┐                              │
│     │ Ambiente  [4.5]  │ │ Preis/L.   [ 4 ] │                              │
│     └──────────────────┘ └──────────────────┘                              │
│                                                                             │
│     Adresse                                                                 │
│     ┌───────────────────────────────────────────────────────────────────┐  │
│     │  Heiligengeiststraße 39, 21335 Lüneburg                           │  │
│     └───────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│     Website                                                                 │
│     ┌───────────────────────────────────────────────────────────────────┐  │
│     │  https://www.maelzer-lueneburg.de                                 │  │
│     └───────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│     ─────────────────────────────────────────                              │
│                                                                             │
│     Inhalt                                                                  │
│     ┌───────────────────────────────────────────────────────────────────┐  │
│     │  Das Mälzer in der Lüneburger Altstadt ist eine Institution.     │  │
│     │  Die hausgebrauten Biere sind hervorragend...                     │  │
│     │                                                                   │  │
│     │  ## Essen                                                         │  │
│     │                                                                   │  │
│     │  Die Küche bietet deftige norddeutsche Hausmannskost...          │  │
│     │                                                                   │  │
│     └───────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│     ─────────────────────────────────────────                              │
│                                                                             │
│     Bilder                                                                  │
│                                                                             │
│     ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│     │  hero    │ │  food-01 │ │  innen   │ │    +     │                    │
│     │    ✕     │ │    ✕     │ │    ✕     │ │  Upload  │                    │
│     └──────────┘ └──────────┘ └──────────┘ └──────────┘                    │
│                                                                             │
│     ─────────────────────────────────────────                              │
│                                                                             │
│     ┌───────────────────┐              ┌───────────────────┐               │
│     │     Speichern     │              │      Löschen      │               │
│     └───────────────────┘              └───────────────────┘               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Components:**
- Status toggle (draft/active/inactive)
- Common fields (name, rating, date)
- Category-specific fields (shown conditionally)
- Markdown editor for content
- Image gallery with upload/delete
- Save and delete buttons (delete with confirmation)

---

## Responsive Behavior

| Breakpoint | Layout Changes |
|------------|----------------|
| Mobile (<640px) | Single column, stacked cards, hamburger menu |
| Tablet (640-1024px) | 2-column grid for cards, sidebar navigation |
| Desktop (>1024px) | 3-column grid, full navigation |

---

## Component Library (shadcn/ui)

| Component | Usage |
|-----------|-------|
| `Button` | All actions |
| `Input` | Text fields |
| `Textarea` | Content editor |
| `Select` | Dropdowns (cuisine, status, category) |
| `RadioGroup` | Status selection, category selection |
| `Card` | Entry cards, stat cards |
| `Dialog` | Delete confirmation |
| `Toast` | Success/error notifications |
| `Slider` | Rating input (1-5, 0.5 steps) |

---

## Gable Rating Component

Custom component for displaying/inputting ratings:

```
Display Mode:
⌂⌂⌂⌂½   (4.5 / 5)

Input Mode:
┌─────────────────────────────────────┐
│  ○⌂  ○⌂  ○⌂  ○⌂  ○⌂               │
│  1    2    3    4    5              │
│         ────●────                   │  ← Slider at 4.5
└─────────────────────────────────────┘
```

The gable icon (⌂) is a custom SVG representing a Lüneburg brick gable.
