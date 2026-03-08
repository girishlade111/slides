import React from 'react';
import { cn } from '@/lib/utils';
import { FileText, MessageSquare, LayoutGrid, BookOpen, Play, Minus, Plus } from 'lucide-react';

interface PPTStatusBarProps {
  currentSlide: number;
  totalSlides: number;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  showNotes: boolean;
  onToggleNotes: () => void;
  onStartPresentation?: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
}

export function PPTStatusBar({
  currentSlide,
  totalSlides,
  zoom,
  onZoomChange,
  showNotes,
  onToggleNotes,
  onStartPresentation,
  showGrid,
  onToggleGrid,
}: PPTStatusBarProps) {
  const ZOOM_MIN = 10;
  const ZOOM_MAX = 400;

  return (
    <div className="h-7 bg-[#f8f9fa] border-t border-[#e0e0e0] flex items-center justify-between px-3 select-none text-[11px] text-[#666] shrink-0">
      {/* Left: Slide info + Powered by */}
      <div className="flex items-center gap-3">
        <span className="font-medium text-[#555]">Slide {currentSlide} of {totalSlides}</span>
        <span className="text-[#ccc]">|</span>
        <span className="text-[#999]">English (United States)</span>
        <span className="text-[#ccc]">|</span>
        <span className="text-[10px] text-[#bbb]">
          Powered by{' '}
          <span className="font-semibold" style={{ color: 'hsl(174, 80%, 41%)' }}>Lade Stack</span>
        </span>
      </div>

      {/* Right: View buttons + Zoom */}
      <div className="flex items-center gap-1">
        {/* Notes toggle */}
        <button
          onClick={onToggleNotes}
          className={cn(
            "w-6 h-5 flex items-center justify-center rounded hover:bg-[#e8e8e8]",
            showNotes && "bg-[#d8d8d8]"
          )}
          title="Notes"
        >
          <FileText className="w-3 h-3" />
        </button>

        <button className="w-6 h-5 flex items-center justify-center rounded hover:bg-[#e8e8e8]" title="Comments">
          <MessageSquare className="w-3 h-3" />
        </button>

        <div className="w-px h-3.5 bg-[#d0d0d0] mx-1" />

        {/* View mode buttons */}
        <button
          onClick={() => showGrid && onToggleGrid()}
          className={cn(
            "w-6 h-5 flex items-center justify-center rounded hover:bg-[#e8e8e8]",
            !showGrid && "bg-[#d8d8d8]"
          )}
          title="Normal View"
        >
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
            <rect x="0" y="0" width="5" height="16" rx="0.5" opacity="0.4" />
            <rect x="6" y="0" width="10" height="16" rx="0.5" />
          </svg>
        </button>

        <button
          onClick={() => !showGrid && onToggleGrid()}
          className={cn(
            "w-6 h-5 flex items-center justify-center rounded hover:bg-[#e8e8e8]",
            showGrid && "bg-[#d8d8d8]"
          )}
          title="Slide Sorter"
        >
          <LayoutGrid className="w-3 h-3" />
        </button>

        <button className="w-6 h-5 flex items-center justify-center rounded hover:bg-[#e8e8e8]" title="Reading View">
          <BookOpen className="w-3 h-3" />
        </button>

        <button
          onClick={onStartPresentation}
          className="w-6 h-5 flex items-center justify-center rounded hover:bg-[#e8e8e8]"
          title="Slide Show (F5)"
        >
          <Play className="w-3 h-3" />
        </button>

        <div className="w-px h-3.5 bg-[#d0d0d0] mx-1" />

        {/* Zoom controls */}
        <button
          onClick={() => onZoomChange(Math.max(ZOOM_MIN, zoom - 10))}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#e8e8e8]"
        >
          <Minus className="w-2.5 h-2.5" />
        </button>

        <div className="relative w-24 h-4 flex items-center">
          <input
            type="range"
            min={ZOOM_MIN}
            max={ZOOM_MAX}
            value={zoom}
            onChange={(e) => onZoomChange(parseInt(e.target.value))}
            className="w-full h-1 appearance-none bg-[#d0d0d0] rounded-full cursor-pointer"
            style={{ accentColor: 'hsl(174, 80%, 41%)' }}
          />
        </div>

        <button
          onClick={() => onZoomChange(Math.min(ZOOM_MAX, zoom + 10))}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#e8e8e8]"
        >
          <Plus className="w-2.5 h-2.5" />
        </button>

        <span className="min-w-[36px] text-center text-[10px] font-medium text-[#666]">{zoom}%</span>

        <button
          onClick={() => onZoomChange(100)}
          className="w-6 h-5 flex items-center justify-center rounded hover:bg-[#e8e8e8]"
          title="Fit to window"
        >
          <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="4" width="12" height="8" rx="0.5" />
            <path d="M5 7l3 3 3-3" />
          </svg>
        </button>
      </div>
    </div>
  );
}