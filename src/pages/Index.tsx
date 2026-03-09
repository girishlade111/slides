import { useEffect, useState, useRef, useCallback } from 'react';
import { Check, Loader2, Palette, Play, Plus, Sparkles, ArrowRightLeft } from 'lucide-react';
import { SlideEditor } from '@/components/SlideEditor';
import { FileMenu } from '@/components/FileMenu';
import { SlideSidebar } from '@/components/SlideSidebar';
import { ShapesMenu } from '@/components/ShapesMenu';
import { ImageMenu } from '@/components/ImageMenu';
import { TextFormattingToolbar } from '@/components/TextFormattingToolbar';
import { SlideBackgroundEditor } from '@/components/SlideBackgroundEditor';
import { AlignmentToolbar } from '@/components/AlignmentToolbar';
import { ThemesPanel } from '@/components/ThemesPanel';
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
    slides, currentIndex, presentationMeta, selectedObjectId, selectedObjectIds,
    goNext, goPrev, saveCurrent, addTextBox, updateObjectStyle,
  } = useSlidesStore();

  const currentSlide = slides[currentIndex];
  const totalSlides = slides.length;
  const canvasRef = useRef<KonvaSlideCanvasHandle>(null);

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const [presenting, setPresenting] = useState(false);

  const [showNew, setShowNew] = useState(false);
  const [showOpen, setShowOpen] = useState(false);
  const [showSaveAs, setShowSaveAs] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBgEditor, setShowBgEditor] = useState(false);
  const [showThemes, setShowThemes] = useState(false);

  const selectedObj = selectedObjectId && currentSlide
    ? currentSlide.objects.find((o) => o.id === selectedObjectId)
    : null;
  const isTextSelected = selectedObj && selectedObj.type !== 'shape' && selectedObj.type !== 'image';

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

  // Keyboard shortcuts
  useEffect(() => {
    if (presenting) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;

      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key === 's') { e.preventDefault(); saveCurrent(); return; }

      // Text formatting shortcuts
      if (mod && isTextSelected && currentSlide) {
        const obj = selectedObj!;
        const slideId = currentSlide.id;
        if (e.key === 'b') { e.preventDefault(); updateObjectStyle(slideId, obj.id, { fontWeight: obj.fontWeight === 'bold' ? 'normal' : 'bold' }); return; }
        if (e.key === 'i') { e.preventDefault(); updateObjectStyle(slideId, obj.id, { fontStyle: obj.fontStyle === 'italic' ? 'normal' : 'italic' }); return; }
        if (e.key === 'u') { e.preventDefault(); updateObjectStyle(slideId, obj.id, { textDecoration: obj.textDecoration === 'underline' ? 'none' : 'underline' }); return; }
        if (e.key === 'e') { e.preventDefault(); updateObjectStyle(slideId, obj.id, { align: 'center' }); return; }
        if (e.key === 'l') { e.preventDefault(); updateObjectStyle(slideId, obj.id, { align: 'left' }); return; }
        if (e.key === 'r') { e.preventDefault(); updateObjectStyle(slideId, obj.id, { align: 'right' }); return; }
      }

      // Alignment shortcuts (Ctrl+Shift+key)
      if (mod && e.shiftKey && currentSlide) {
        const ids = selectedObjectIds.length > 0 ? selectedObjectIds : selectedObjectId ? [selectedObjectId] : [];
        const store = useSlidesStore.getState();
        const sId = currentSlide.id;
        if (e.key === 'L' || e.key === 'l') { e.preventDefault(); store.alignObjects(sId, ids, 'left'); return; }
        if (e.key === 'E' || e.key === 'e') { e.preventDefault(); store.alignObjects(sId, ids, 'center-h'); return; }
        if (e.key === 'R' || e.key === 'r') { e.preventDefault(); store.alignObjects(sId, ids, 'right'); return; }
        if (e.key === 'T' || e.key === 't') { e.preventDefault(); store.alignObjects(sId, ids, 'top'); return; }
        if (e.key === 'M' || e.key === 'm') { e.preventDefault(); store.alignObjects(sId, ids, 'center-v'); return; }
        if (e.key === 'B' || e.key === 'b') { e.preventDefault(); store.alignObjects(sId, ids, 'bottom'); return; }
        if (e.key === ']') { e.preventDefault(); ids.forEach(id => store.reorderObject(sId, id, 'forward')); return; }
        if (e.key === '[') { e.preventDefault(); ids.forEach(id => store.reorderObject(sId, id, 'backward')); return; }
      }

      // Delete selected object
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedObjectId && currentSlide) {
        e.preventDefault();
        useSlidesStore.getState().deleteObject(currentSlide.id, selectedObjectId);
        return;
      }

      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev, presenting, saveCurrent, isTextSelected, selectedObj, currentSlide, selectedObjectId, selectedObjectIds, updateObjectStyle]);

  const handleExportPng = useCallback(() => {
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
            onExportPng={handleExportPng}
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => currentSlide && addTextBox(currentSlide.id)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md border border-border text-foreground hover:bg-muted transition-colors"
            title="Insert Text Box"
          >
            <Plus className="w-3 h-3" />
            Text Box
          </button>
          <ShapesMenu />
          <ImageMenu />
          <button
            onClick={() => setShowBgEditor(true)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md border border-border text-foreground hover:bg-muted transition-colors"
            title="Slide Background"
          >
            Background
          </button>
          <button
            onClick={() => setShowThemes(true)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md border border-border text-foreground hover:bg-muted transition-colors"
            title="Themes"
          >
            <Palette className="w-3 h-3" />
            Themes
          </button>
          <button
            onClick={() => setPresenting(true)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Play className="w-3 h-3" />
            Present
          </button>
        </div>
      </div>

      {/* Formatting toolbar */}
      {isTextSelected && currentSlide && (
        <div className="px-2 py-1 border-b border-border bg-muted/20">
          <TextFormattingToolbar obj={selectedObj!} slideId={currentSlide.id} />
        </div>
      )}

      {/* Alignment toolbar */}
      <AlignmentToolbar />

      {/* Main layout */}
      <div className="flex-1 flex min-h-0">
        <SlideSidebar />

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

      {presenting && (
        <PresentationOverlay slides={slides} startIndex={currentIndex} onClose={() => setPresenting(false)} />
      )}

      <NewPresentationDialog open={showNew} onOpenChange={setShowNew} />
      <OpenPresentationDialog open={showOpen} onOpenChange={setShowOpen} />
      <SaveAsDialog open={showSaveAs} onOpenChange={setShowSaveAs} />
      <PresentationSettingsDialog open={showSettings} onOpenChange={setShowSettings} />
      <SlideBackgroundEditor open={showBgEditor} onClose={() => setShowBgEditor(false)} />
      <ThemesPanel open={showThemes} onClose={() => setShowThemes(false)} />
    </div>
  );
}
