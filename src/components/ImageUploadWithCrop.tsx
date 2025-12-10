import React, { useState, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Upload, X, ZoomIn, ZoomOut, RotateCw, Check, Smartphone } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Slider } from './ui/slider';
import { toast } from 'sonner';
import { getCroppedImg } from '../utils/canvasUtils';

interface ImageUploadWithCropProps {
  onImageSelected: (imageData: string) => void;
  currentImage?: string;
  aspectRatio?: number;
  label?: string;
  className?: string;
}

export function ImageUploadWithCrop({
  onImageSelected,
  currentImage,
  aspectRatio = 1,
  label = "Upload Image",
  className
}: ImageUploadWithCropProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImage || '');
  const [showCropDialog, setShowCropDialog] = useState(false);

  // Crop State
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setSelectedFile(reader.result as string);
        setShowCropDialog(true);
        setZoom(1);
        setRotation(0);
        setCrop({ x: 0, y: 0 });
      });
      reader.readAsDataURL(file);
    }
  };

  const showCroppedImage = useCallback(async () => {
    try {
      if (!selectedFile) return;

      const croppedImage = await getCroppedImg(
        selectedFile,
        croppedAreaPixels,
        rotation
      );

      if (croppedImage) {
        setPreviewUrl(croppedImage);
        onImageSelected(croppedImage);
        setShowCropDialog(false);
        toast.success('Image updated successfully');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to crop image');
    }
  }, [croppedAreaPixels, rotation, selectedFile, onImageSelected]);

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl('');
    setSelectedFile(null);
    onImageSelected('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        {label}
        <span className="text-xs text-gray-400 font-normal">(Tap to edit)</span>
      </label>}

      <div className="flex items-start gap-4">
        {/* Preview / Upload Box */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative overflow-hidden transition-all cursor-pointer group
            ${previewUrl
              ? 'w-32 h-32 rounded-xl ring-2 ring-amber-100 hover:ring-amber-300 shadow-sm'
              : 'flex-1 border-2 border-dashed border-amber-200 rounded-xl p-6 hover:border-amber-400 hover:bg-amber-50/50'
            }
          `}
        >
          {previewUrl ? (
            <>
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded-full">Change</p>
              </div>
              <button
                onClick={handleRemove}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-transform hover:scale-110 z-10"
                type="button"
              >
                <X className="h-3 w-3" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 h-full min-h-[100px]">
              <div className="bg-amber-100 p-3 rounded-full group-hover:scale-110 transition-transform">
                <Upload className="h-6 w-6 text-amber-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700">Click to upload</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG (max 10MB)</p>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Modern Crop Dialog */}
      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="max-w-xl w-full p-0 gap-0 overflow-hidden bg-white sm:rounded-2xl h-[90vh] sm:h-auto flex flex-col">
          <DialogHeader className="p-4 border-b flex-shrink-0 bg-white z-10">
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-amber-500" />
              Edit Image
            </DialogTitle>
            <DialogDescription>
              Pinch to zoom, drag to adjust position
            </DialogDescription>
          </DialogHeader>

          {/* Cropper Container */}
          <div className="relative flex-1 min-h-[300px] bg-slate-900 w-full overflow-hidden">
            {selectedFile && (
              <Cropper
                image={selectedFile}
                crop={crop}
                rotation={rotation}
                zoom={zoom}
                aspect={aspectRatio}
                onCropChange={setCrop}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                showGrid={true}
                classes={{
                  containerClassName: "h-full w-full",
                  mediaClassName: "max-h-full",
                }}
              />
            )}
          </div>

          {/* Controls */}
          <div className="p-4 space-y-5 bg-white border-t z-10 flex-shrink-0">
            {/* Zoom Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-gray-500">
                <span className="flex items-center gap-1"><ZoomOut className="w-3 h-3" /> Zoom</span>
                <span>{zoom.toFixed(1)}x</span>
              </div>
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(value) => setZoom(value[0])}
                className="py-2"
              />
            </div>

            {/* Rotation Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-gray-500">
                <span className="flex items-center gap-1"><RotateCw className="w-3 h-3" /> Rotation</span>
                <span>{rotation}°</span>
              </div>
              <Slider
                value={[rotation]}
                min={0}
                max={360}
                step={1}
                onValueChange={(value) => setRotation(value[0])}
                className="py-2"
              />
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="text-xs"
              >
                <RotateCw className="w-3 h-3 mr-1" /> +90°
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setZoom(1); setRotation(0); setCrop({ x: 0, y: 0 }); }}
                className="text-xs"
              >
                Reset
              </Button>
            </div>
          </div>

          <DialogFooter className="p-4 border-t bg-gray-50 flex-row gap-3 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCropDialog(false)}
              className="flex-1 sm:flex-none border-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={showCroppedImage}
              className="flex-1 sm:flex-none bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
