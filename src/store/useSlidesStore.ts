import { create } from 'zustand';
import { slides as initialSlides } from '@/data/slides';
import type { SlideData, SlideObject } from '@/data/slides';

let slideCounter = initialSlides.length;

interface SlidesState {
  slides: SlideData[];
  currentIndex: number;

  // Navigation
  setCurrentIndex: (index: number) => void;
  goNext: () => void;
  goPrev: () => void;

  // Slide CRUD
  setSlides: (slides: SlideData[]) => void;
  updateSlideName: (slideId: string, name: string) => void;
  addSlide: () => void;
  deleteSlide: () => void;
  moveSlideUp: () => void;
  moveSlideDown: () => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;

  // Object operations
  updateObjectText: (slideId: string, objectId: string, text: string) => void;
  addBodyObject: (slideId: string) => void;
  deleteObject: (slideId: string, objectId: string) => void;
}

export const useSlidesStore = create<SlidesState>((set, get) => ({
  slides: initialSlides,
  currentIndex: 0,

  setCurrentIndex: (index) => set({ currentIndex: index }),

  goNext: () => {
    const { currentIndex, slides } = get();
    if (currentIndex < slides.length - 1) set({ currentIndex: currentIndex + 1 });
  },

  goPrev: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) set({ currentIndex: currentIndex - 1 });
  },

  setSlides: (slides) => set({ slides }),

  updateSlideName: (slideId, name) => {
    set((state) => ({
      slides: state.slides.map((s) => (s.id === slideId ? { ...s, name } : s)),
    }));
  },

  addSlide: () => {
    slideCounter++;
    const { currentIndex } = get();
    const newSlide: SlideData = {
      id: Date.now().toString(),
      name: `New Slide ${slideCounter}`,
      objects: [
        { id: crypto.randomUUID(), type: 'title', text: `New Slide ${slideCounter}` },
        { id: crypto.randomUUID(), type: 'body', text: '' },
      ],
    };
    set((state) => {
      const updated = [...state.slides];
      updated.splice(currentIndex + 1, 0, newSlide);
      return { slides: updated, currentIndex: currentIndex + 1 };
    });
  },

  deleteSlide: () => {
    const { slides, currentIndex } = get();
    if (slides.length <= 1) return;
    set({
      slides: slides.filter((_, i) => i !== currentIndex),
      currentIndex: Math.min(currentIndex, slides.length - 2),
    });
  },

  moveSlideUp: () => {
    const { currentIndex } = get();
    if (currentIndex === 0) return;
    get().reorderSlides(currentIndex, currentIndex - 1);
  },

  moveSlideDown: () => {
    const { currentIndex, slides } = get();
    if (currentIndex >= slides.length - 1) return;
    get().reorderSlides(currentIndex, currentIndex + 1);
  },

  reorderSlides: (fromIndex, toIndex) => {
    set((state) => {
      const updated = [...state.slides];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);

      let newIndex = state.currentIndex;
      if (newIndex === fromIndex) newIndex = toIndex;
      else if (fromIndex < newIndex && toIndex >= newIndex) newIndex--;
      else if (fromIndex > newIndex && toIndex <= newIndex) newIndex++;

      return { slides: updated, currentIndex: newIndex };
    });
  },

  // Object operations
  updateObjectText: (slideId, objectId, text) => {
    set((state) => ({
      slides: state.slides.map((s) =>
        s.id === slideId
          ? {
              ...s,
              objects: s.objects.map((o) => (o.id === objectId ? { ...o, text } : o)),
              // Keep name synced with title object
              name: s.objects.find((o) => o.id === objectId)?.type === 'title' ? text : s.name,
            }
          : s
      ),
    }));
  },

  addBodyObject: (slideId) => {
    const newObj: SlideObject = {
      id: crypto.randomUUID(),
      type: 'body',
      text: '',
    };
    set((state) => ({
      slides: state.slides.map((s) =>
        s.id === slideId ? { ...s, objects: [...s.objects, newObj] } : s
      ),
    }));
  },

  deleteObject: (slideId, objectId) => {
    set((state) => ({
      slides: state.slides.map((s) => {
        if (s.id !== slideId) return s;
        // Don't delete if it's the last object
        if (s.objects.length <= 1) return s;
        return { ...s, objects: s.objects.filter((o) => o.id !== objectId) };
      }),
    }));
  },
}));
