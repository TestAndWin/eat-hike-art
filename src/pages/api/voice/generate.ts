import type { APIRoute } from 'astro';
import { requireAuth } from '@/lib/services/auth';
import { generateEntry } from '@/lib/services/voice';
import { createEntry } from '@/lib/services/entries';
import type { Entry } from '@/lib/types';

interface GenerateRequest {
  transcript: string;
  category: Entry['type'];
}

export const POST: APIRoute = async ({ request, cookies }) => {
  // Check authentication
  const isAuthenticated = await requireAuth(cookies);
  if (!isAuthenticated) {
    return new Response(
      JSON.stringify({ error: 'Nicht autorisiert' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json() as GenerateRequest;
    const { transcript, category } = body;

    // Validate transcript
    if (!transcript || typeof transcript !== 'string' || transcript.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: 'Transkript zu kurz oder ungültig' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate category
    if (!category || !['restaurant', 'art', 'tour'].includes(category)) {
      return new Response(
        JSON.stringify({ error: 'Ungültige Kategorie' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate the structured entry from transcript
    const generatedEntry = await generateEntry(transcript, category);

    // Save as draft using the entries service
    const savedEntry = await createEntry(generatedEntry);

    return new Response(
      JSON.stringify({ entry: savedEntry }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Generation error:', error);
    const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
    return new Response(
      JSON.stringify({ error: `Fehler bei der Generierung: ${message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
