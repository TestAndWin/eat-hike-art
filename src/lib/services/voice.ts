import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import type { Entry, RestaurantEntry, ArtEntry, TourEntry } from '@/lib/types';

// Type for generated entry data (without slug, as it's generated on save)
export type GeneratedEntry = Omit<Entry, 'slug' | 'htmlContent'>;

/**
 * Transcribe audio using OpenAI Whisper API
 */
export async function transcribeAudio(
  buffer: Buffer,
  mimeType: string = 'audio/webm'
): Promise<string> {
  const apiKey = import.meta.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY nicht konfiguriert');
  }

  const openai = new OpenAI({ apiKey });

  // Convert buffer to File object for the API
  const blob = new Blob([buffer], { type: mimeType });
  const file = new File([blob], 'audio.webm', { type: mimeType });

  const response = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    language: 'de',
  });

  return response.text;
}

/**
 * Generate a structured entry from a transcript using Claude API
 */
export async function generateEntry(
  transcript: string,
  category: Entry['type']
): Promise<GeneratedEntry> {
  const apiKey = import.meta.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY nicht konfiguriert');
  }

  const anthropic = new Anthropic({ apiKey });

  const systemPrompt = getSystemPrompt(category);
  const userPrompt = `Transkript der Bewertung:\n\n${transcript}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [
      { role: 'user', content: userPrompt }
    ],
    system: systemPrompt,
  });

  // Extract the text content
  const textContent = response.content.find(block => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('Keine Textantwort von Claude erhalten');
  }

  // Parse the JSON response
  const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Konnte JSON nicht aus der Antwort extrahieren');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  // Validate and return based on category
  return validateAndBuildEntry(parsed, category);
}

/**
 * Get the system prompt for Claude based on entry category
 */
function getSystemPrompt(category: Entry['type']): string {
  const baseInstructions = `Du bist ein Assistent, der gesprochene Bewertungen in strukturierte JSON-Daten umwandelt.
Die Bewertung ist auf Deutsch. Extrahiere alle relevanten Informationen.
Bewertungen sind auf einer Skala von 1-5 (in 0.5-Schritten möglich).
Antworte NUR mit einem validen JSON-Objekt, ohne Markdown-Formatierung oder zusätzlichen Text.
Das heutige Datum ist: ${new Date().toISOString().split('T')[0]}`;

  switch (category) {
    case 'restaurant':
      return `${baseInstructions}

Extrahiere folgende Felder für ein RESTAURANT:
- name: Name des Restaurants (Pflicht)
- cuisine: Küchenstil (z.B. "Deutsch", "Italienisch", "Asiatisch")
- rating: Gesamtbewertung 1-5 (als Durchschnitt der Einzelbewertungen, wenn nicht explizit genannt)
- ratings: Objekt mit service, food, ambiance, value (je 1-5)
- address: Adresse falls erwähnt
- content: Der Review-Text als Zusammenfassung der gesprochenen Bewertung
- date: Heutiges Datum im Format YYYY-MM-DD

JSON-Schema:
{
  "name": "string",
  "cuisine": "string",
  "rating": number,
  "ratings": {
    "service": number,
    "food": number,
    "ambiance": number,
    "value": number
  },
  "address": "string oder null",
  "content": "string",
  "date": "YYYY-MM-DD"
}`;

    case 'art':
      return `${baseInstructions}

Extrahiere folgende Felder für eine KUNSTAUSSTELLUNG:
- name: Name der Ausstellung (Pflicht)
- museum: Name des Museums oder der Galerie (Pflicht)
- rating: Gesamtbewertung 1-5
- exhibition_start: Startdatum der Ausstellung falls erwähnt (YYYY-MM-DD)
- exhibition_end: Enddatum der Ausstellung falls erwähnt (YYYY-MM-DD)
- content: Der Review-Text als Zusammenfassung der gesprochenen Bewertung
- date: Heutiges Datum im Format YYYY-MM-DD

