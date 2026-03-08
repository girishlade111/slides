import { create } from 'zustand';
import { slides as initialSlides } from '@/data/slides';
import type { SlideData } from '@/data/slides';

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
  updateSlide: (id: string, updates: Partial<Pick<SlideData, 'title' | 'content'>>) => void;
  addSlide: () => void;
  deleteSlide: () => void;
  moveSlideUp: () => void;
  moveSlideDown: () => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;

  // Derived helpers
  currentSlide: () => SlideData;
  totalSlides: () => number;
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

  updateSlide: (id, updates) => {
    set((state) => ({
      slides: state.slides.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  },

  addSlide: () => {
    slideCounter++;
    const { currentIndex } = get();
    const newSlide: SlideData = {
      id: Date.now().toString(),
      title: `New Slide ${slideCounter}`,
      content: '',
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

  currentSlide: () => {
    const { slides, currentIndex } = get();
    return slides[currentIndex];
  },

  totalSlides: () => get().slides.length,
}));
