import { create } from 'zustand';
import { slides as initialSlides, createObject } from '@/data/slides';
import type { SlideData, SlideObject } from '@/data/slides';
import { loadFromStorage } from '@/lib/storage';

const stored = loadFromStorage();
let slideCounter = (stored?.slides ?? initialSlides).length;

interface SlidesState {
  slides: SlideData[];
  currentIndex: number;
  selectedObjectId: string | null;

  setCurrentIndex: (index: number) => void;
  goNext: () => void;
  goPrev: () => void;
  setSelectedObjectId: (id: string | null) => void;

  setSlides: (slides: SlideData[]) => void;
  updateSlideName: (slideId: string, name: string) => void;
  addSlide: () => void;
  deleteSlide: () => void;
  moveSlideUp: () => void;
  moveSlideDown: () => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;

  updateObjectText: (slideId: string, objectId: string, text: string) => void;
  updateObjectStyle: (slideId: string, objectId: string, style: Partial<SlideObject>) => void;
  setObjectPosition: (slideId: string, objectId: string, x: number, y: number) => void;
  addBodyObject: (slideId: string) => void;
  addShape: (shapeType: 'rectangle' | 'circle') => void;
  deleteObject: (slideId: string, objectId: string) => void;
}

export const useSlidesStore = create<SlidesState>((set, get) => ({
  slides: stored?.slides ?? initialSlides,
  currentIndex: stored?.currentIndex ?? 0,
  selectedObjectId: null,

  setCurrentIndex: (index) => set({ currentIndex: index, selectedObjectId: null }),

  goNext: () => {
    const { currentIndex, slides } = get();
    if (currentIndex < slides.length - 1) set({ currentIndex: currentIndex + 1, selectedObjectId: null });
  },

  goPrev: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) set({ currentIndex: currentIndex - 1, selectedObjectId: null });
  },

  setSelectedObjectId: (id) => set({ selectedObjectId: id }),
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
        createObject('title', `New Slide ${slideCounter}`),
        createObject('body', ''),
      ],
    };
    set((state) => {
      const updated = [...state.slides];
      updated.splice(currentIndex + 1, 0, newSlide);
      return { slides: updated, currentIndex: currentIndex + 1, selectedObjectId: null };
    });
  },

  deleteSlide: () => {
    const { slides, currentIndex } = get();
    if (slides.length <= 1) return;
    set({
      slides: slides.filter((_, i) => i !== currentIndex),
      currentIndex: Math.min(currentIndex, slides.length - 2),
      selectedObjectId: null,
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

  updateObjectText: (slideId, objectId, text) => {
    set((state) => ({
      slides: state.slides.map((s) =>
        s.id === slideId
          ? {
              ...s,
              objects: s.objects.map((o) => (o.id === objectId ? { ...o, text } : o)),
              name: s.objects.find((o) => o.id === objectId)?.type === 'title' ? text : s.name,
            }
          : s
      ),
    }));
  },

  updateObjectStyle: (slideId, objectId, style) => {
    set((state) => ({
      slides: state.slides.map((s) =>
        s.id === slideId
          ? { ...s, objects: s.objects.map((o) => (o.id === objectId ? { ...o, ...style } : o)) }
          : s
      ),
    }));
  },

  setObjectPosition: (slideId, objectId, x, y) => {
    set((state) => ({
      slides: state.slides.map((s) =>
        s.id === slideId
          ? { ...s, objects: s.objects.map((o) => (o.id === objectId ? { ...o, x, y } : o)) }
          : s
      ),
    }));
  },

  addBodyObject: (slideId) => {
    const slide = get().slides.find((s) => s.id === slideId);
    const yOffset = slide ? Math.max(...slide.objects.map((o) => o.y + o.height), 0) + 20 : 200;
    const newObj = createObject('body', '', { y: yOffset });
    set((state) => ({
      slides: state.slides.map((s) =>
        s.id === slideId ? { ...s, objects: [...s.objects, newObj] } : s
      ),
      selectedObjectId: newObj.id,
    }));
  },

  addShape: (shapeType) => {
    const { slides, currentIndex } = get();
    const slide = slides[currentIndex];
    if (!slide) return;
    const newObj = createObject('shape', '', { shapeType, x: 300 + Math.random() * 100, y: 180 + Math.random() * 80 });
    set((state) => ({
      slides: state.slides.map((s) =>
        s.id === slide.id ? { ...s, objects: [...s.objects, newObj] } : s
      ),
      selectedObjectId: newObj.id,
    }));
  },

  deleteObject: (slideId, objectId) => {
    set((state) => ({
      slides: state.slides.map((s) => {
        if (s.id !== slideId) return s;
        if (s.objects.length <= 1) return s;
        return { ...s, objects: s.objects.filter((o) => o.id !== objectId) };
      }),
      selectedObjectId: state.selectedObjectId === objectId ? null : state.selectedObjectId,
    }));
  },
}));
