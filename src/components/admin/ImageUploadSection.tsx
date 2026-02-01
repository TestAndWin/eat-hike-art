import { useState, useRef, useEffect } from 'react';
import type { Entry } from '@/lib/types';
import { CropDialog } from './CropDialog';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ImageUploadSectionProps {
  entry: Entry;
}

const TYPE_DIRS: Record<string, string> = {
  restaurant: 'restaurants',
  art: 'kunst',
  tour: 'touren',
};

// Sortable image item component
interface SortableImageProps {
  id: string;
  filename: string;
  index: number;
  imageUrl: string;
  onRemove: () => void;
  disabled: boolean;
}

function SortableImage({ id, filename, index, imageUrl, onRemove, disabled }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative aspect-video overflow-hidden rounded-lg border bg-muted"
    >
      {/* Drag handle overlay */}
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 z-10"
        title="Ziehen zum Sortieren"
      />
      <img
        src={imageUrl}
        alt={`Bild ${index + 1}`}
        className="h-full w-full object-cover pointer-events-none"
        draggable={false}
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="rounded-full bg-red-500 p-2 text-white transition-colors hover:bg-red-600 disabled:opacity-50 pointer-events-auto z-20"
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
        <div className="absolute left-2 top-2 rounded bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground pointer-events-none">
          Titelbild
        </div>
      )}
      {/* Drag indicator */}
      <div className="absolute right-2 top-2 rounded bg-black/50 p-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="5" r="1" />
          <circle cx="9" cy="12" r="1" />
          <circle cx="9" cy="19" r="1" />
          <circle cx="15" cy="5" r="1" />
          <circle cx="15" cy="12" r="1" />
          <circle cx="15" cy="19" r="1" />
        </svg>
      </div>
    </div>
  );
}

export function ImageUploadSection({ entry }: ImageUploadSectionProps) {
  const [images, setImages] = useState<string[]>(entry.images || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Crop dialog state
  const [cropQueue, setCropQueue] = useState<File[]>([]);
  const [currentCropSrc, setCurrentCropSrc] = useState<string | null>(null);
  const [currentCropFile, setCurrentCropFile] = useState<File | null>(null);
  const [uploadedFilenames, setUploadedFilenames] = useState<string[]>([]);

  // Track client-side mounting to avoid SSR hydration mismatch with dnd-kit
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum drag distance before activation
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end - reorder images
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = images.indexOf(active.id as string);
      const newIndex = images.indexOf(over.id as string);

      const newImages = arrayMove(images, oldIndex, newIndex);
      setImages(newImages);
      setError(null);
      setSuccess(null);

      try {
        await saveImages(newImages);
        setSuccess('Reihenfolge gespeichert');
      } catch (err) {
        setError('Fehler beim Speichern der Reihenfolge');
        // Revert on error
        setImages(images);
      }
    }
  };

  // Upload a single file (original or cropped blob)
  const uploadFile = async (file: File | Blob, filename: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file, filename);
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

  // When queue becomes empty and we have uploads, save them
  useEffect(() => {
    if (uploading && !currentCropFile && cropQueue.length === 0 && uploadedFilenames.length > 0) {
      // All files processed, save to entry
      const updatedImages = [...images, ...uploadedFilenames];
      setImages(updatedImages);
      setUploadedFilenames([]);
      setUploading(false);

      saveImages(updatedImages).then(() => {
        setSuccess('Bilder erfolgreich hochgeladen');
      }).catch(() => {
        setError('Fehler beim Speichern');
      });
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
    setSuccess(null);
    setUploading(true);
    setUploadedFilenames([]);

    // Reset file input (so same file can be selected again)
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Start processing the queue
    showNextFile(fileArray);
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
    return `/api/images/${TYPE_DIRS[entry.type]}/${entry.slug}/${filename}`;
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
        isMounted ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={images} strategy={rectSortingStrategy}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {images.map((filename, index) => (
                  <SortableImage
                    key={filename}
                    id={filename}
                    filename={filename}
                    index={index}
                    imageUrl={getImageUrl(filename)}
                    onRemove={() => handleRemove(index)}
                    disabled={saving}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          // Static grid for SSR - no drag-and-drop
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((filename, index) => (
              <div
                key={filename}
                className="group relative aspect-video overflow-hidden rounded-lg border bg-muted"
              >
                <img
                  src={getImageUrl(filename)}
                  alt={`Bild ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                {index === 0 && (
                  <div className="absolute left-2 top-2 rounded bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                    Titelbild
                  </div>
                )}
              </div>
            ))}
          </div>
        )
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
        Bilder werden automatisch optimiert. Ziehen zum Sortieren.
        {saving && ' Wird gespeichert...'}
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

export default ImageUploadSection;
