import { useEffect } from 'react';
import { SlideView } from '@/components/SlideView';
import { SlideList } from '@/components/SlideList';
import { SlideEditor } from '@/components/SlideEditor';
import { SlideActions } from '@/components/SlideActions';
import { useSlidesStore } from '@/store/useSlidesStore';

export default function Index() {
  const {
    slides, currentIndex, setCurrentIndex,
    goNext, goPrev,
    addSlide, deleteSlide, moveSlideUp, moveSlideDown,
    reorderSlides, updateObjectText, addBodyObject, deleteObject,
  } = useSlidesStore();

  const currentSlide = slides[currentIndex];
  const totalSlides = slides.length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev]);

  return (
    <div className="h-screen flex bg-background">
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
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-3xl bg-card rounded-2xl shadow-lg border border-border flex flex-col overflow-hidden">
            <SlideView slide={currentSlide} />

            <div className="flex items-center justify-between px-8 py-5 border-t border-border bg-muted/30">
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
        </div>
      </div>

      <SlideEditor
        slide={currentSlide}
        onUpdateText={(objectId, text) => updateObjectText(currentSlide.id, objectId, text)}
        onAddBody={() => addBodyObject(currentSlide.id)}
        onDeleteObject={(objectId) => deleteObject(currentSlide.id, objectId)}
      />
    </div>
  );
}
