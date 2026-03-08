import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, GripVertical } from 'lucide-react';

interface SlideItem {
  id: string;
  content: React.ReactNode;
}

interface PPTSidebarProps {
  slides: SlideItem[];
  activeSlideIndex: number;
  onSlideClick: (index: number) => void;
  width: number;
  onWidthChange: (width: number) => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
  onSnapClose?: () => void;
  className?: string;
}

export function PPTSidebar({
  slides,
  activeSlideIndex,
  onSlideClick,
  width,
  onWidthChange,
  onResizeStart,
  onResizeEnd,
  onSnapClose,
  className,
}: PPTSidebarProps) {
  const [isResizing, setIsResizing] = useState(false);

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
              className={cn(
                "flex items-center gap-1.5 mb-1.5 group cursor-pointer rounded-md py-0.5 px-0.5",
                index === activeSlideIndex && "bg-[#e6f7f6]"
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
                  'flex-1 aspect-video bg-white rounded overflow-hidden border-2 shadow-sm',
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
              </div>
            </div>
          ))}
          
          {/* Add slide button */}
          <div className="flex items-center gap-1.5 mt-2 mb-1 px-0.5">
            <div className="w-7" />
            <button className="flex-1 h-8 border-2 border-dashed border-[#d0d0d0] rounded-md flex items-center justify-center gap-1 text-[10px] text-[#999] font-medium hover:border-[#20B2AA] hover:text-[#20B2AA] hover:bg-[#e6f7f6]/50">
              <Plus className="w-3 h-3" />
              Add Slide
            </button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}