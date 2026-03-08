import { useEffect, useState, useRef, useCallback } from 'react';
import { RotateCcw, Check, Loader2, Play, Download } from 'lucide-react';
import { SlideList } from '@/components/SlideList';
import { SlideEditor } from '@/components/SlideEditor';
import { SlideActions } from '@/components/SlideActions';
import { KonvaSlideCanvas, type KonvaSlideCanvasHandle } from '@/components/slides/KonvaSlideCanvas';
import { PresentationOverlay } from '@/components/slides/PresentationOverlay';
import { useSlidesStore } from '@/store/useSlidesStore';
import { saveToStorage, clearStorage } from '@/lib/storage';
import { slides as defaultSlides } from '@/data/slides';

export default function Index() {
  const {
    slides, currentIndex, setCurrentIndex,
    goNext, goPrev,
    addSlide, deleteSlide, moveSlideUp, moveSlideDown,
    reorderSlides, setSlides,
  } = useSlidesStore();

  const currentSlide = slides[currentIndex];
  const totalSlides = slides.length;
  const canvasRef = useRef<KonvaSlideCanvasHandle>(null);

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const [presenting, setPresenting] = useState(false);

  // Auto-save
  useEffect(() => {
    setSaveStatus('saving');
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveToStorage({ slides, currentIndex });
      setSaveStatus('saved');
    }, 1500);
    return () => clearTimeout(timerRef.current);
  }, [slides, currentIndex]);

  // Keyboard nav
  useEffect(() => {
    if (presenting) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev, presenting]);

  const handleReset = () => {
    if (!window.confirm('Reset to example slides? Your current work will be lost.')) return;
    clearStorage();
    setSlides(defaultSlides);
    setCurrentIndex(0);
  };

  const handleExportPng = useCallback(() => {
    const stage = canvasRef.current?.getStage();
    if (!stage) return;
    const dataUrl = stage.toDataURL({ mimeType: 'image/png', pixelRatio: 2 });
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `slide-${currentIndex + 1}.png`;
    a.click();
  }, [currentIndex]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <span className="text-sm font-semibold text-foreground">Lade Slides</span>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {saveStatus === 'saving' ? (
              <><Loader2 className="w-3 h-3 animate-spin" /> Saving...</>
            ) : (
              <><Check className="w-3 h-3 text-green-500" /> Saved</>
            )}
          </span>
          <button
            onClick={handleExportPng}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-border text-muted-foreground hover:bg-muted transition-colors"
          >
            <Download className="w-3 h-3" />
            Export PNG
          </button>
          <button
            onClick={() => setPresenting(true)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Play className="w-3 h-3" />
            Present
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-border text-muted-foreground hover:bg-muted transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 flex min-h-0">
        <div className="w-60 flex flex-col border-r border-border">
          <SlideActions
            onAdd={addSlide}
            onDelete={deleteSlide}
            onMoveUp={moveSlideUp}
            onMoveDown={moveSlideDown}
            canDelete={totalSlides > 1}
            canMoveUp={currentIndex > 0}
            canMoveDown={currentIndex < totalSlides - 1}
          />
          <SlideList
            slides={slides}
            currentIndex={currentIndex}
            onSelect={setCurrentIndex}
            onReorder={reorderSlides}
          />
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center p-6 bg-muted/20">
            <KonvaSlideCanvas ref={canvasRef} slide={currentSlide} />
          </div>

          <div className="flex items-center justify-between px-8 py-3 border-t border-border bg-muted/30">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="px-5 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground font-medium">
              Slide {currentIndex + 1} of {totalSlides}
            </span>
            <button
              onClick={goNext}
              disabled={currentIndex === totalSlides - 1}
              className="px-5 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              Next
            </button>
          </div>
        </div>

        <SlideEditor />
      </div>

      {/* Presentation overlay */}
      {presenting && (
        <PresentationOverlay
          slides={slides}
          startIndex={currentIndex}
          onClose={() => setPresenting(false)}
        />
      )}
    </div>
  );
}
