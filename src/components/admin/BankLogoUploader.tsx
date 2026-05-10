import React, { useState, useRef, useCallback, useEffect } from "react";
import { Upload, ZoomIn, ZoomOut, RotateCcw, Check, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// 🧠 STANDARDIZED OUTPUT: All bank logos are normalized to this exact size.
// 2:1 aspect ratio — optimized for horizontal partner marquees and CRM table cells.
const OUTPUT_WIDTH = 320;
const OUTPUT_HEIGHT = 160;
const ASPECT_RATIO = OUTPUT_WIDTH / OUTPUT_HEIGHT;

// Preview canvas dimensions (larger for comfortable editing)
const CANVAS_WIDTH = 384;
const CANVAS_HEIGHT = 192;

interface BankLogoUploaderProps {
  currentLogoUrl?: string;
  onLogoReady: (dataUrl: string) => void;
  onCancel: () => void;
}

export const BankLogoUploader: React.FC<BankLogoUploaderProps> = ({
  currentLogoUrl,
  onLogoReady,
  onCancel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [fileName, setFileName] = useState("");

  // Load image from file
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(file.type)) {
      return;
    }

    // Validate file size (max 2MB for logos)
    if (file.size > 2 * 1024 * 1024) {
      return;
    }

    setFileName(file.name);

    const img = new Image();
    img.onload = () => {
      setImage(img);
      // Auto-fit: Calculate initial zoom to fill the crop area
      const scaleX = CANVAS_WIDTH / img.width;
      const scaleY = CANVAS_HEIGHT / img.height;
      const initialZoom = Math.max(scaleX, scaleY);
      setZoom(initialZoom);
      // Center the image
      setOffset({
        x: (CANVAS_WIDTH - img.width * initialZoom) / 2,
        y: (CANVAS_HEIGHT - img.height * initialZoom) / 2,
      });
    };
    img.src = URL.createObjectURL(file);
  }, []);

  // Draw the canvas preview
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Clear
    ctx.fillStyle = "#0d0d14";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (image) {
      ctx.save();
      ctx.drawImage(
        image,
        offset.x,
        offset.y,
        image.width * zoom,
        image.height * zoom
      );
      ctx.restore();
    } else {
      // Placeholder grid
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1;
      for (let x = 0; x < CANVAS_WIDTH; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y < CANVAS_HEIGHT; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }
      // Center crosshair
      ctx.strokeStyle = "rgba(59, 130, 246, 0.3)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH / 2, 0);
      ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
      ctx.moveTo(0, CANVAS_HEIGHT / 2);
      ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Crop border overlay
    ctx.strokeStyle = "rgba(59, 130, 246, 0.5)";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, CANVAS_WIDTH - 2, CANVAS_HEIGHT - 2);

    // Corner handles
    const cornerSize = 12;
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2.5;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(1, cornerSize);
    ctx.lineTo(1, 1);
    ctx.lineTo(cornerSize, 1);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH - cornerSize, 1);
    ctx.lineTo(CANVAS_WIDTH - 1, 1);
    ctx.lineTo(CANVAS_WIDTH - 1, cornerSize);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(1, CANVAS_HEIGHT - cornerSize);
    ctx.lineTo(1, CANVAS_HEIGHT - 1);
    ctx.lineTo(cornerSize, CANVAS_HEIGHT - 1);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH - cornerSize, CANVAS_HEIGHT - 1);
    ctx.lineTo(CANVAS_WIDTH - 1, CANVAS_HEIGHT - 1);
    ctx.lineTo(CANVAS_WIDTH - 1, CANVAS_HEIGHT - cornerSize);
    ctx.stroke();
  }, [image, zoom, offset]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!image) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !image) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!image) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !image) return;
    const touch = e.touches[0];
    setOffset({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  // Zoom with scroll wheel
  const handleWheel = (e: React.WheelEvent) => {
    if (!image) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setZoom((prev) => Math.max(0.1, Math.min(5, prev + delta)));
  };

  // Export the final cropped image
  const handleConfirm = () => {
    if (!image) return;

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = OUTPUT_WIDTH;
    exportCanvas.height = OUTPUT_HEIGHT;
    const ctx = exportCanvas.getContext("2d")!;

    // White background (for transparent PNGs)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

    // Scale from preview canvas to output canvas
    const scaleX = OUTPUT_WIDTH / CANVAS_WIDTH;
    const scaleY = OUTPUT_HEIGHT / CANVAS_HEIGHT;

    ctx.drawImage(
      image,
      offset.x * scaleX,
      offset.y * scaleY,
      image.width * zoom * scaleX,
      image.height * zoom * scaleY
    );

    // Export as JPEG with 85% quality — keeps data URLs under 20KB
    const dataUrl = exportCanvas.toDataURL("image/jpeg", 0.85);
    onLogoReady(dataUrl);
  };

  const handleReset = () => {
    if (!image) return;
    const scaleX = CANVAS_WIDTH / image.width;
    const scaleY = CANVAS_HEIGHT / image.height;
    const initialZoom = Math.max(scaleX, scaleY);
    setZoom(initialZoom);
    setOffset({
      x: (CANVAS_WIDTH - image.width * initialZoom) / 2,
      y: (CANVAS_HEIGHT - image.height * initialZoom) / 2,
    });
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone / Canvas */}
      <div className="relative">
        {!image ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-48 border-2 border-dashed border-white/[0.1] rounded-xl bg-white/[0.02] hover:bg-white/[0.04] hover:border-blue-500/30 transition-all flex flex-col items-center justify-center gap-3 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
              <Upload className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-300">
                Drop logo image or click to browse
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                PNG, JPG, WebP • Max 2MB • Output: {OUTPUT_WIDTH}×{OUTPUT_HEIGHT}px
              </p>
            </div>
          </button>
        ) : (
          <div className="space-y-3">
            <div
              className="relative rounded-xl overflow-hidden border border-white/[0.08] bg-[#0d0d14] mx-auto"
              style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
            >
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className={cn("cursor-grab", isDragging && "cursor-grabbing")}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={() => setIsDragging(false)}
                onWheel={handleWheel}
              />
              {/* Size badge */}
              <div className="absolute top-2 right-2 text-[9px] font-mono bg-black/60 text-slate-400 px-1.5 py-0.5 rounded border border-white/[0.06]">
                {OUTPUT_WIDTH}×{OUTPUT_HEIGHT}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom((z) => Math.max(0.1, z - 0.1))}
                  className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-slate-400 hover:text-white transition-colors"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <div className="w-28 relative">
                  <input
                    type="range"
                    min={10}
                    max={500}
                    value={Math.round(zoom * 100)}
                    onChange={(e) => setZoom(Number(e.target.value) / 100)}
                    className="w-full h-1 bg-white/[0.08] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-300"
                  />
                </div>
                <button
                  onClick={() => setZoom((z) => Math.min(5, z + 0.1))}
                  className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-slate-400 hover:text-white transition-colors"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] text-slate-500 font-mono ml-1">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleReset}
                  className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-slate-400 hover:text-white transition-colors"
                  title="Reset position"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-slate-400 hover:text-white transition-colors"
                  title="Choose different image"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {fileName && (
              <p className="text-[10px] text-slate-500 text-center truncate">
                {fileName}
              </p>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-slate-400 hover:text-white"
        >
          <X className="w-3.5 h-3.5 mr-1.5" /> Cancel
        </Button>
        <Button
          size="sm"
          disabled={!image}
          onClick={handleConfirm}
          className="bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40"
        >
          <Check className="w-3.5 h-3.5 mr-1.5" /> Apply Logo
        </Button>
      </div>
    </div>
  );
};

export default BankLogoUploader;
