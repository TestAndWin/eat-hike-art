import type { APIRoute } from 'astro';
import { readFile, stat } from 'fs/promises';
import path from 'path';

const DATA_DIR = import.meta.env.DATA_DIR || process.env.DATA_DIR || '/var/www/data';
const IMAGES_DIR = path.join(DATA_DIR, 'images');

// MIME types for images
const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

export const GET: APIRoute = async ({ params }) => {
  try {
    const imagePath = params.path;

    if (!imagePath) {
      return new Response('Not found', { status: 404 });
    }

    // Security: prevent directory traversal
    const normalizedPath = path.normalize(imagePath);
    if (normalizedPath.includes('..')) {
      return new Response('Forbidden', { status: 403 });
    }

    const filePath = path.join(IMAGES_DIR, normalizedPath);

    // Ensure the file is within IMAGES_DIR
    if (!filePath.startsWith(IMAGES_DIR)) {
      return new Response('Forbidden', { status: 403 });
    }

    // Check if file exists
    try {
      await stat(filePath);
    } catch {
      return new Response('Not found', { status: 404 });
    }

    // Get MIME type
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = MIME_TYPES[ext];

    if (!mimeType) {
      return new Response('Unsupported file type', { status: 415 });
    }

    // Read and return file
    const fileBuffer = await readFile(filePath);

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Image serve error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};
