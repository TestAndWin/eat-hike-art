import sharp from 'sharp';

interface OptimizedImage {
  buffer: Buffer;
  extension: string;
}

/**
 * Optimizes an image for web use:
 * - Auto-rotates based on EXIF orientation
 * - Resizes to max 1920px width (preserves aspect ratio)
 * - Removes EXIF metadata
 * - Converts to WebP (quality 80)
 *
 * GIFs are returned as-is to preserve animation.
 */
export async function optimizeImage(
  buffer: Buffer,
  mimeType: string
): Promise<OptimizedImage | null> {
  // Skip GIFs to preserve animation
  if (mimeType === 'image/gif') {
    return null;
  }

  const optimizedBuffer = await sharp(buffer)
    .rotate() // Auto-rotate based on EXIF orientation
    .resize(1920, null, { withoutEnlargement: true }) // Max width 1920px
    .webp({ quality: 80 }) // EXIF metadata is stripped by default
    .toBuffer();

  return {
    buffer: optimizedBuffer,
    extension: 'webp',
  };
}
