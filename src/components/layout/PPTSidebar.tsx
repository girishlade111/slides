import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

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
        'h-full bg-[#f3f3f3] flex flex-col outline-none relative',
        className
      )}
      style={{ width }}
    >
      {/* Resize handle */}
      <div
        className={cn(
          'absolute top-0 right-0 w-1 h-full cursor-ew-resize z-30',
          isResizing ? 'bg-[#0078d4]' : 'hover:bg-[#0078d4]/50'
        )}
        onMouseDown={handleResizeStart}
      />

      {/* Slide thumbnails */}
      <ScrollArea className="flex-1">
        <div className="py-2 px-1">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="flex items-center gap-1 mb-1 group"
              onClick={() => onSlideClick(index)}
            >
              {/* Slide number */}
              <div className="w-8 flex-shrink-0 text-right pr-1">
                <span className="text-[11px] text-[#888] font-normal">
                  {index + 1}
                </span>
              </div>

              {/* Thumbnail */}
              <div
                className={cn(
                  'flex-1 aspect-video bg-white rounded-sm overflow-hidden cursor-pointer border',
                  index === activeSlideIndex
                    ? 'border-[#0078d4] ring-1 ring-[#0078d4] shadow-sm'
                    : 'border-[#c0c0c0] hover:border-[#0078d4]/50'
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
        </div>
      </ScrollArea>
    </div>
  );
}
