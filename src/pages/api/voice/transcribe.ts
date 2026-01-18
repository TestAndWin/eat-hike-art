import type { APIRoute } from 'astro';
import { requireAuth } from '@/lib/services/auth';
import { transcribeAudio } from '@/lib/services/voice';

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
    const formData = await request.formData();
    const audio = formData.get('audio') as File | null;

    if (!audio || !(audio instanceof File)) {
      return new Response(
        JSON.stringify({ error: 'Keine Audiodatei hochgeladen' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate file type (WebM, MP3, WAV, etc.)
    const allowedTypes = [
      'audio/webm',
      'audio/mp3',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/m4a',
      'audio/mp4',
    ];
    if (!allowedTypes.includes(audio.type)) {
      return new Response(
        JSON.stringify({
          error: `Ungültiger Dateityp: ${audio.type}. Erlaubt sind: WebM, MP3, WAV, OGG, M4A`
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate file size (max 25MB - Whisper limit)
    const maxSize = 25 * 1024 * 1024;
    if (audio.size > maxSize) {
      return new Response(
        JSON.stringify({ error: 'Datei zu groß. Maximum: 25MB' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Convert to buffer and transcribe
    const buffer = Buffer.from(await audio.arrayBuffer());
    const transcript = await transcribeAudio(buffer, audio.type);

    return new Response(
      JSON.stringify({ transcript }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Transcription error:', error);
    const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
    return new Response(
      JSON.stringify({ error: `Fehler bei der Transkription: ${message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
