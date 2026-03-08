import { useEffect, useState, useRef, useCallback } from 'react';
import { Check, Loader2, Play } from 'lucide-react';
import { SlideList } from '@/components/SlideList';
import { SlideEditor } from '@/components/SlideEditor';
import { SlideActions } from '@/components/SlideActions';
import { FileMenu } from '@/components/FileMenu';
import { KonvaSlideCanvas, type KonvaSlideCanvasHandle } from '@/components/slides/KonvaSlideCanvas';
import { PresentationOverlay } from '@/components/slides/PresentationOverlay';
import { OpenPresentationDialog } from '@/components/dialogs/OpenPresentationDialog';
import { SaveAsDialog } from '@/components/dialogs/SaveAsDialog';
import { NewPresentationDialog } from '@/components/dialogs/NewPresentationDialog';
import { PresentationSettingsDialog } from '@/components/dialogs/PresentationSettingsDialog';
import { useSlidesStore } from '@/store/useSlidesStore';
import { saveToStorage } from '@/lib/storage';

export default function Index() {
  const {
    slides, currentIndex, setCurrentIndex, presentationMeta,
    goNext, goPrev,
    addSlide, deleteSlide, moveSlideUp, moveSlideDown,
    reorderSlides, saveCurrent,
  } = useSlidesStore();

  const currentSlide = slides[currentIndex];
  const totalSlides = slides.length;
  const canvasRef = useRef<KonvaSlideCanvasHandle>(null);

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const [presenting, setPresenting] = useState(false);

  // Dialog states
  const [showNew, setShowNew] = useState(false);
  const [showOpen, setShowOpen] = useState(false);
  const [showSaveAs, setShowSaveAs] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Auto-save
  useEffect(() => {
    setSaveStatus('saving');
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveToStorage({ id: presentationMeta?.id, slides, currentIndex, meta: presentationMeta ?? undefined });
      setSaveStatus('saved');
    }, 1500);
    return () => clearTimeout(timerRef.current);
  }, [slides, currentIndex, presentationMeta]);

  // Keyboard nav + save shortcut
  useEffect(() => {
    if (presenting) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveCurrent();
        return;
      }
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev, presenting, saveCurrent]);

  const handleExportAllPng = useCallback(async () => {
    // Export current slide as PNG for now (multi-slide would need off-screen rendering)
    const stage = canvasRef.current?.getStage();
    if (!stage) return;
    const dataUrl = stage.toDataURL({ mimeType: 'image/png', pixelRatio: 2 });
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `slide-${currentIndex + 1}.png`;
    a.click();
  }, [currentIndex]);

  const handleClose = () => {
    if (!window.confirm('Close presentation? Unsaved changes will be lost.')) return;
    useSlidesStore.getState().closePresentation();
  };

  const displayName = presentationMeta?.name || 'Lade Slides';

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-border bg-muted/30">
        <div className="flex items-center gap-1">
          <FileMenu
            onNew={() => setShowNew(true)}
            onOpen={() => setShowOpen(true)}
            onSave={saveCurrent}
            onSaveAs={() => setShowSaveAs(true)}
            onExportPng={handleExportAllPng}
            onSettings={() => setShowSettings(true)}
            onClose={handleClose}
            presentationName={displayName}
          />
          <span className="text-sm font-medium text-foreground ml-1 truncate max-w-[200px]">{displayName}</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
            {saveStatus === 'saving' ? (
              <><Loader2 className="w-3 h-3 animate-spin" /> Saving</>
            ) : (
              <><Check className="w-3 h-3 text-green-500" /> Saved</>
            )}
          </span>
        </div>
        <button
          onClick={() => setPresenting(true)}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Play className="w-3 h-3" />
          Present
        </button>
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

      {/* Overlays */}
      {presenting && (
        <PresentationOverlay slides={slides} startIndex={currentIndex} onClose={() => setPresenting(false)} />
      )}

      <NewPresentationDialog open={showNew} onOpenChange={setShowNew} />
      <OpenPresentationDialog open={showOpen} onOpenChange={setShowOpen} />
      <SaveAsDialog open={showSaveAs} onOpenChange={setShowSaveAs} />
      <PresentationSettingsDialog open={showSettings} onOpenChange={setShowSettings} />
    </div>
  );
}
