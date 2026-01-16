import type { APIRoute } from 'astro';
import { requireAuth } from '@/lib/services/auth';
import { createEntry } from '@/lib/services/entries';
import type { Entry } from '@/lib/types';

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
    const body = await request.json();

    // Validate required fields
    const { type, name, date, status, rating } = body;

    if (!type || !['restaurant', 'art', 'tour'].includes(type)) {
      return new Response(
        JSON.stringify({ error: 'Ungültiger Typ' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!name || typeof name !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Name ist erforderlich' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return new Response(
        JSON.stringify({ error: 'Ungültiges Datum' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!status || !['draft', 'active', 'inactive'].includes(status)) {
      return new Response(
        JSON.stringify({ error: 'Ungültiger Status' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (typeof rating !== 'number' || rating < 0 || rating > 5) {
      return new Response(
        JSON.stringify({ error: 'Ungültige Bewertung' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate type-specific fields
    if (type === 'restaurant') {
      if (!body.cuisine || typeof body.cuisine !== 'string') {
        return new Response(
          JSON.stringify({ error: 'Küche ist erforderlich' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      if (!body.ratings || typeof body.ratings !== 'object') {
        return new Response(
          JSON.stringify({ error: 'Bewertungen sind erforderlich' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    if (type === 'art') {
      if (!body.museum || typeof body.museum !== 'string') {
        return new Response(
          JSON.stringify({ error: 'Museum ist erforderlich' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Build entry object
    const entryData: Omit<Entry, 'slug'> = {
      type,
      name,
      date,
      status,
      rating,
      content: body.content || '',
      images: body.images || [],
      link: body.link,
    } as Omit<Entry, 'slug'>;

    // Add type-specific fields
    if (type === 'restaurant') {
      Object.assign(entryData, {
        cuisine: body.cuisine,
        ratings: body.ratings,
        address: body.address,
      });
    } else if (type === 'art') {
      Object.assign(entryData, {
        museum: body.museum,
        exhibition_start: body.exhibition_start,
        exhibition_end: body.exhibition_end,
      });
    } else if (type === 'tour') {
      Object.assign(entryData, {
        distance_km: body.distance_km,
        duration: body.duration,
        difficulty: body.difficulty,
      });
    }

    const entry = await createEntry(entryData);

    return new Response(
      JSON.stringify(entry),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Create entry error:', error);
    return new Response(
      JSON.stringify({ error: 'Fehler beim Erstellen des Eintrags' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
