import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import {
  ChevronLeft, ChevronRight, X, Play, Pause,
  RotateCcw, FileText, Timer, Maximize2, Grid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KonvaSlideCanvas } from './KonvaSlideCanvas';
import type { SlideData } from '@/data/slides';

interface PresenterModeViewProps {
  slides: SlideData[];
  startIndex: number;
  onClose: () => void;
  onUpdateNotes?: (slideId: string, notes: string) => void;
}

export function PresenterModeView({ slides, startIndex, onClose, onUpdateNotes }: PresenterModeViewProps) {
  const [idx, setIdx] = useState(startIndex);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [slideTime, setSlideTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [showGrid, setShowGrid] = useState(false);

  const total = slides.length;
  const currentSlide = slides[idx];
  const nextSlide = slides[idx + 1];

  // Keep notes in sync with current slide
  useEffect(() => {
    setNotesText((currentSlide as any)?.notes ?? '');
    setSlideTime(0);
  }, [idx, currentSlide]);

  // Timers
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setElapsedTime(t => t + 1);
      setSlideTime(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    return `${m.toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  };

  const goTo = useCallback((newIdx: number) => {
    if (newIdx >= 0 && newIdx < total) setIdx(newIdx);
  }, [total]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          goTo(idx + 1);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          goTo(idx - 1);
          break;
        case 'Escape':
          onClose();
          break;
        case 'Home':
          e.preventDefault();
          goTo(0);
          break;
        case 'End':
          e.preventDefault();
          goTo(total - 1);
          break;
        case 'g':
        case 'G':
          e.preventDefault();
          setShowGrid(g => !g);
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [idx, total, goTo, onClose]);

  const handleNotesSave = () => {
    if (currentSlide && onUpdateNotes) {
      onUpdateNotes(currentSlide.id, notesText);
    }
    setEditingNotes(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-neutral-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-black border-b border-white/10 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-white font-semibold text-sm">Presenter View</h1>
          <span className="text-white/40 text-xs">
            Slide {idx + 1} of {total}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Timer */}
          <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-3 py-1.5 border border-white/10">
            <Timer className="w-3.5 h-3.5 text-white/40" />
            <span className="text-white font-mono text-sm tabular-nums">{fmt(elapsedTime)}</span>
            <span className="text-white/30 text-xs ml-1">slide: {fmt(slideTime)}</span>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-white/40 hover:text-white hover:bg-white/10"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
            >
              {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-white/40 hover:text-white hover:bg-white/10"
              onClick={() => { setElapsedTime(0); setSlideTime(0); }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowGrid(g => !g)}
            className={cn('h-8 w-8 text-white/40 hover:text-white hover:bg-white/10', showGrid && 'bg-white/10 text-white')}
            title="Slide grid (G)"
          >
            <Grid className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white/40 hover:text-white hover:bg-white/10 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      {showGrid ? (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-4 gap-4">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                onClick={() => { setIdx(i); setShowGrid(false); }}
                className={cn(
                  'relative rounded-lg overflow-hidden border-2 transition-all',
                  i === idx ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-white/10 hover:border-white/30'
                )}
              >
                <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                  <div className="absolute inset-0">
                    <div style={{ width: 960, height: 540, transform: 'scale(0.2)', transformOrigin: 'top left' }}>
                      <KonvaSlideCanvas slide={slide} readOnly />
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-2 py-1">
                  <span className="text-white text-xs">{i + 1}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex min-h-0 p-4 gap-4">
          {/* Left: Current slide 60% */}
          <div className="flex-[3] flex flex-col gap-3 min-w-0">
            <div className="flex-1 bg-neutral-900 rounded-xl relative flex items-center justify-center min-h-0 border border-white/10">
              {/* Slide badge */}
              <div className="absolute top-3 left-3 z-10">
                <span className="bg-white text-black text-xs font-medium px-2.5 py-1 rounded-full">
                  {idx + 1} / {total}
                </span>
              </div>

              {/* Slide container */}
              <PresenterSlideDisplay slide={currentSlide} />
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-2 shrink-0">
              <Button
                variant="outline"
                onClick={() => goTo(idx - 1)}
                disabled={idx === 0}
                className="bg-neutral-900 border-white/10 text-white hover:bg-neutral-800 disabled:opacity-40 h-9 px-4 gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button
                onClick={() => goTo(idx + 1)}
                disabled={idx === total - 1}
                className="bg-white hover:bg-neutral-200 text-black disabled:opacity-40 h-9 px-4 gap-1.5"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Right: Notes + Next slide 40% */}
          <div className="flex-[2] flex flex-col gap-3 min-w-0">
            {/* Notes */}
            <div className="flex-1 bg-neutral-900 rounded-xl p-4 flex flex-col min-h-0 border border-white/10">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-white">Speaker Notes</span>
                </div>
                <button
                  onClick={() => editingNotes ? handleNotesSave() : setEditingNotes(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {editingNotes ? 'Save' : 'Edit'}
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {editingNotes ? (
                  <textarea
                    value={notesText}
                    onChange={e => setNotesText(e.target.value)}
                    className="w-full h-full bg-black/30 rounded-lg border border-white/10 text-white text-sm p-3 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                    placeholder="Type your speaker notes here..."
                    autoFocus
                  />
                ) : notesText ? (
                  <p className="text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {notesText}
                  </p>
                ) : (
                  <p className="text-neutral-500 text-sm italic">
                    No notes for this slide. Click Edit to add.
                  </p>
                )}
              </div>
            </div>

            {/* Next slide preview */}
            <div className="bg-neutral-900 rounded-xl p-4 shrink-0 border border-white/10">
              <p className="text-xs font-medium text-white/40 mb-3">Up Next</p>
              <div className="relative w-full overflow-hidden rounded-lg" style={{ paddingTop: '56.25%' }}>
                <div className="absolute inset-0">
                  {nextSlide ? (
                    <PresenterSlideDisplay slide={nextSlide} />
                  ) : (
                    <div className="bg-neutral-800 rounded-lg flex items-center justify-center text-neutral-500 text-xs w-full h-full">
                      End of presentation
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Slide thumbnail strip */}
            <div className="bg-neutral-900 rounded-xl p-3 shrink-0 border border-white/10 max-h-32 overflow-x-auto">
              <div className="flex gap-2">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => goTo(i)}
                    className={cn(
                      'shrink-0 rounded border-2 overflow-hidden transition-all',
                      i === idx ? 'border-blue-500' : 'border-transparent hover:border-white/30'
                    )}
                    style={{ width: 80, height: 45 }}
                  >
                    <div style={{ width: 960, height: 540, transform: 'scale(0.083)', transformOrigin: 'top left' }}>
                      <KonvaSlideCanvas slide={s} readOnly />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PresenterSlideDisplay({ slide }: { slide: SlideData | undefined }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const parent = containerRef.current.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      if (w === 0 || h === 0) return;
      setScale(Math.min(w / 960, h / 540));
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current?.parentElement) ro.observe(containerRef.current.parentElement);
    return () => ro.disconnect();
  }, []);

  if (!slide) return null;

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      style={{
        width: 960 * scale,
        height: 540 * scale,
        flexShrink: 0,
      }}
    >
      <div style={{
        width: 960,
        height: 540,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        position: 'absolute',
        top: 0,
        left: 0,
      }}>
        <KonvaSlideCanvas slide={slide} readOnly />
      </div>
    </div>
  );
}
