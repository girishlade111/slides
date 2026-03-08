import React, { useState, useEffect } from 'react';
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
import { showcaseSlides } from '@/slides/showcase';

interface SlideData {
  id: string;
  component: React.ComponentType<any>;
  name: string;
  isWIP: boolean;
  description?: string;
}

export default function Index() {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showProperties, setShowProperties] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [isPresenterView, setIsPresenterView] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(220);

  const slides = React.useMemo<SlideData[]>(() =>
    showcaseSlides.map((s) => ({
      id: `slide-${s.name.toLowerCase().replace(/\s+/g, '-')}`,
      component: s.component,
      name: s.name,
      isWIP: false,
      description: undefined,
    })),
    []
  );

  const currentSlideId = slides[activeSlideIndex]?.id ?? null;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (isPresentationMode || isPresenterView) return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        setActiveSlideIndex(prev => Math.min(slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveSlideIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'G' && e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShowGrid(prev => !prev);
      } else if (e.key === 'N' && e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShowNotes(prev => !prev);
      } else if (e.key === 'P' && e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsPresentationMode(true);
      } else if (e.key === 'V' && e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsPresenterView(true);
      } else if (e.key === 'F5') {
        e.preventDefault();
        setIsPresentationMode(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length, isPresentationMode, isPresenterView]);

  const ActiveSlideComponent = slides[activeSlideIndex]?.component || showcaseSlides[0].component;

  return (
    <div className="h-screen flex flex-col bg-[#f0f1f3] overflow-hidden">
      {/* Title bar */}
      <PPTTitleBar fileName="Presentation1" />

      {/* Ribbon */}
      <PPTRibbon
        showGrid={showGrid}
        onToggleGrid={() => {
          const newShowGrid = !showGrid;
          setShowGrid(newShowGrid);
          if (newShowGrid) setShowSidebar(false);
        }}
        showNotes={showNotes}
        onToggleNotes={() => setShowNotes(!showNotes)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onStartPresentation={() => setIsPresentationMode(true)}
        onStartPresenterView={() => setIsPresenterView(true)}
      />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <PPTSidebar
            slides={slides.map((slide) => ({
              id: slide.id,
              content: <slide.component />,
            }))}
            activeSlideIndex={activeSlideIndex}
            onSlideClick={setActiveSlideIndex}
            width={sidebarWidth}
            onWidthChange={setSidebarWidth}
            onResizeStart={() => {}}
            onResizeEnd={() => {}}
            onSnapClose={() => setShowSidebar(false)}
          />
        )}

        {/* Canvas area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 relative overflow-hidden">
            <SlideCanvas
              showGrid={false}
              zoom={zoom}
              onZoomChange={setZoom}
              currentSlide={activeSlideIndex + 1}
              totalSlides={slides.length}
              onPrevSlide={() => setActiveSlideIndex(Math.max(0, activeSlideIndex - 1))}
              onNextSlide={() => setActiveSlideIndex(Math.min(slides.length - 1, activeSlideIndex + 1))}
            >
              <ActiveSlideComponent />
            </SlideCanvas>

            {/* Grid View Overlay */}
            {showGrid && (
              <SlideOverviewGrid
                slides={slides}
                activeSlideIndex={activeSlideIndex}
                onSlideClick={setActiveSlideIndex}
                onClose={() => setShowGrid(false)}
              />
            )}
          </div>

          {/* Presenter Notes Panel */}
          {showNotes && (
            <PresenterNotesPanel
              slideId={currentSlideId}
              slideIndex={activeSlideIndex}
              onClose={() => setShowNotes(false)}
            />
          )}
        </div>

        {/* Properties Panel */}
        {showProperties && (
          <PropertiesPanel onClose={() => setShowProperties(false)} />
        )}
      </div>

      {/* Status bar */}
      <PPTStatusBar
        currentSlide={activeSlideIndex + 1}
        totalSlides={slides.length}
        zoom={zoom}
        onZoomChange={setZoom}
        showNotes={showNotes}
        onToggleNotes={() => setShowNotes(!showNotes)}
        onStartPresentation={() => setIsPresentationMode(true)}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
      />

      {/* Presentation Mode */}
      {isPresentationMode && (
        <PresentationMode
          slides={slides.map(slide => ({
            id: slide.id,
            component: slide.component,
            isWIP: slide.isWIP,
            description: slide.description,
          }))}
          activeIndex={activeSlideIndex}
          onIndexChange={setActiveSlideIndex}
          onExit={() => setIsPresentationMode(false)}
        />
      )}

      {/* Presenter View */}
      {isPresenterView && (
        <PresenterView
          slides={slides.map(slide => ({
            id: slide.id,
            component: slide.component,
            isWIP: slide.isWIP,
            description: slide.description,
          }))}
          activeIndex={activeSlideIndex}
          onIndexChange={setActiveSlideIndex}
          onExit={() => setIsPresenterView(false)}
        />
      )}
    </div>
  );
}