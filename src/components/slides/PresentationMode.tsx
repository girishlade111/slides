import React, { useEffect, useCallback, useState, useRef } from 'react';
import { ScaledSlide } from './ScaledSlide';

interface PresentationModeProps {
  slides: Array<{
    id: string;
    component: React.ComponentType<any>;
    isWIP?: boolean;
    description?: string;
  }>;
  activeIndex: number;
  onIndexChange: (index: number) => void;
  onExit: () => void;
}

const CURSOR_HIDE_MS = 2000;

type TransitionType = 'none' | 'fade' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'zoom';

export function PresentationMode({
  slides,
  activeIndex,
  onIndexChange,
  onExit,
}: PresentationModeProps) {
  const [startTime] = useState(Date.now);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [transition, setTransition] = useState<TransitionType>('fade');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayIndex, setDisplayIndex] = useState(activeIndex);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const cursorTimer = useRef<ReturnType<typeof setTimeout>>();

  // Navigate helpers
  const goNext = useCallback(() => {
    if (activeIndex < slides.length - 1) {
      setDirection('forward');
      onIndexChange(activeIndex + 1);
    }
  }, [activeIndex, slides.length, onIndexChange]);

  const goPrev = useCallback(() => {
    if (activeIndex > 0) {
      setDirection('backward');
      onIndexChange(activeIndex - 1);
    }
  }, [activeIndex, onIndexChange]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          goNext();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          goPrev();
          break;
        case 'Escape':
        case 'p':
        case 'P':
          e.preventDefault();
          onExit();
          break;
        case 'Home':
          e.preventDefault();
          setDirection('backward');
          onIndexChange(0);
          break;
        case 'End':
          e.preventDefault();
          setDirection('forward');
          onIndexChange(slides.length - 1);
          break;
      }
    },
    [goNext, goPrev, onIndexChange, onExit, slides.length]
  );

  // Fullscreen on mount
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        console.log('Fullscreen not available:', err);
      }
    };
    enterFullscreen();
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // Handle fullscreen exit via browser controls
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        onExit();
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [onExit]);

  // Keyboard controls
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Cursor auto-hide
  useEffect(() => {
    const handleMouseMove = () => {
      setCursorVisible(true);
      if (cursorTimer.current) clearTimeout(cursorTimer.current);
      cursorTimer.current = setTimeout(() => setCursorVisible(false), CURSOR_HIDE_MS);
    };
    window.addEventListener('mousemove', handleMouseMove);
    // Start hidden timer
    cursorTimer.current = setTimeout(() => setCursorVisible(false), CURSOR_HIDE_MS);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (cursorTimer.current) clearTimeout(cursorTimer.current);
    };
  }, []);

  // Transition effect when activeIndex changes
  useEffect(() => {
    if (activeIndex === displayIndex) return;
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setDisplayIndex(activeIndex);
      setIsTransitioning(false);
    }, transition === 'none' ? 0 : 300);
    return () => clearTimeout(timer);
  }, [activeIndex, displayIndex, transition]);

  const currentSlide = slides[displayIndex];
  const SlideComponent = currentSlide?.component;
  if (!SlideComponent) return null;

  // Elapsed time
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  // Transition CSS classes
  const getTransitionStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      transition: transition === 'none' ? 'none' : 'all 0.3s ease-in-out',
      width: '100%',
      height: '100%',
    };

    if (!isTransitioning) return base;

    switch (transition) {
      case 'fade':
        return { ...base, opacity: 0 };
      case 'slide-left':
        return { ...base, transform: direction === 'forward' ? 'translateX(-100%)' : 'translateX(100%)', opacity: 0 };
      case 'slide-right':
        return { ...base, transform: direction === 'forward' ? 'translateX(100%)' : 'translateX(-100%)', opacity: 0 };
      case 'slide-up':
        return { ...base, transform: 'translateY(-100%)', opacity: 0 };
      case 'slide-down':
        return { ...base, transform: 'translateY(100%)', opacity: 0 };
      case 'zoom':
        return { ...base, transform: 'scale(0.8)', opacity: 0 };
      default:
        return base;
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
      style={{ cursor: cursorVisible ? 'default' : 'none' }}
      onClick={goNext}
    >
      {/* Slide with transition */}
      <div className="w-full h-full flex items-center justify-center" style={getTransitionStyle()}>
        <ScaledSlide SlideComponent={SlideComponent} />
      </div>

      {/* Bottom bar - only visible when cursor is visible */}
      {cursorVisible && (
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-6 py-3 bg-gradient-to-t from-black/50 to-transparent">
          <div className="text-white/40 text-xs">
            ← → Space to navigate • Esc to exit
          </div>
          <div className="text-white/60 text-sm font-medium">
            {activeIndex + 1} / {slides.length}
          </div>
        </div>
      )}
    </div>
  );
}
