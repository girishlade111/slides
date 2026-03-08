import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PPTTitleBar } from '@/components/layout/PPTTitleBar';
import { PPTRibbon } from '@/components/layout/PPTRibbon';
import { PPTSidebar } from '@/components/layout/PPTSidebar';
import { PPTStatusBar } from '@/components/layout/PPTStatusBar';
import { PropertiesPanel } from '@/components/layout/PropertiesPanel';
import { SlideCanvas } from '@/components/slides/SlideCanvas';
import { SlideOverviewGrid } from '@/components/slides/SlideOverviewGrid';
import { PresentationMode } from '@/components/slides/PresentationMode';
import { PresenterView } from '@/components/slides/PresenterView';
import { PresenterNotesPanel } from '@/components/slides/PresenterNotesPanel';
import { DynamicSlideRenderer } from '@/components/slides/DynamicSlideRenderer';
import { KonvaSlideCanvas } from '@/components/slides/KonvaSlideCanvas';
import { usePresentationStore } from '@/store/presentationStore';
import { showcaseSlides } from '@/slides/showcase';
import { toast } from '@/hooks/use-toast';

export default function Index() {
  const store = usePresentationStore();
  const {
    presentation,
    currentSlideIndex,
    addSlide,
    deleteSlide,
    duplicateSlide,
    reorderSlides,
    setCurrentSlideIndex,
    undo,
    redo,
    saveToLocalStorage,
    loadFromLocalStorage,
  } = store;

  const [showGrid, setShowGrid] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showProperties, setShowProperties] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [isPresenterView, setIsPresenterView] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(220);
  const [useShowcaseSlides, setUseShowcaseSlides] = useState(true);

  // Track canvas container size for Konva
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 450 });

  useEffect(() => {
    const loaded = loadFromLocalStorage();
    if (loaded) setUseShowcaseSlides(false);
  }, []);

  const showcaseSlidesData = React.useMemo(() =>
    showcaseSlides.map((s) => ({
      id: `showcase-${s.name.toLowerCase().replace(/\s+/g, '-')}`,
      component: s.component,
      name: s.name,
      isWIP: false,
      description: undefined,
    })),
    []
  );

  const slides = presentation.slides;
  const currentSlide = slides[currentSlideIndex];
  const currentSlideId = currentSlide?.id ?? null;
  const totalSlides = useShowcaseSlides ? showcaseSlidesData.length : slides.length;
  const isEditable = !useShowcaseSlides;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (isPresentationMode || isPresenterView) return;

      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return; }
      if ((ctrl && e.key === 'y') || (ctrl && e.shiftKey && e.key === 'z')) { e.preventDefault(); redo(); return; }
      if (ctrl && e.key === 's') {
        e.preventDefault();
        saveToLocalStorage();
        toast({ title: 'Saved', description: 'Presentation saved.' });
        return;
      }
      if (ctrl && e.key === 'c') { e.preventDefault(); store.copyObjects(); return; }
      if (ctrl && e.key === 'v') { e.preventDefault(); store.pasteObjects(); return; }
      if (ctrl && e.key === 'x') { e.preventDefault(); store.cutObjects(); return; }
      if (ctrl && e.key === 'd') {
        e.preventDefault();
        if (isEditable && currentSlide) { duplicateSlide(currentSlide.id); toast({ title: 'Slide duplicated' }); }
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        if (store.selectedObjectIds.length > 0) return; // Let object move handle it
        e.preventDefault();
        if (useShowcaseSlides) setCurrentSlideIndex(Math.min(showcaseSlidesData.length - 1, currentSlideIndex + 1));
        else store.navigateSlide('next');
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        if (store.selectedObjectIds.length > 0) return;
        e.preventDefault();
        if (useShowcaseSlides) setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
        else store.navigateSlide('prev');
      } else if (e.key === 'G' && e.shiftKey && !ctrl) {
        e.preventDefault(); setShowGrid((prev) => !prev);
      } else if (e.key === 'N' && e.shiftKey && !ctrl) {
        e.preventDefault(); setShowNotes((prev) => !prev);
      } else if (e.key === 'F5') {
        e.preventDefault(); setIsPresentationMode(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, slides.length, isPresentationMode, isPresenterView, useShowcaseSlides, currentSlide, isEditable]);

  const handleAddSlide = useCallback(() => {
    if (useShowcaseSlides) {
      setUseShowcaseSlides(false);
      toast({ title: 'New presentation', description: 'Started a new editable presentation.' });
    } else {
      addSlide();
      toast({ title: 'Slide added' });
    }
  }, [useShowcaseSlides, addSlide]);

  const handleDeleteSlide = useCallback((slideId: string) => {
    if (useShowcaseSlides) return;
    if (slides.length <= 1) {
      toast({ title: "Can't delete", description: 'Need at least one slide.', variant: 'destructive' });
      return;
    }
    deleteSlide(slideId);
    toast({ title: 'Slide deleted' });
  }, [useShowcaseSlides, slides.length, deleteSlide]);

  const handleDuplicateSlide = useCallback((slideId: string) => {
    if (useShowcaseSlides) return;
    duplicateSlide(slideId);
    toast({ title: 'Slide duplicated' });
  }, [useShowcaseSlides, duplicateSlide]);

  // Sidebar slide data
  const sidebarSlides = useShowcaseSlides
    ? showcaseSlidesData.map((s) => ({ id: s.id, content: <s.component /> }))
    : slides.map((slide) => ({ id: slide.id, content: <DynamicSlideRenderer slide={slide} /> }));

  // Mode slides
  const modeSlides = useShowcaseSlides
    ? showcaseSlidesData.map((s) => ({ id: s.id, component: s.component, isWIP: false, description: undefined }))
    : slides.map((slide) => ({
        id: slide.id,
        component: () => <DynamicSlideRenderer slide={slide} />,
        isWIP: false,
        description: slide.notes || undefined,
      }));

  // Current slide content for showcase mode only
  const ShowcaseContent = useShowcaseSlides
    ? (() => {
        const Comp = showcaseSlidesData[currentSlideIndex]?.component || showcaseSlidesData[0].component;
        return <Comp />;
      })()
    : null;

  // Resize observer for Konva canvas
  useEffect(() => {
    if (useShowcaseSlides || !canvasContainerRef.current) return;
    const el = canvasContainerRef.current;
    const observer = new ResizeObserver(() => {
      setCanvasSize({ width: el.clientWidth, height: el.clientHeight });
    });
    observer.observe(el);
    setCanvasSize({ width: el.clientWidth, height: el.clientHeight });
    return () => observer.disconnect();
  }, [useShowcaseSlides]);

  return (
    <div className="h-screen flex flex-col bg-[#f0f1f3] overflow-hidden">
      <PPTTitleBar fileName={presentation.name} />

      <PPTRibbon
        showGrid={showGrid}
        onToggleGrid={() => { setShowGrid(!showGrid); if (!showGrid) setShowSidebar(false); }}
        showNotes={showNotes}
        onToggleNotes={() => setShowNotes(!showNotes)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onStartPresentation={() => setIsPresentationMode(true)}
        onStartPresenterView={() => setIsPresenterView(true)}
        onAddSlide={handleAddSlide}
        isEditable={isEditable}
      />

      <div className="flex-1 flex overflow-hidden">
        {showSidebar && (
          <PPTSidebar
            slides={sidebarSlides}
            activeSlideIndex={currentSlideIndex}
            onSlideClick={setCurrentSlideIndex}
            onAddSlide={handleAddSlide}
            onDeleteSlide={handleDeleteSlide}
            onDuplicateSlide={handleDuplicateSlide}
            onReorderSlides={useShowcaseSlides ? undefined : reorderSlides}
            canDeleteSlide={isEditable && slides.length > 1}
            width={sidebarWidth}
            onWidthChange={setSidebarWidth}
            onResizeStart={() => {}}
            onResizeEnd={() => {}}
            onSnapClose={() => setShowSidebar(false)}
          />
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 relative overflow-hidden">
            {useShowcaseSlides ? (
              <SlideCanvas
                showGrid={false}
                zoom={zoom}
                onZoomChange={setZoom}
                currentSlide={currentSlideIndex + 1}
                totalSlides={totalSlides}
                onPrevSlide={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                onNextSlide={() => setCurrentSlideIndex(Math.min(totalSlides - 1, currentSlideIndex + 1))}
              >
                {ShowcaseContent}
              </SlideCanvas>
            ) : (
              <div ref={canvasContainerRef} className="flex-1 h-full bg-[#e8e8e8] relative">
                {currentSlide && (
                  <KonvaSlideCanvas
                    slide={currentSlide}
                    width={canvasSize.width}
                    height={canvasSize.height}
                  />
                )}
              </div>
            )}

            {showGrid && (
              <SlideOverviewGrid
                slides={useShowcaseSlides
                  ? showcaseSlidesData
                  : slides.map((s) => ({ id: s.id, component: () => <DynamicSlideRenderer slide={s} />, name: s.name, isWIP: false }))
                }
                activeSlideIndex={currentSlideIndex}
                onSlideClick={setCurrentSlideIndex}
                onClose={() => setShowGrid(false)}
              />
            )}
          </div>

          {showNotes && (
            <PresenterNotesPanel
              slideId={useShowcaseSlides ? showcaseSlidesData[currentSlideIndex]?.id : currentSlideId}
              slideIndex={currentSlideIndex}
              onClose={() => setShowNotes(false)}
            />
          )}
        </div>

        {showProperties && <PropertiesPanel onClose={() => setShowProperties(false)} />}
      </div>

      <PPTStatusBar
        currentSlide={currentSlideIndex + 1}
        totalSlides={totalSlides}
        zoom={zoom}
        onZoomChange={setZoom}
        showNotes={showNotes}
        onToggleNotes={() => setShowNotes(!showNotes)}
        onStartPresentation={() => setIsPresentationMode(true)}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
      />

      {isPresentationMode && (
        <PresentationMode
          slides={modeSlides}
          activeIndex={currentSlideIndex}
          onIndexChange={setCurrentSlideIndex}
          onExit={() => setIsPresentationMode(false)}
        />
      )}
      {isPresenterView && (
        <PresenterView
          slides={modeSlides}
          activeIndex={currentSlideIndex}
          onIndexChange={setCurrentSlideIndex}
          onExit={() => setIsPresenterView(false)}
        />
      )}
    </div>
  );
}