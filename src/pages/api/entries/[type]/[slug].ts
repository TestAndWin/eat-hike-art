import type { APIRoute } from 'astro';
import { requireAuth } from '@/lib/services/auth';
import { getEntry, updateEntry, softDeleteEntry } from '@/lib/services/entries';
import type { Entry } from '@/lib/types';

export const PUT: APIRoute = async ({ params, request, cookies }) => {
  // Check authentication
  const isAuthenticated = await requireAuth(cookies);
  if (!isAuthenticated) {
    return new Response(
      JSON.stringify({ error: 'Nicht autorisiert' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { type, slug } = params;

    // Validate type
    if (!type || !['restaurant', 'art', 'tour'].includes(type)) {
      return new Response(
        JSON.stringify({ error: 'Ungültiger Typ' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'Slug erforderlich' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if entry exists
    const existingEntry = await getEntry(type as Entry['type'], slug);
    if (!existingEntry) {
      return new Response(
        JSON.stringify({ error: 'Eintrag nicht gefunden' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();

    // Build update object (only include provided fields)
    const updates: Partial<Entry> = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.date !== undefined) updates.date = body.date;
    if (body.status !== undefined) updates.status = body.status;
    if (body.rating !== undefined) updates.rating = body.rating;
    if (body.content !== undefined) updates.content = body.content;
    if (body.images !== undefined) updates.images = body.images;
    if (body.link !== undefined) updates.link = body.link;
    if (body.seo_description !== undefined) (updates as Record<string, unknown>).seo_description = body.seo_description;

    // Type-specific fields
    if (type === 'restaurant') {
      if (body.cuisine !== undefined) (updates as Record<string, unknown>).cuisine = body.cuisine;
      if (body.price_range !== undefined) (updates as Record<string, unknown>).price_range = body.price_range;
      if (body.ratings !== undefined) (updates as Record<string, unknown>).ratings = body.ratings;
      if (body.address !== undefined) (updates as Record<string, unknown>).address = body.address;
    } else if (type === 'art') {
      if (body.museum !== undefined) (updates as Record<string, unknown>).museum = body.museum;
      if (body.exhibition_start !== undefined) (updates as Record<string, unknown>).exhibition_start = body.exhibition_start;
      if (body.exhibition_end !== undefined) (updates as Record<string, unknown>).exhibition_end = body.exhibition_end;
    } else if (type === 'tour') {
      if (body.distance_km !== undefined) (updates as Record<string, unknown>).distance_km = body.distance_km;
      if (body.duration !== undefined) (updates as Record<string, unknown>).duration = body.duration;
      if (body.difficulty !== undefined) (updates as Record<string, unknown>).difficulty = body.difficulty;
    }

    const updatedEntry = await updateEntry(type as Entry['type'], slug, updates);

    if (!updatedEntry) {
      return new Response(
        JSON.stringify({ error: 'Fehler beim Aktualisieren' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(updatedEntry),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Update entry error:', error);
    return new Response(
      JSON.stringify({ error: 'Fehler beim Aktualisieren des Eintrags' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const DELETE: APIRoute = async ({ params, cookies }) => {
  // Check authentication
  const isAuthenticated = await requireAuth(cookies);
  if (!isAuthenticated) {
    return new Response(
      JSON.stringify({ error: 'Nicht autorisiert' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { type, slug } = params;

    // Validate type
    if (!type || !['restaurant', 'art', 'tour'].includes(type)) {
      return new Response(
        JSON.stringify({ error: 'Ungültiger Typ' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'Slug erforderlich' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Soft delete (set status to inactive)
    const success = await softDeleteEntry(type as Entry['type'], slug);

    if (!success) {
      return new Response(
        JSON.stringify({ error: 'Eintrag nicht gefunden' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Delete entry error:', error);
    return new Response(
      JSON.stringify({ error: 'Fehler beim Löschen des Eintrags' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
