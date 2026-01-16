import { useState, useRef } from 'react';
import type { Entry } from '@/lib/types';

interface ImageUploadSectionProps {
  entry: Entry;
}

const TYPE_DIRS: Record<string, string> = {
  restaurant: 'restaurants',
  art: 'kunst',
  tour: 'touren',
};

export function ImageUploadSection({ entry }: ImageUploadSectionProps) {
  const [images, setImages] = useState<string[]>(entry.images || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const newImages: string[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', entry.type);
        formData.append('slug', entry.slug);

        const response = await fetch('/api/images/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Upload fehlgeschlagen');
        }

        const { filename } = await response.json();
        newImages.push(filename);
      }

      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);

      // Auto-save to entry
      await saveImages(updatedImages);
      setSuccess('Bilder erfolgreich hochgeladen');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setError(null);
    setSuccess(null);

    try {
      await saveImages(newImages);
      setSuccess('Bild entfernt');
    } catch (err) {
      setError('Fehler beim Speichern');
      // Revert
      setImages(images);
    }
  };

  const saveImages = async (imageList: string[]) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/entries/${entry.type}/${entry.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: imageList }),
      });

      if (!response.ok) {
        throw new Error('Speichern fehlgeschlagen');
      }
    } finally {
      setSaving(false);
    }
  };

  const getImageUrl = (filename: string) => {
    return `/images/${TYPE_DIRS[entry.type]}/${entry.slug}/${filename}`;
  };

  return (
    <div className="space-y-4 rounded-lg border p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Bilder</h3>
        <label className="cursor-pointer inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" x2="12" y1="3" y2="15" />
          </svg>
          {uploading ? 'Wird hochgeladen...' : 'Bild hinzufügen'}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleFileSelect}
            disabled={uploading || saving}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
          {success}
        </div>
      )}

      {images.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((filename, index) => (
            <div key={filename} className="group relative aspect-video overflow-hidden rounded-lg border bg-muted">
              <img
                src={getImageUrl(filename)}
                alt={`Bild ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  disabled={saving}
                  className="rounded-full bg-red-500 p-2 text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                  title="Entfernen"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              </div>
              {index === 0 && (
                <div className="absolute left-2 top-2 rounded bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                  Titelbild
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-8 w-8 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
          <p className="mt-2 text-sm text-muted-foreground">
            Noch keine Bilder vorhanden
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Erlaubte Formate: JPEG, PNG, WebP, GIF. Maximale Größe: 10MB pro Bild.
        {saving && ' Wird gespeichert...'}
      </p>
    </div>
  );
}

export default ImageUploadSection;