JSON-Schema:
{
  "name": "string",
  "museum": "string",
  "rating": number,
  "exhibition_start": "YYYY-MM-DD oder null",
  "exhibition_end": "YYYY-MM-DD oder null",
  "content": "string",
  "date": "YYYY-MM-DD"
}`;

    case 'tour':
      return `${baseInstructions}

Extrahiere folgende Felder für eine TOUR/WANDERUNG:
- name: Name der Tour (Pflicht)
- rating: Gesamtbewertung 1-5
- distance_km: Distanz in Kilometern falls erwähnt
- duration: Dauer als Text (z.B. "2 Stunden", "halber Tag")
- difficulty: "leicht", "mittel" oder "schwer" falls erwähnt
- content: Der Review-Text als Zusammenfassung der gesprochenen Bewertung
- date: Heutiges Datum im Format YYYY-MM-DD

JSON-Schema:
{
  "name": "string",
  "rating": number,
  "distance_km": number oder null,
  "duration": "string oder null",
  "difficulty": "leicht" | "mittel" | "schwer" | null,
  "content": "string",
  "date": "YYYY-MM-DD"
}`;
  }
}

/**
 * Validate the parsed response and build a proper Entry object
 */
function validateAndBuildEntry(
  parsed: Record<string, unknown>,
  category: Entry['type']
): GeneratedEntry {
  // Common required fields
  if (!parsed.name || typeof parsed.name !== 'string') {
    throw new Error('Name fehlt in der generierten Antwort');
  }
  if (!parsed.rating || typeof parsed.rating !== 'number') {
    throw new Error('Bewertung fehlt in der generierten Antwort');
  }

  const baseEntry = {
    name: parsed.name as string,
    rating: clampRating(parsed.rating as number),
    status: 'draft' as const,
    date: (parsed.date as string) || new Date().toISOString().split('T')[0],
    images: [],
    content: (parsed.content as string) || '',
  };

  switch (category) {
    case 'restaurant': {
      const ratings = parsed.ratings as Record<string, number> | undefined;
      return {
        ...baseEntry,
        type: 'restaurant',
        cuisine: (parsed.cuisine as string) || 'Unbekannt',
        ratings: {
          service: clampRating(ratings?.service ?? 3),
          food: clampRating(ratings?.food ?? 3),
          ambiance: clampRating(ratings?.ambiance ?? 3),
          value: clampRating(ratings?.value ?? 3),
        },
        address: (parsed.address as string) || undefined,
      } as Omit<RestaurantEntry, 'slug' | 'htmlContent'>;
    }

    case 'art': {
      return {
        ...baseEntry,
        type: 'art',
        museum: (parsed.museum as string) || 'Unbekannt',
        exhibition_start: (parsed.exhibition_start as string) || undefined,
        exhibition_end: (parsed.exhibition_end as string) || undefined,
      } as Omit<ArtEntry, 'slug' | 'htmlContent'>;
    }

    case 'tour': {
      return {
        ...baseEntry,
        type: 'tour',
        distance_km: (parsed.distance_km as number) || undefined,
        duration: (parsed.duration as string) || undefined,
        difficulty: validateDifficulty(parsed.difficulty as string),
      } as Omit<TourEntry, 'slug' | 'htmlContent'>;
    }
  }
}

/**
 * Clamp rating to valid range (1-5 in 0.5 increments)
 */
function clampRating(value: number): number {
  const clamped = Math.max(1, Math.min(5, value));
  return Math.round(clamped * 2) / 2; // Round to nearest 0.5
}

/**
 * Validate difficulty value
 */
function validateDifficulty(
  value: string | undefined
): 'leicht' | 'mittel' | 'schwer' | undefined {
  if (!value) return undefined;
  const lower = value.toLowerCase();
  if (lower === 'leicht' || lower === 'mittel' || lower === 'schwer') {
    return lower;
  }
  return undefined;
}
