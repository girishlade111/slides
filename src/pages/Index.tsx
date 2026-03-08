import { useState, useEffect, useCallback } from 'react';
import { slides as initialSlides } from '@/data/slides';
import type { SlideData } from '@/data/slides';
import { SlideView } from '@/components/SlideView';
import { SlideList } from '@/components/SlideList';
import { SlideEditor } from '@/components/SlideEditor';

export default function Index() {
  const [slides, setSlides] = useState<SlideData[]>(initialSlides);
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalSlides = slides.length;
  const currentSlide = slides[currentIndex];

  const handlePrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(totalSlides - 1, i + 1));
  }, [totalSlides]);

  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    setSlides((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
    setCurrentIndex((prev) => {
      if (prev === fromIndex) return toIndex;
      if (fromIndex < prev && toIndex >= prev) return prev - 1;
      if (fromIndex > prev && toIndex <= prev) return prev + 1;
      return prev;
    });
  }, []);

  const handleUpdateSlide = useCallback((updates: Partial<Pick<SlideData, 'title' | 'content'>>) => {
    setSlides((prev) => prev.map((s, i) => i === currentIndex ? { ...s, ...updates } : s));
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't navigate if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  return (
    <div className="h-screen flex bg-background">
      {/* Left Sidebar */}
      <SlideList
        slides={slides}
        currentIndex={currentIndex}
        onSelect={setCurrentIndex}
        onReorder={handleReorder}
      />

      {/* Center: Slide Preview */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-3xl bg-card rounded-2xl shadow-lg border border-border flex flex-col overflow-hidden">
            <SlideView slide={currentSlide} onUpdate={handleUpdateSlide} />

            <div className="flex items-center justify-between px-8 py-5 border-t border-border bg-muted/30">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-5 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              >
                Previous
              </button>

              <span className="text-sm text-muted-foreground font-medium">
                Slide {currentIndex + 1} of {totalSlides}
              </span>

              <button
                onClick={handleNext}
                disabled={currentIndex === totalSlides - 1}
                className="px-5 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Edit Panel */}
      <SlideEditor slide={currentSlide} onChange={handleUpdateSlide} />
    </div>
  );
}
