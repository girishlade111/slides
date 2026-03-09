import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Pen, Eraser, Trash2, X } from 'lucide-react';

export type DrawTool = 'pen' | 'eraser' | 'laser' | 'none';

interface DrawPoint { x: number; y: number }
interface DrawPath {
  points: DrawPoint[];
  color: string;
  thickness: number;
  isLaser: boolean;
}

interface DrawingCanvasProps {
  activeTool: DrawTool;
  onToolChange: (tool: DrawTool) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  className?: string;
}

const PEN_COLORS = [
  { label: 'Red',    value: '#ef4444' },
  { label: 'Blue',   value: '#3b82f6' },
  { label: 'Green',  value: '#22c55e' },
  { label: 'Yellow', value: '#eab308' },
  { label: 'White',  value: '#ffffff' },
];

const PEN_THICKNESSES = [2, 4, 8];

export function DrawingCanvas({ activeTool, onToolChange, containerRef, className }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathsRef = useRef<DrawPath[]>([]);
  const currentPathRef = useRef<DrawPath | null>(null);
  const isDrawingRef = useRef(false);
  const laserDotRef = useRef<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });
  const laserRippleRef = useRef<{ x: number; y: number; r: number; alpha: number } | null>(null);
  const animFrameRef = useRef<number>(0);

  const [penColor, setPenColor] = useState('#ef4444');
  const [penThickness, setPenThickness] = useState(4);
  const [showToolbar, setShowToolbar] = useState(true);

  const isPen = activeTool === 'pen';
  const isEraser = activeTool === 'eraser';
  const isLaser = activeTool === 'laser';
  const isActive = isPen || isEraser || isLaser;

  // Resize canvas to fill its container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const { offsetWidth, offsetHeight } = canvas.parentElement!;
      canvas.width = offsetWidth;
      canvas.height = offsetHeight;
      redraw();
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    return () => ro.disconnect();
  }, []);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw permanent paths
    for (const path of pathsRef.current) {
      if (path.isLaser || path.points.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.thickness;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    // Current path being drawn
    if (currentPathRef.current && !currentPathRef.current.isLaser) {
      const path = currentPathRef.current;
      if (path.points.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(path.points[0].x, path.points[0].y);
        for (let i = 1; i < path.points.length; i++) {
          ctx.lineTo(path.points[i].x, path.points[i].y);
        }
        ctx.strokeStyle = path.isLaser ? '#ef4444' : path.color;
        ctx.lineWidth = path.thickness;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (path.isLaser) {
          ctx.globalAlpha = 0.6;
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 12;
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }
    }

    // Laser pointer dot
    if (isLaser && laserDotRef.current.visible) {
      const { x, y } = laserDotRef.current;
      // Outer glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 20);
      gradient.addColorStop(0, 'rgba(239,68,68,0.6)');
      gradient.addColorStop(1, 'rgba(239,68,68,0)');
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      // Core dot
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
    }

    // Ripple effect
    if (laserRippleRef.current) {
      const r = laserRippleRef.current;
      if (r.alpha > 0) {
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(239,68,68,${r.alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        r.r += 3;
        r.alpha -= 0.04;
        if (r.alpha <= 0) laserRippleRef.current = null;
        animFrameRef.current = requestAnimationFrame(redraw);
      }
    }
  }, [isLaser]);

  const getCanvasPos = (e: MouseEvent | React.MouseEvent): DrawPoint => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isActive) return;

    if (isLaser) {
      const pos = getCanvasPos(e);
      laserDotRef.current = { ...pos, visible: true };
      redraw();
      return;
    }

    if (!isDrawingRef.current) return;
    const pos = getCanvasPos(e);

    if (isEraser) {
      // Erase paths near cursor
      const radius = penThickness * 3;
      pathsRef.current = pathsRef.current.filter(path => {
        return !path.points.some(p =>
          Math.sqrt((p.x - pos.x) ** 2 + (p.y - pos.y) ** 2) < radius
        );
      });
      redraw();
      return;
    }

    if (currentPathRef.current) {
      currentPathRef.current.points.push(pos);
      redraw();
    }
  }, [isActive, isLaser, isEraser, penThickness, redraw]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (!isActive || e.button !== 0) return;

    if (isLaser) {
      const pos = getCanvasPos(e);
      laserRippleRef.current = { x: pos.x, y: pos.y, r: 5, alpha: 0.8 };
      animFrameRef.current = requestAnimationFrame(redraw);
      return;
    }

    if (isEraser) {
      isDrawingRef.current = true;
      return;
    }

    if (isPen) {
      isDrawingRef.current = true;
      const pos = getCanvasPos(e);
      currentPathRef.current = {
        points: [pos],
        color: penColor,
        thickness: penThickness,
        isLaser: false,
      };
    }
  }, [isActive, isLaser, isEraser, isPen, penColor, penThickness, redraw]);

  const handleMouseUp = useCallback(() => {
    if (isDrawingRef.current && currentPathRef.current && !isEraser) {
      pathsRef.current.push(currentPathRef.current);
      currentPathRef.current = null;
    }
    isDrawingRef.current = false;
  }, [isEraser]);

  const handleMouseLeave = useCallback(() => {
    if (isLaser) {
      laserDotRef.current.visible = false;
      redraw();
    }
    handleMouseUp();
  }, [isLaser, handleMouseUp, redraw]);

  // Attach events to the canvas element
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseDown, handleMouseUp, handleMouseLeave]);

  // When laser is deactivated, clear the dot
  useEffect(() => {
    if (!isLaser) {
      laserDotRef.current.visible = false;
      redraw();
    }
  }, [isLaser, redraw]);

  const clearAll = () => {
    pathsRef.current = [];
    currentPathRef.current = null;
    redraw();
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        className={cn(
          'absolute inset-0 w-full h-full z-20',
          isActive && 'pointer-events-auto',
          !isActive && 'pointer-events-none',
          isPen && 'cursor-crosshair',
          isEraser && 'cursor-cell',
          isLaser && 'cursor-none',
        )}
        style={{ touchAction: 'none' }}
      />

      {/* Drawing toolbar - floating pill */}
      {isActive && showToolbar && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-black/80 backdrop-blur-sm rounded-full px-3 py-2 border border-white/20 shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {isPen && (
            <>
              {/* Color swatches */}
              {PEN_COLORS.map(c => (
                <button
                  key={c.value}
                  title={c.label}
                  onClick={() => setPenColor(c.value)}
                  className={cn(
                    'w-5 h-5 rounded-full border-2 transition-transform',
                    penColor === c.value ? 'border-white scale-125' : 'border-transparent scale-100'
                  )}
                  style={{ backgroundColor: c.value }}
                />
              ))}
              <div className="w-px h-5 bg-white/20 mx-1" />
              {/* Thickness */}
              {PEN_THICKNESSES.map(t => (
                <button
                  key={t}
                  onClick={() => setPenThickness(t)}
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center transition-colors',
                    penThickness === t ? 'bg-white/20' : 'hover:bg-white/10'
                  )}
                  title={`${t}px`}
                >
                  <div
                    className="rounded-full bg-white"
                    style={{ width: t + 2, height: t + 2 }}
                  />
                </button>
              ))}
              <div className="w-px h-5 bg-white/20 mx-1" />
            </>
          )}

          {/* Eraser indicator */}
          {isEraser && (
            <div className="flex items-center gap-2 px-2">
              <Eraser className="w-4 h-4 text-white/80" />
              <span className="text-xs text-white/60">Eraser active</span>
              <div className="w-px h-5 bg-white/20 mx-1" />
            </div>
          )}

          {/* Clear all */}
          <button
            onClick={clearAll}
            title="Clear all drawings"
            className="w-7 h-7 rounded-full flex items-center justify-center text-red-400 hover:bg-white/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Close drawing */}
          <button
            onClick={() => { onToolChange('none'); }}
            title="Exit drawing"
            className="w-7 h-7 rounded-full flex items-center justify-center text-white/60 hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </>
  );
}
