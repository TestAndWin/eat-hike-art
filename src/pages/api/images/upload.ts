import type { APIRoute } from 'astro';
import { requireAuth } from '@/lib/services/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { optimizeImage } from '@/lib/services/images';

const DATA_DIR = import.meta.env.DATA_DIR || process.env.DATA_DIR || '/var/www/data';
const IMAGES_DIR = path.join(DATA_DIR, 'images');

// Map entry types to directory names
const TYPE_DIRS: Record<string, string> = {
  restaurant: 'restaurants',
  art: 'kunst',
  tour: 'touren',
};

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
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string | null;
    const slug = formData.get('slug') as string | null;

    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: 'Keine Datei hochgeladen' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

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

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: 'Ungültiger Dateityp. Erlaubt sind: JPEG, PNG, WebP, GIF' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ error: 'Datei zu groß. Maximum: 10MB' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get original buffer
    const originalBuffer = Buffer.from(await file.arrayBuffer());

    // Optimize image (returns null for GIFs to preserve animation)
    const optimized = await optimizeImage(originalBuffer, file.type);

    // Use optimized version or original (for GIFs)
    const finalBuffer = optimized?.buffer ?? originalBuffer;
    const extension = optimized?.extension ?? file.name.split('.').pop()?.toLowerCase() ?? 'gif';

    // Generate filename
    const timestamp = Date.now();
    const filename = `${timestamp}.${extension}`;

    // Create directory if needed
    const dirPath = path.join(IMAGES_DIR, TYPE_DIRS[type], slug);
    await mkdir(dirPath, { recursive: true });

    // Write file
    const filePath = path.join(dirPath, filename);
    await writeFile(filePath, finalBuffer);

    // Return the URL path (served via API endpoint)
    const url = `/api/images/${TYPE_DIRS[type]}/${slug}/${filename}`;

    return new Response(
      JSON.stringify({ filename, url }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Image upload error:', error);
    return new Response(
      JSON.stringify({ error: 'Fehler beim Hochladen des Bildes' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
