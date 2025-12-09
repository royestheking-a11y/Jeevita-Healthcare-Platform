import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, ZoomIn, ZoomOut, RotateCw, Check, Move } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Slider } from './ui/slider';
import { toast } from 'sonner';

interface ImageUploadWithCropProps {
  onImageSelected: (imageData: string) => void;
  currentImage?: string;
  aspectRatio?: number;
  label?: string;
}

export function ImageUploadWithCrop({
  onImageSelected,
  currentImage,
  aspectRatio = 1,
  label = "Upload Image"
}: ImageUploadWithCropProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImage || '');
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentImage) {
      setPreviewUrl(currentImage);
    }
  }, [currentImage]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setShowCropDialog(true);
        setZoom(1);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    } else {
      toast.error('Please upload a valid image file (JPG, PNG). PDF execution is not yet supported in this view.');
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = () => {
    if (!previewUrl) {
      toast.error('Please select an image first');
      return;
    }

    if (!canvasRef.current) {
      toast.error('Error initializing image processor');
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      toast.error('Error initializing image processor');
      return;
    }

    // Use the image that's already loaded in the preview
    const img = imageRef.current;
    if (!img || !img.complete) {
      toast.error('Image is still loading. Please wait.');
      return;
    }

    const container = containerRef.current;
    if (!container) {
      toast.error('Error: Container not found');
      return;
    }

    try {
      // Get container dimensions
      const containerWidth = container.offsetWidth || 400;
      const containerHeight = container.offsetHeight || 400;

      // Calculate crop area (80% of container, centered)
      const cropWidth = containerWidth * 0.8;
      const cropHeight = cropWidth / aspectRatio;

      // Calculate how the image is displayed
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const containerAspect = containerWidth / containerHeight;

      let displayedWidth, displayedHeight;
      if (imgAspect > containerAspect) {
        displayedWidth = containerWidth * zoom;
        displayedHeight = displayedWidth / imgAspect;
      } else {
        displayedHeight = containerHeight * zoom;
        displayedWidth = displayedHeight * imgAspect;
      }

      // Calculate scale
      const scaleX = img.naturalWidth / displayedWidth;
      const scaleY = img.naturalHeight / displayedHeight;

      // Calculate crop position
      const cropCenterX = (containerWidth / 2) - position.x;
      const cropCenterY = (containerHeight / 2) - position.y;

      // Calculate source rectangle
      let sourceX = (cropCenterX - cropWidth / 2) * scaleX;
      let sourceY = (cropCenterY - cropHeight / 2) * scaleY;
      let sourceWidth = cropWidth * scaleX;
      let sourceHeight = cropHeight * scaleY;

      // Clamp to image bounds
      sourceX = Math.max(0, Math.min(sourceX, img.naturalWidth - sourceWidth));
      sourceY = Math.max(0, Math.min(sourceY, img.naturalHeight - sourceHeight));
      sourceWidth = Math.min(sourceWidth, img.naturalWidth - sourceX);
      sourceHeight = Math.min(sourceHeight, img.naturalHeight - sourceY);

      // Set output canvas size
      const outputWidth = 1200;
      const outputHeight = outputWidth / aspectRatio;
      canvas.width = outputWidth;
      canvas.height = outputHeight;

      // Handle rotation
      if (rotation !== 0) {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) {
          toast.error('Error processing rotation');
          return;
        }

        const angle = (rotation * Math.PI) / 180;
        const cos = Math.abs(Math.cos(angle));
        const sin = Math.abs(Math.sin(angle));

        tempCanvas.width = img.naturalWidth * cos + img.naturalHeight * sin;
        tempCanvas.height = img.naturalWidth * sin + img.naturalHeight * cos;

        tempCtx.save();
        tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
        tempCtx.rotate(angle);
        tempCtx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
        tempCtx.restore();

        const centerX = img.naturalWidth / 2;
        const centerY = img.naturalHeight / 2;
        const rotatedCenterX = tempCanvas.width / 2;
        const rotatedCenterY = tempCanvas.height / 2;

        const dx = sourceX + sourceWidth / 2 - centerX;
        const dy = sourceY + sourceHeight / 2 - centerY;
        const rotatedDx = dx * Math.cos(angle) - dy * Math.sin(angle);
        const rotatedDy = dx * Math.sin(angle) + dy * Math.cos(angle);

        sourceX = rotatedCenterX + rotatedDx - sourceWidth / 2;
        sourceY = rotatedCenterY + rotatedDy - sourceHeight / 2;

        sourceX = Math.max(0, Math.min(sourceX, tempCanvas.width - sourceWidth));
        sourceY = Math.max(0, Math.min(sourceY, tempCanvas.height - sourceHeight));
        sourceWidth = Math.min(sourceWidth, tempCanvas.width - sourceX);
        sourceHeight = Math.min(sourceHeight, tempCanvas.height - sourceY);

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(
          tempCanvas,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          canvas.width,
          canvas.height
        );
      } else {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          canvas.width,
          canvas.height
        );
      }

      // Get cropped image
      const croppedImage = canvas.toDataURL('image/jpeg', 0.92);

      // Update immediately
      onImageSelected(croppedImage);
      setPreviewUrl(croppedImage);
      setShowCropDialog(false);
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setSelectedFile(null);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error during crop:', error);
      toast.error('Error processing image. Please try again.');
    }
  };

  const handleRemove = () => {
    setPreviewUrl('');
    setSelectedFile(null);
    onImageSelected('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}

      <div className="flex items-center gap-4">
        {previewUrl && (
          <div className="relative group">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-24 h-24 object-cover rounded-lg border-2 border-amber-200"
            />
            <button
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              type="button"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 border-2 border-dashed border-amber-300 rounded-lg p-6 hover:border-amber-500 hover:bg-amber-50/50 transition-all cursor-pointer group"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="bg-amber-100 group-hover:bg-amber-200 p-3 rounded-full transition-colors">
              <Upload className="h-6 w-6 text-amber-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">Click to upload</p>
              <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Crop Dialog */}
      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Adjust and Crop Image</DialogTitle>
            <DialogDescription>
              Resize, rotate, and position your image. Drag to move, use sliders to adjust.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            {/* Image Preview with Crop Area */}
            <div
              ref={containerRef}
              className="relative bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center"
              style={{
                height: '400px',
                aspectRatio: aspectRatio.toString(),
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {previewUrl && (
                <>
                  <img
                    ref={imageRef}
                    src={previewUrl}
                    alt="Crop preview"
                    className="max-w-none"
                    style={{
                      transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                      transition: isDragging ? 'none' : 'transform 0.1s',
                      userSelect: 'none',
                      pointerEvents: 'none'
                    }}
                    onLoad={(e) => {
                      const img = e.target as HTMLImageElement;
                      // Reset position when image loads
                      setPosition({ x: 0, y: 0 });
                    }}
                  />
                  {/* Crop Overlay */}
                  <div
                    className="absolute border-2 border-amber-500 border-dashed"
                    style={{
                      width: '80%',
                      height: `${80 / aspectRatio}%`,
                      top: '10%',
                      left: '10%',
                      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                      pointerEvents: 'none'
                    }}
                  />
                  {/* Crop Guide Text */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-lg text-xs z-20">
                    <Move className="h-3 w-3 inline mr-1" />
                    Drag to move image
                  </div>
                </>
              )}
              {/* Hidden canvas for processing */}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Controls */}
            <div className="space-y-4 border-t pt-4">
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <ZoomIn className="h-4 w-4 text-amber-600" />
                  Zoom: {zoom.toFixed(1)}x
                </label>
                <div className="flex items-center gap-2">
                  <ZoomOut className="h-4 w-4 text-gray-400" />
                  <Slider
                    value={[zoom]}
                    onValueChange={(value) => setZoom(value[0])}
                    min={0.5}
                    max={3}
                    step={0.1}
                    className="flex-1"
                  />
                  <ZoomIn className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <RotateCw className="h-4 w-4 text-amber-600" />
                  Rotation: {rotation}°
                </label>
                <div className="flex items-center gap-2">
                  <RotateCw className="h-4 w-4 text-gray-400 rotate-180" />
                  <Slider
                    value={[rotation]}
                    onValueChange={(value) => setRotation(value[0])}
                    min={0}
                    max={360}
                    step={15}
                    className="flex-1"
                  />
                  <RotateCw className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setZoom(1);
                    setRotation(0);
                    setPosition({ x: 0, y: 0 });
                  }}
                  className="flex-1"
                >
                  Reset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="flex-1"
                >
                  <RotateCw className="h-4 w-4 mr-1" />
                  Rotate 90°
                </Button>
              </div>
            </div>

          </div>

          {/* Action Buttons - Fixed at bottom */}
          <div className="flex gap-2 justify-end border-t pt-4 mt-4 flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowCropDialog(false);
                setZoom(1);
                setRotation(0);
                setPosition({ x: 0, y: 0 });
                setSelectedFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCrop}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              <Check className="h-4 w-4 mr-2" />
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
