import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { FixedSizeList as List } from 'react-window';
import { Plus, Copy, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SlideItem {
  id: string;
  content: React.ReactNode;
}

interface PPTSidebarProps {
  slides: SlideItem[];
  activeSlideIndex: number;
  onSlideClick: (index: number) => void;
  onAddSlide?: () => void;
  onDeleteSlide?: (slideId: string) => void;
  onDuplicateSlide?: (slideId: string) => void;
  onReorderSlides?: (fromIndex: number, toIndex: number) => void;
  width: number;
  onWidthChange: (width: number) => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
  onSnapClose?: () => void;
  canDeleteSlide?: boolean;
  className?: string;
}

export function PPTSidebar({
  slides,
  activeSlideIndex,
  onSlideClick,
  onAddSlide,
  onDeleteSlide,
  onDuplicateSlide,
  onReorderSlides,
  width,
  onWidthChange,
  onResizeStart,
  onResizeEnd,
  onSnapClose,
  canDeleteSlide = true,
  className,
}: PPTSidebarProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragSourceIndex, setDragSourceIndex] = useState<number | null>(null);

  const SNAP_CLOSE_THRESHOLD = 120;
  const MIN_WIDTH = 160;
  const MAX_WIDTH = 360;

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    onResizeStart?.();
    
    const startX = e.clientX;
    const startWidth = width;
    let shouldSnapClose = false;
    
    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startX;
      const rawWidth = startWidth + delta;
      
      if (rawWidth < SNAP_CLOSE_THRESHOLD) {
        shouldSnapClose = true;
        onWidthChange(MIN_WIDTH);
      } else {
        shouldSnapClose = false;
        const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, rawWidth));
        onWidthChange(newWidth);
      }
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      onResizeEnd?.();
      if (shouldSnapClose) {
        onSnapClose?.();
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [width, onWidthChange, onResizeStart, onResizeEnd, onSnapClose]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragSourceIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (!isNaN(fromIndex) && fromIndex !== toIndex) {
      onReorderSlides?.(fromIndex, toIndex);
    }
    setDragOverIndex(null);
    setDragSourceIndex(null);
  };

  const handleDragEnd = () => {
    setDragOverIndex(null);
    setDragSourceIndex(null);
  };

  return (
    <div
      className={cn(
        'h-full bg-[#f8f9fa] flex flex-col outline-none relative',
        className
      )}
      style={{ width }}
    >
      {/* Resize handle */}
      <div
        className={cn(
          'absolute top-0 right-0 w-1 h-full cursor-ew-resize z-30',
          isResizing ? 'bg-[#20B2AA]' : 'hover:bg-[#20B2AA]/50'
        )}
        onMouseDown={handleResizeStart}
      />

      {/* Slide thumbnails */}
      <ScrollArea className="flex-1">
        <div className="py-2 px-1.5">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                "flex items-center gap-1.5 mb-1 group cursor-pointer rounded-md py-0.5 px-0.5 relative",
                index === activeSlideIndex && "bg-[#e6f7f6]",
                dragOverIndex === index && dragSourceIndex !== index && "ring-2 ring-[#20B2AA] ring-offset-1",
                dragSourceIndex === index && "opacity-40"
              )}
              onClick={() => onSlideClick(index)}
            >
              {/* Slide number */}
              <div className="w-7 flex-shrink-0 text-right pr-0.5">
                <span className={cn(
                  "text-[11px] font-medium",
                  index === activeSlideIndex ? "text-[#20B2AA]" : "text-[#aaa]"
                )}>
                  {index + 1}
                </span>
              </div>

              {/* Thumbnail */}
              <div
                className={cn(
                  'flex-1 aspect-video bg-white rounded overflow-hidden border-2 shadow-sm relative',
                  index === activeSlideIndex
                    ? 'border-[#20B2AA] shadow-md'
                    : 'border-transparent hover:border-[#20B2AA]/30'
                )}
              >
                <div className="relative w-full h-full overflow-hidden">
                  <div className="absolute inset-0 bg-white" />
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div
                      className="origin-top-left"
                      style={{
                        transform: 'scale(0.1)',
                        width: '1000%',
                        height: '1000%',
                      }}
                    >
                      {slide.content}
                    </div>
                  </div>
                </div>

                {/* Context menu button - appears on hover */}
                <div className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="w-5 h-5 flex items-center justify-center rounded bg-black/30 hover:bg-black/50 text-white"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-3 h-3" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-[140px]">
                      <DropdownMenuItem onClick={() => onDuplicateSlide?.(slide.id)}>
                        <Copy className="w-3.5 h-3.5 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAddSlide?.()}>
                        <Plus className="w-3.5 h-3.5 mr-2" />
                        Add Slide After
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDeleteSlide?.(slide.id)}
                        disabled={!canDeleteSlide}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
          
          {/* Add slide button */}
          <div className="flex items-center gap-1.5 mt-2 mb-1 px-0.5">
            <div className="w-7" />
            <button
              onClick={onAddSlide}
              className="flex-1 h-8 border-2 border-dashed border-[#d0d0d0] rounded-md flex items-center justify-center gap-1 text-[10px] text-[#999] font-medium hover:border-[#20B2AA] hover:text-[#20B2AA] hover:bg-[#e6f7f6]/50"
            >
              <Plus className="w-3 h-3" />
              Add Slide
            </button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}