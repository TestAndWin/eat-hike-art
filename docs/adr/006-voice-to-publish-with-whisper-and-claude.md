# ADR-006: Voice-to-Publish with Whisper and Claude

**Status:** Accepted
**Date:** 2026-01-04
**Decision Makers:** Michael Schlottmann

## Context

A key feature of the application is Voice-to-Publish: the admin speaks a review, and the system creates a structured Markdown entry from it.

Requirements:
- Voice input in German
- Extract structured data (name, ratings, category-specific fields)
- Generate complete Markdown file with frontmatter
- Save as draft for review before publishing
- Expected volume: ~50 entries per year

The workflow involves two distinct steps:
1. **Speech-to-Text**: Convert audio to German text
2. **Content Generation**: Convert text to structured Markdown

## Decision

**Use OpenAI Whisper API for speech-to-text and Claude API for content generation.**

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Admin Browser                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  1. Click "New Review"                               │   │
│  │  2. Select category (Restaurant/Art/Tour)            │   │
│  │  3. Click "Record" → MediaRecorder API               │   │
│  │  4. Speak review in German                           │   │
│  │  5. Click "Stop" → Send audio                        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Astro Server                             │
│                                                             │
│  POST /api/voice/transcribe                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  → Receive audio blob                                │   │
│  │  → Send to OpenAI Whisper API                        │   │
│  │  → Return German transcript                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                              │
│                              ▼                              │
│  POST /api/voice/generate                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  → Receive transcript + category                     │   │
│  │  → Send to Claude API with extraction prompt         │   │
│  │  → Claude returns structured Markdown                │   │
│  │  → Save as draft file                                │   │
│  │  → Return entry for preview                          │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  /var/www/data/content/restaurants/2025-01-04-maelzer.md   │
│  status: draft                                              │
└─────────────────────────────────────────────────────────────┘
```

### Speech-to-Text: Whisper API

```typescript
// src/lib/services/voice.ts
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  const file = new File([audioBuffer], 'audio.webm', { type: 'audio/webm' });

  const response = await openai.audio.transcriptions.create({
    model: 'whisper-1',
    file: file,
    language: 'de',
  });

  return response.text;
}
```

### Content Generation: Claude API

```typescript
// src/lib/services/voice.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateEntry(
  transcript: string,
  category: 'restaurant' | 'art' | 'tour'
): Promise<string> {
  const prompts = {
    restaurant: `
      Erstelle aus folgendem gesprochenen Text eine Restaurant-Bewertung.

      Extrahiere:
      - name: Name des Restaurants
      - rating: Gesamtbewertung (1-5, halbe Werte erlaubt)
      - ratings.service: Service-Bewertung (1-5)
      - ratings.food: Essen-Bewertung (1-5)
      - ratings.ambiance: Ambiente-Bewertung (1-5)
      - ratings.value: Preis-Leistung-Bewertung (1-5)
      - cuisine: Art der Küche (z.B. "italienisch", "deutsch")
      - address: Adresse falls genannt
      - link: Website falls genannt

      Gesprochener Text:
      "${transcript}"

      Antworte NUR mit einer vollständigen Markdown-Datei im folgenden Format:
      ---
      type: restaurant
      name: "..."
      rating: X.X
      cuisine: "..."
      ratings:
        service: X
        food: X
        ambiance: X
        value: X
      address: "..."
      link: "..."
      status: draft
      date: ${new Date().toISOString().split('T')[0]}
      images: []
      ---

      [Fließtext-Beschreibung basierend auf dem Gesprochenen]
    `,
    art: `...similar prompt for art exhibitions...`,
    tour: `...similar prompt for tours...`,
  };

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: prompts[category],
    }],
  });

  return response.content[0].text;
}
```

### API Endpoints

```typescript
// src/pages/api/voice/transcribe.ts
import { transcribeAudio } from '@/lib/services/voice';
import { requireAuth } from '@/lib/services/auth';

export async function POST({ request, cookies }) {
  if (!await requireAuth(cookies)) {
    return new Response(null, { status: 401 });
  }

  const formData = await request.formData();
  const audioFile = formData.get('audio') as File;
  const buffer = Buffer.from(await audioFile.arrayBuffer());

  const transcript = await transcribeAudio(buffer);

  return new Response(JSON.stringify({ transcript }));
}
```

```typescript
// src/pages/api/voice/generate.ts
import { generateEntry } from '@/lib/services/voice';
import { saveEntry } from '@/lib/services/entries';
import { requireAuth } from '@/lib/services/auth';

export async function POST({ request, cookies }) {
  if (!await requireAuth(cookies)) {
    return new Response(null, { status: 401 });
  }

  const { transcript, category } = await request.json();

  const markdown = await generateEntry(transcript, category);
  const entry = await saveEntry(category, markdown);

  return new Response(JSON.stringify({ entry }));
}
```

### Cost Estimation

| Service | Calculation | Annual Cost |
|---------|-------------|-------------|
| Whisper API | 50 reviews × 3 min × $0.006/min | ~$0.90 |
| Claude API | 50 reviews × ~1500 tokens × $0.003/1k | ~$0.25 |
| **Total** | | **~$1.15/year** |

## Alternatives

### Whisper Self-Hosted

| Pro | Contra |
|-----|--------|
| No API costs | Requires significant CPU/GPU |
| Data stays local | Complex setup and maintenance |
| | Slower without GPU |

**Rejected because:** The infrastructure overhead is not justified for ~50 requests/year. API costs are negligible (~$1/year).

### Google Cloud Speech-to-Text

| Pro | Contra |
|-----|--------|
| Excellent German recognition | More complex setup |
| Streaming support | Requires GCP account |
| | Similar cost to Whisper |

**Rejected because:** Whisper API is simpler to integrate and has comparable quality for German.

### Browser Web Speech API

| Pro | Contra |
|-----|--------|
| Free | Unreliable and inconsistent |
| No server needed | Poor German recognition |
| | Browser-dependent |

**Rejected because:** Quality is insufficient for reliable content extraction. Too many transcription errors would require manual correction.

### Alternative LLMs for Generation

| Option | Consideration |
|--------|---------------|
| GPT-4 | Could work, but Claude is preferred for this project |
| Local LLM | Insufficient quality for structured extraction |

**Decision:** Claude API is already the preferred LLM for this project.

## Consequences

### Positive

- **High-quality transcription**: Whisper excels at German speech recognition
- **Intelligent extraction**: Claude understands context and extracts structured data
- **Minimal cost**: ~$1/year for the complete pipeline
- **Simple integration**: Both APIs are straightforward to use
- **Human-in-the-loop**: Draft status ensures admin review before publishing

### Negative

- **External dependencies**: Requires OpenAI and Anthropic API access
- **Data privacy**: Audio and text are sent to external services
- **API availability**: Dependent on service uptime

### Mitigations

- Store API keys securely in environment variables
- Audio data is transient (not stored after transcription)
- Reviews are not sensitive personal data
- Can migrate to self-hosted Whisper later if needed
- Implement retry logic for API failures

### Environment Variables Required

```bash
# .env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```
