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

  const handleZoomSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    onZoomChange(parseInt(e.target.value));
  };

  return (
    <div className="h-6 bg-[#f3f3f3] border-t border-[#d1d1d1] flex items-center justify-between px-2 select-none text-[11px] text-[#666] shrink-0">
      {/* Left: Slide info */}
      <div className="flex items-center gap-3">
        <span>Slide {currentSlide} of {totalSlides}</span>
        <span className="text-[#999]">|</span>
        <span>English (United States)</span>
      </div>

      {/* Right: View buttons + Zoom */}
      <div className="flex items-center gap-1">
        {/* Notes toggle */}
        <button
          onClick={onToggleNotes}
          className={cn(
            "w-6 h-5 flex items-center justify-center rounded-sm hover:bg-[#e0e0e0]",
            showNotes && "bg-[#d0d0d0]"
          )}
          title="Notes"
        >
          <FileText className="w-3 h-3" />
        </button>

        {/* Comments */}
        <button className="w-6 h-5 flex items-center justify-center rounded-sm hover:bg-[#e0e0e0]" title="Comments">
          <MessageSquare className="w-3 h-3" />
        </button>

        <div className="w-px h-3 bg-[#c0c0c0] mx-1" />

        {/* View mode buttons */}
        <button
          onClick={() => showGrid && onToggleGrid()}
          className={cn(
            "w-6 h-5 flex items-center justify-center rounded-sm hover:bg-[#e0e0e0]",
            !showGrid && "bg-[#d0d0d0]"
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
            "w-6 h-5 flex items-center justify-center rounded-sm hover:bg-[#e0e0e0]",
            showGrid && "bg-[#d0d0d0]"
          )}
          title="Slide Sorter"
        >
          <LayoutGrid className="w-3 h-3" />
        </button>

        <button className="w-6 h-5 flex items-center justify-center rounded-sm hover:bg-[#e0e0e0]" title="Reading View">
          <BookOpen className="w-3 h-3" />
        </button>

        <button
          onClick={onStartPresentation}
          className="w-6 h-5 flex items-center justify-center rounded-sm hover:bg-[#e0e0e0]"
          title="Slide Show"
        >
          <Play className="w-3 h-3" />
        </button>

        <div className="w-px h-3 bg-[#c0c0c0] mx-1" />

        {/* Zoom controls */}
        <button
          onClick={() => onZoomChange(Math.max(ZOOM_MIN, zoom - 10))}
          className="w-5 h-5 flex items-center justify-center rounded-sm hover:bg-[#e0e0e0]"
        >
          <Minus className="w-2.5 h-2.5" />
        </button>

        <input
          type="range"
          min={ZOOM_MIN}
          max={ZOOM_MAX}
          value={zoom}
          onChange={handleZoomSlider}
          className="w-20 h-1 appearance-none bg-[#c0c0c0] rounded cursor-pointer accent-[#666]"
          style={{ accentColor: '#666' }}
        />

        <button
          onClick={() => onZoomChange(Math.min(ZOOM_MAX, zoom + 10))}
          className="w-5 h-5 flex items-center justify-center rounded-sm hover:bg-[#e0e0e0]"
        >
          <Plus className="w-2.5 h-2.5" />
        </button>

        <span className="min-w-[32px] text-center text-[10px]">{zoom}%</span>

        {/* Fit to window */}
        <button
          onClick={() => onZoomChange(100)}
          className="w-6 h-5 flex items-center justify-center rounded-sm hover:bg-[#e0e0e0] text-[10px]"
          title="Fit slide to current window"
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
