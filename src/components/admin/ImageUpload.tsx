import { useState, useRef, useEffect } from 'react';
import { CropDialog } from './CropDialog';

interface ImageUploadProps {
  type: 'restaurant' | 'art' | 'tour';
  slug: string;
  images: string[];
  onImagesChange: (images: string[]) => void;
}

const TYPE_DIRS: Record<string, string> = {
  restaurant: 'restaurants',
  art: 'kunst',
  tour: 'touren',
};

export function ImageUpload({ type, slug, images, onImagesChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Crop dialog state
  const [cropQueue, setCropQueue] = useState<File[]>([]);
  const [currentCropSrc, setCurrentCropSrc] = useState<string | null>(null);
  const [currentCropFile, setCurrentCropFile] = useState<File | null>(null);
  const [uploadedFilenames, setUploadedFilenames] = useState<string[]>([]);

  // Upload a single file (original or cropped blob)
  const uploadFile = async (file: File | Blob, filename: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file, filename);
    formData.append('type', type);
    formData.append('slug', slug);

    const response = await fetch('/api/images/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Upload fehlgeschlagen');
    }

    const { filename: uploadedFilename } = await response.json();
    return uploadedFilename;
  };

  // Show next file from queue
  const showNextFile = (queue: File[]) => {
    if (queue.length === 0) {
      setCurrentCropFile(null);
      setCurrentCropSrc(null);
      return;
    }

    const [nextFile, ...remaining] = queue;
    setCropQueue(remaining);
    setCurrentCropFile(nextFile);
    setCurrentCropSrc(URL.createObjectURL(nextFile));
  };

  // When queue becomes empty and we have uploads, notify parent
  useEffect(() => {
    if (uploading && !currentCropFile && cropQueue.length === 0 && uploadedFilenames.length > 0) {
      // All files processed
      onImagesChange([...images, ...uploadedFilenames]);
      setUploadedFilenames([]);
      setUploading(false);
    } else if (uploading && !currentCropFile && cropQueue.length === 0 && uploadedFilenames.length === 0) {
      // No files were uploaded (all cancelled)
      setUploading(false);
    }
  }, [uploading, currentCropFile, cropQueue.length, uploadedFilenames.length]);

  // Handle crop complete - upload cropped image
  const handleCropComplete = async (blob: Blob, filename: string) => {
    const src = currentCropSrc;
    const remainingQueue = cropQueue;

    try {
      const uploadedFilename = await uploadFile(blob, filename);
      setUploadedFilenames(prev => [...prev, uploadedFilename]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload fehlgeschlagen');
    }

    // Clean up object URL AFTER upload
    if (src) {
      URL.revokeObjectURL(src);
    }
    setCurrentCropSrc(null);
    setCurrentCropFile(null);

    // Show next file
    showNextFile(remainingQueue);
  };

  // Handle skip - upload original file without cropping
  const handleSkipCrop = async () => {
    if (!currentCropFile) return;

    const file = currentCropFile;
    const src = currentCropSrc;
    const remainingQueue = cropQueue;

    try {
      const uploadedFilename = await uploadFile(file, file.name);
      setUploadedFilenames(prev => [...prev, uploadedFilename]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload fehlgeschlagen');
    }

    // Clean up object URL AFTER upload
    if (src) {
      URL.revokeObjectURL(src);
    }
    setCurrentCropSrc(null);
    setCurrentCropFile(null);

    // Show next file
    showNextFile(remainingQueue);
  };

  // Handle cancel - skip this file entirely
  const handleCancelCrop = () => {
    // Clean up object URL
    if (currentCropSrc) {
      URL.revokeObjectURL(currentCropSrc);
    }
    setCurrentCropSrc(null);
    setCurrentCropFile(null);

    // Show next file
    showNextFile(cropQueue);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // IMPORTANT: Convert to array BEFORE resetting input, as resetting clears the FileList
    const fileArray = Array.from(files);

    setError(null);
    setUploading(true);
    setUploadedFilenames([]);

    // Reset file input (so same file can be selected again)
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Start processing the queue
    showNextFile(fileArray);
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const getImageUrl = (filename: string) => {
    return `/api/images/${TYPE_DIRS[type]}/${slug}/${filename}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Bilder</h3>
        <label className="cursor-pointer inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent">
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
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
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
                  className="rounded-full bg-red-500 p-2 text-white transition-colors hover:bg-red-600"
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
        Bilder werden automatisch optimiert.
      </p>

      {/* Crop Dialog */}
      {currentCropSrc && currentCropFile && (
        <CropDialog
          imageSrc={currentCropSrc}
          originalFilename={currentCropFile.name}
          onCropComplete={handleCropComplete}
          onSkip={handleSkipCrop}
          onCancel={handleCancelCrop}
        />
      )}
    </div>
  );
}

export default ImageUpload;
