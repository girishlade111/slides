import React, { useEffect, useCallback, useState, useRef } from 'react';
import { KonvaSlideCanvas } from './KonvaSlideCanvas';
import { DrawingCanvas, type DrawTool } from './DrawingCanvas';
import type { SlideData } from '@/data/slides';
import { DEFAULT_TRANSITION, EASING_OPTIONS, getTransitionStyles } from '@/data/animations';
import {
  X, Pen, Eraser, Crosshair, Timer, ChevronLeft, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PresentationOverlayProps {
  slides: SlideData[];
  startIndex: number;
  onClose: () => void;
  initialMode?: 'normal' | 'presenter';
}

type ScreenMode = 'normal' | 'blank-black' | 'blank-white';

export function PresentationOverlay({ slides, startIndex, onClose, initialMode = 'normal' }: PresentationOverlayProps) {
  const [idx, setIdx] = useState(startIndex);
  const [prevIdx, setPrevIdx] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [animStep, setAnimStep] = useState(0);
  const [screenMode, setScreenMode] = useState<ScreenMode>('normal');
  const [activeTool, setActiveTool] = useState<DrawTool>('none');
  const [controlsVisible, setControlsVisible] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerPaused, setTimerPaused] = useState(false);
  const [jumpBuffer, setJumpBuffer] = useState('');
  const [showJumpHint, setShowJumpHint] = useState(false);

  const total = slides.length;
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const jumpTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [cursorVisible, setCursorVisible] = useState(true);

  const currentSlide = slides[idx];
  const transition = currentSlide?.transition ?? DEFAULT_TRANSITION;
  const easingCss = EASING_OPTIONS.find(e => e.value === transition.easing)?.css ?? 'ease';

  // Timer
  useEffect(() => {
    if (timerPaused) return;
    const interval = setInterval(() => setElapsedTime(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [timerPaused]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    return `${m.toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  };

  // Fullscreen
  useEffect(() => {
    document.documentElement.requestFullscreen().catch(() => {});
    return () => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, []);

  useEffect(() => {
    const handler = () => { if (!document.fullscreenElement) onClose(); };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, [onClose]);

  // Cursor auto-hide
  useEffect(() => {
    const show = () => {
      setCursorVisible(true);
      setControlsVisible(true);
      clearTimeout(cursorTimerRef.current);
      cursorTimerRef.current = setTimeout(() => {
        setCursorVisible(false);
        setControlsVisible(false);
      }, 3000);
    };
    window.addEventListener('mousemove', show);
    cursorTimerRef.current = setTimeout(() => {
      setCursorVisible(false);
      setControlsVisible(false);
    }, 3000);
    return () => {
      window.removeEventListener('mousemove', show);
      clearTimeout(cursorTimerRef.current);
    };
  }, []);

  const changeSlide = useCallback((newIdx: number) => {
    if (newIdx < 0 || newIdx >= total || transitioning) return;
    if (transition.type !== 'none') {
      setPrevIdx(idx);
      setTransitioning(true);
      setIdx(newIdx);
      setAnimStep(0);
      setTimeout(() => {
        setTransitioning(false);
        setPrevIdx(null);
      }, transition.duration * 1000);
    } else {
      setIdx(newIdx);
      setAnimStep(0);
    }
  }, [idx, total, transitioning, transition]);

  const handleAdvance = useCallback(() => {
    if (screenMode !== 'normal') { setScreenMode('normal'); return; }
    if (activeTool !== 'none') return;
    if (idx < total - 1) changeSlide(idx + 1);
  }, [screenMode, activeTool, idx, total, changeSlide]);

  const handleBack = useCallback(() => {
    if (screenMode !== 'normal') { setScreenMode('normal'); return; }
    if (activeTool !== 'none') return;
    if (idx > 0) changeSlide(idx - 1);
  }, [screenMode, activeTool, idx, changeSlide]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Number accumulation for jump
      if (e.key >= '0' && e.key <= '9') {
        const newBuf = jumpBuffer + e.key;
        setJumpBuffer(newBuf);
        setShowJumpHint(true);
        clearTimeout(jumpTimerRef.current);
        jumpTimerRef.current = setTimeout(() => {
          setJumpBuffer('');
          setShowJumpHint(false);
        }, 2000);
        return;
      }

      if (e.key === 'Enter' && jumpBuffer) {
        const target = parseInt(jumpBuffer, 10) - 1;
        if (target >= 0 && target < total) changeSlide(target);
        setJumpBuffer('');
        setShowJumpHint(false);
        clearTimeout(jumpTimerRef.current);
        return;
      }

      // Clear jump buffer on other keys
      setJumpBuffer('');
      setShowJumpHint(false);

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          handleAdvance();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'Backspace':
          e.preventDefault();
          handleBack();
          break;
        case 'Escape':
          if (activeTool !== 'none') { setActiveTool('none'); break; }
          onClose();
          break;
        case 'Home':
          e.preventDefault();
          changeSlide(0);
          break;
        case 'End':
          e.preventDefault();
          changeSlide(total - 1);
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          setScreenMode(m => m === 'blank-black' ? 'normal' : 'blank-black');
          break;
        case 'w':
        case 'W':
          e.preventDefault();
          setScreenMode(m => m === 'blank-white' ? 'normal' : 'blank-white');
          break;
        case 'b':
        case 'B':
          e.preventDefault();
          setScreenMode(m => m === 'blank-black' ? 'normal' : 'blank-black');
          break;
        case '.':
          e.preventDefault();
          setScreenMode(m => m !== 'normal' ? 'normal' : 'blank-black');
          break;
        case 'e':
        case 'E':
          e.preventDefault();
          setActiveTool(t => t === 'pen' ? 'none' : 'pen');
          break;
        case 'l':
        case 'L':
          if (e.ctrlKey || e.metaKey) { e.preventDefault(); setActiveTool(t => t === 'laser' ? 'none' : 'laser'); }
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [jumpBuffer, total, handleAdvance, handleBack, changeSlide, activeTool, onClose]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] bg-black overflow-hidden"
      style={{ cursor: cursorVisible ? 'default' : 'none' }}
    >
      {/* Blank screens */}
      {screenMode === 'blank-black' && (
        <div className="absolute inset-0 bg-black z-40" onClick={() => setScreenMode('normal')} />
      )}
      {screenMode === 'blank-white' && (
        <div className="absolute inset-0 bg-white z-40" onClick={() => setScreenMode('normal')} />
      )}

      {/* Slide area — click right side to advance, left to go back */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ zIndex: 10 }}
      >
        {/* Previous slide exit */}
        {prevIdx !== null && transitioning && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              ...getTransitionStyles(transition, 'exit'),
              transition: `all ${transition.duration}s ${easingCss}`,
            }}
          >
            <SlideDisplay slide={slides[prevIdx]} scale={getScale()} />
          </div>
        )}

        {/* Current slide enter */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={transitioning ? {
            ...getTransitionStyles(transition, 'enter'),
            transition: `all ${transition.duration}s ${easingCss}`,
          } : {}}
          onClick={handleAdvance}
        >
          <SlideDisplay slide={currentSlide} scale={getScale()} />
        </div>

        {/* Left click zone for back */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1/5 z-10"
          style={{ cursor: 'w-resize' }}
          onClick={e => { e.stopPropagation(); handleBack(); }}
        />
      </div>

      {/* Drawing canvas */}
      <DrawingCanvas
        activeTool={activeTool}
        onToolChange={setActiveTool}
        containerRef={containerRef}
        className="z-20"
      />

      {/* Jump hint */}
      {showJumpHint && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 bg-black/80 text-white px-6 py-3 rounded-full text-2xl font-mono border border-white/20">
          Slide: {jumpBuffer}_
        </div>
      )}

      {/* Controls bar */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 z-30 transition-opacity duration-300',
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
      >
        <div className="flex items-center justify-between px-8 py-4 bg-gradient-to-t from-black/80 to-transparent">
          {/* Left: Slide counter + timer */}
          <div className="flex items-center gap-4">
            <span className="text-white font-medium text-sm">
              {idx + 1} <span className="text-white/40">/</span> {total}
            </span>
            <div className="flex items-center gap-1.5 text-white/60 text-sm">
              <Timer className="w-3.5 h-3.5" />
              <span className="font-mono">{formatTime(elapsedTime)}</span>
              <button
                onClick={e => { e.stopPropagation(); setTimerPaused(p => !p); }}
                className="ml-1 text-white/40 hover:text-white/80 transition-colors text-xs"
              >
                {timerPaused ? '▶' : '⏸'}
              </button>
            </div>
          </div>

          {/* Center: Nav arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={e => { e.stopPropagation(); handleBack(); }}
              disabled={idx === 0}
              className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={e => { e.stopPropagation(); handleAdvance(); }}
              disabled={idx === total - 1}
              className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Tools + exit */}
          <div className="flex items-center gap-2">
            {/* Pen */}
            <button
              onClick={e => { e.stopPropagation(); setActiveTool(t => t === 'pen' ? 'none' : 'pen'); }}
              title="Pen tool (E)"
              className={cn(
                'p-2 rounded-full transition-colors',
                activeTool === 'pen'
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              )}
            >
              <Pen className="w-4 h-4" />
            </button>

            {/* Eraser */}
            <button
              onClick={e => { e.stopPropagation(); setActiveTool(t => t === 'eraser' ? 'none' : 'eraser'); }}
              title="Eraser"
              className={cn(
                'p-2 rounded-full transition-colors',
                activeTool === 'eraser'
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              )}
            >
              <Eraser className="w-4 h-4" />
            </button>

            {/* Laser */}
            <button
              onClick={e => { e.stopPropagation(); setActiveTool(t => t === 'laser' ? 'none' : 'laser'); }}
              title="Laser pointer (Ctrl+L)"
              className={cn(
                'p-2 rounded-full transition-colors',
                activeTool === 'laser'
                  ? 'bg-red-500/30 text-red-400'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              )}
            >
              <Crosshair className="w-4 h-4" />
            </button>

            {/* Blank */}
            <button
              onClick={e => { e.stopPropagation(); setScreenMode(m => m !== 'normal' ? 'normal' : 'blank-black'); }}
              title="Blank screen (B/P)"
              className={cn(
                'p-2 rounded-full transition-colors text-xs font-mono',
                screenMode !== 'normal'
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              )}
            >
              B
            </button>

            <div className="w-px h-5 bg-white/20 mx-1" />

            {/* Help text */}
            <span className="text-white/30 text-xs hidden lg:block">
              ← → navigate · E pen · Esc exit
            </span>

            {/* Exit */}
            <button
              onClick={e => { e.stopPropagation(); onClose(); }}
              title="Exit (Esc)"
              className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper to compute slide scale based on viewport
function getScale() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return Math.min(vw / 960, vh / 540);
}

// Inline slide display at the correct size
function SlideDisplay({ slide, scale }: { slide: SlideData | undefined; scale: number }) {
  if (!slide) return null;
  return (
    <div
      style={{
        width: 960 * scale,
        height: 540 * scale,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 4,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 960,
          height: 540,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        <KonvaSlideCanvas slide={slide} readOnly />
      </div>
    </div>
  );
}
