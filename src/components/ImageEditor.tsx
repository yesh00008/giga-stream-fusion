import { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import type { Point, Area } from 'react-easy-crop';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Crop,
  Maximize2,
  Circle,
  Square,
  Loader2,
  Check,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface ImageEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  onSave: (croppedImage: Blob) => Promise<void>;
  aspectRatio?: number;
  cropShape?: 'rect' | 'round';
  title?: string;
  description?: string;
}

export function ImageEditor({
  open,
  onOpenChange,
  imageUrl,
  onSave,
  aspectRatio = 1,
  cropShape = 'round',
  title = 'Edit Image',
  description = 'Crop and adjust your image',
}: ImageEditorProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentAspectRatio, setCurrentAspectRatio] = useState(aspectRatio);
  const [currentCropShape, setCurrentCropShape] = useState<'rect' | 'round'>(cropShape);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0
  ): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    );

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        }
      }, 'image/jpeg', 0.95);
    });
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) {
      toast.error('Please crop the image first');
      return;
    }

    try {
      setIsSaving(true);
      const croppedImage = await getCroppedImg(imageUrl, croppedAreaPixels, rotation);
      await onSave(croppedImage);
      onOpenChange(false);
      resetEditor();
    } catch (error) {
      console.error('Error saving cropped image:', error);
      toast.error('Failed to save image');
    } finally {
      setIsSaving(false);
    }
  };

  const resetEditor = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    setCurrentAspectRatio(aspectRatio);
    setCurrentCropShape(cropShape);
  };

  const handleCancel = () => {
    resetEditor();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Crop Area */}
          <div className="relative w-full h-[400px] md:h-[500px] bg-black rounded-lg overflow-hidden">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={currentAspectRatio}
              cropShape={currentCropShape}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              showGrid={true}
              objectFit="contain"
            />
          </div>

          {/* Controls Tabs */}
          <Tabs defaultValue="crop" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="crop">
                <Crop size={16} className="mr-2" />
                Crop
              </TabsTrigger>
              <TabsTrigger value="aspect">
                <Maximize2 size={16} className="mr-2" />
                Aspect
              </TabsTrigger>
              <TabsTrigger value="rotate">
                <RotateCw size={16} className="mr-2" />
                Rotate
              </TabsTrigger>
            </TabsList>

            <TabsContent value="crop" className="space-y-4 mt-4">
              {/* Zoom Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <ZoomOut size={16} />
                    Zoom
                  </Label>
                  <span className="text-sm text-muted-foreground">{zoom.toFixed(1)}x</span>
                </div>
                <Slider
                  value={[zoom]}
                  onValueChange={(value) => setZoom(value[0])}
                  min={1}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Shape Control */}
              <div className="space-y-2">
                <Label>Crop Shape</Label>
                <div className="flex gap-2">
                  <Button
                    variant={currentCropShape === 'round' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentCropShape('round')}
                    className="flex-1"
                  >
                    <Circle size={16} className="mr-2" />
                    Circle
                  </Button>
                  <Button
                    variant={currentCropShape === 'rect' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentCropShape('rect')}
                    className="flex-1"
                  >
                    <Square size={16} className="mr-2" />
                    Square
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="aspect" className="space-y-4 mt-4">
              <Label>Aspect Ratio</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button
                  variant={currentAspectRatio === 1 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentAspectRatio(1)}
                >
                  1:1
                </Button>
                <Button
                  variant={currentAspectRatio === 4 / 3 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentAspectRatio(4 / 3)}
                >
                  4:3
                </Button>
                <Button
                  variant={currentAspectRatio === 16 / 9 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentAspectRatio(16 / 9)}
                >
                  16:9
                </Button>
                <Button
                  variant={currentAspectRatio === 3 / 4 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentAspectRatio(3 / 4)}
                >
                  3:4
                </Button>
                <Button
                  variant={currentAspectRatio === 9 / 16 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentAspectRatio(9 / 16)}
                >
                  9:16
                </Button>
                <Button
                  variant={currentAspectRatio === 2 / 3 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentAspectRatio(2 / 3)}
                >
                  2:3
                </Button>
                <Button
                  variant={currentAspectRatio === 3 / 2 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentAspectRatio(3 / 2)}
                >
                  3:2
                </Button>
                <Button
                  variant={!currentAspectRatio ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentAspectRatio(0)}
                >
                  Free
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="rotate" className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <RotateCw size={16} />
                    Rotation
                  </Label>
                  <span className="text-sm text-muted-foreground">{rotation}°</span>
                </div>
                <Slider
                  value={[rotation]}
                  onValueChange={(value) => setRotation(value[0])}
                  min={0}
                  max={360}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRotation((prev) => (prev - 90 + 360) % 360)}
                >
                  -90°
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRotation(0)}
                >
                  Reset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                >
                  +90°
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRotation(180)}
                >
                  180°
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
            className="flex-1 sm:flex-initial"
          >
            <X size={16} className="mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 sm:flex-initial"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check size={16} className="mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
