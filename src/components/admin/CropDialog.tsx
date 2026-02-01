import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { getCroppedImageBlob } from '@/lib/cropImage';

interface CropDialogProps {
  imageSrc: string;
  originalFilename: string;
  onCropComplete: (blob: Blob, filename: string) => void;
  onSkip: () => void;
  onCancel: () => void;
}

export function CropDialog({
  imageSrc,
  originalFilename,
  onCropComplete,
  onSkip,
  onCancel,
}: CropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropChange = useCallback((location: { x: number; y: number }) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const onCropAreaChange = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    if (!croppedAreaPixels) return;

    setProcessing(true);
    try {
      const croppedBlob = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
      // Change extension to .jpg since we're outputting JPEG from canvas
      const baseName = originalFilename.replace(/\.[^/.]+$/, '');
      onCropComplete(croppedBlob, `${baseName}.jpg`);
    } catch (error) {
      console.error('Crop error:', error);
      // Fall back to skip on error
      onSkip();
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="mx-4 flex max-h-[90vh] w-full max-w-3xl flex-col rounded-lg bg-background">
        {/* Header */}
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Bild zuschneiden</h2>
          <p className="text-sm text-muted-foreground">{originalFilename}</p>
        </div>

        {/* Cropper area */}
        <div className="relative h-[400px] bg-neutral-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropAreaChange}
          />
        </div>

        {/* Zoom slider */}
        <div className="flex items-center gap-4 border-t px-6 py-4">
          <span className="text-sm text-muted-foreground">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1"
          />
          <span className="w-12 text-right text-sm text-muted-foreground">
            {zoom.toFixed(1)}x
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-end gap-3 border-t px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={processing}
            className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={onSkip}
            disabled={processing}
            className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
          >
            Ohne Zuschnitt hochladen
          </button>
          <button
            type="button"
            onClick={handleCrop}
            disabled={processing}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {processing ? 'Wird verarbeitet...' : 'Zuschneiden & Hochladen'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CropDialog;
