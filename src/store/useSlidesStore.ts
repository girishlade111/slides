import { create } from 'zustand';
import { slides as initialSlides, createObject } from '@/data/slides';
import type { SlideData, SlideObject, SlideBackground } from '@/data/slides';
import {
  loadFromStorage, saveToStorage, clearStorage,
  loadPresentation, savePresentation, deletePresentation as deletePresentationFromStorage,
  listPresentations as listPresentationsFromStorage,
  createPresentationMeta,
  type PresentationMeta,
} from '@/lib/storage';

const stored = loadFromStorage();
let slideCounter = (stored?.slides ?? initialSlides).length;

function deepCloneSlide(slide: SlideData): SlideData {
  return {
    ...slide,
    id: crypto.randomUUID(),
    objects: slide.objects.map((o) => ({ ...o, id: crypto.randomUUID() })),
  };
}

type AlignType = 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom';
type DistributeType = 'horizontal' | 'vertical' | 'left-edges' | 'right-edges' | 'top-edges' | 'bottom-edges';
type MatchSizeType = 'width' | 'height' | 'both';
type ReorderDirection = 'front' | 'back' | 'forward' | 'backward';

interface SlidesState {
  presentationId: string | null;
  presentationMeta: PresentationMeta | null;
  slides: SlideData[];
  currentIndex: number;
  selectedObjectId: string | null;
  selectedObjectIds: string[];
  clipboardSlide: SlideData | null;

  setCurrentIndex: (index: number) => void;
  goNext: () => void;
  goPrev: () => void;
  setSelectedObjectId: (id: string | null) => void;
  toggleObjectSelection: (id: string) => void;
  selectMultipleObjects: (ids: string[]) => void;
  clearSelection: () => void;

  setSlides: (slides: SlideData[]) => void;
  updateSlideName: (slideId: string, name: string) => void;
  addSlide: () => void;
  addSlideAfter: (index: number) => void;
  duplicateSlide: (id: string) => void;
  deleteSlide: () => void;
  deleteSlideById: (id: string) => void;
  moveSlideUp: () => void;
  moveSlideDown: () => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;
  copySlide: (id: string) => void;
  pasteSlide: (targetIndex: number) => void;

  updateObjectText: (slideId: string, objectId: string, text: string) => void;
  updateObjectStyle: (slideId: string, objectId: string, style: Partial<SlideObject>) => void;
  setObjectPosition: (slideId: string, objectId: string, x: number, y: number) => void;
  addBodyObject: (slideId: string) => void;
  addTextBox: (slideId: string) => void;
  addShape: (shapeType: import('@/data/slides').ShapeType) => void;
  addImage: (slideId: string, src: string, width: number, height: number) => void;
  deleteObject: (slideId: string, objectId: string) => void;
  updateSlideBackground: (slideId: string, bg: SlideBackground) => void;
  applyBackgroundToAll: (bg: SlideBackground) => void;
  resetSlideBackground: (slideId: string) => void;

  // Alignment & arrangement
  alignObjects: (slideId: string, objectIds: string[], alignType: AlignType) => void;
  distributeObjects: (slideId: string, objectIds: string[], distributeType: DistributeType) => void;
  matchObjectSize: (slideId: string, objectIds: string[], dimension: MatchSizeType) => void;
  reorderObject: (slideId: string, objectId: string, direction: ReorderDirection) => void;

  newPresentation: (name: string) => void;
  openPresentation: (id: string) => void;
  saveCurrent: () => void;
  saveAs: (newName: string) => void;
  deleteSavedPresentation: (id: string) => void;
  listSavedPresentations: () => PresentationMeta[];
  updatePresentationMeta: (updates: Partial<PresentationMeta>) => void;
  closePresentation: () => void;
}

export const useSlidesStore = create<SlidesState>((set, get) => ({
  presentationId: stored?.meta?.id ?? stored?.id ?? null,
  presentationMeta: stored?.meta ?? null,
  slides: stored?.slides ?? initialSlides,
  currentIndex: stored?.currentIndex ?? 0,
  selectedObjectId: null,
  selectedObjectIds: [],
  clipboardSlide: null,

  setCurrentIndex: (index) => set({ currentIndex: index, selectedObjectId: null, selectedObjectIds: [] }),

  goNext: () => {
    const { currentIndex, slides } = get();
    if (currentIndex < slides.length - 1) set({ currentIndex: currentIndex + 1, selectedObjectId: null, selectedObjectIds: [] });
  },

  goPrev: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) set({ currentIndex: currentIndex - 1, selectedObjectId: null, selectedObjectIds: [] });
  },

  setSelectedObjectId: (id) => set({ selectedObjectId: id, selectedObjectIds: id ? [id] : [] }),
  
  toggleObjectSelection: (id) => {
    const { selectedObjectIds } = get();
    const newIds = selectedObjectIds.includes(id)
      ? selectedObjectIds.filter(i => i !== id)
      : [...selectedObjectIds, id];
    set({ selectedObjectIds: newIds, selectedObjectId: newIds.length === 1 ? newIds[0] : newIds.length > 0 ? newIds[0] : null });
  },

  selectMultipleObjects: (ids) => set({ selectedObjectIds: ids, selectedObjectId: ids.length > 0 ? ids[0] : null }),
  clearSelection: () => set({ selectedObjectId: null, selectedObjectIds: [] }),

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
      id: crypto.randomUUID(),
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

  addSlideAfter: (index) => {
    slideCounter++;
    const { slides } = get();
    const source = slides[index];
    // Copy layout structure from source but clear text content
    const newSlide: SlideData = {
      id: crypto.randomUUID(),
      name: `New Slide ${slideCounter}`,
      objects: source
        ? source.objects.map((o) => ({
            ...o,
            id: crypto.randomUUID(),
            text: o.type === 'title' ? `New Slide ${slideCounter}` : '',
          }))
        : [createObject('title', `New Slide ${slideCounter}`), createObject('body', '')],
    };
    set((state) => {
      const updated = [...state.slides];
      updated.splice(index + 1, 0, newSlide);
      return { slides: updated, currentIndex: index + 1, selectedObjectId: null };
    });
  },

  duplicateSlide: (id) => {
    set((state) => {
      const idx = state.slides.findIndex((s) => s.id === id);
      if (idx === -1) return state;
      const clone = deepCloneSlide(state.slides[idx]);
      clone.name = `${clone.name} (Copy)`;
      const updated = [...state.slides];
      updated.splice(idx + 1, 0, clone);
      return { slides: updated, currentIndex: idx + 1, selectedObjectId: null };
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

  deleteSlideById: (id) => {
    const { slides, currentIndex } = get();
    if (slides.length <= 1) return;
    const idx = slides.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const updated = slides.filter((s) => s.id !== id);
    set({
      slides: updated,
      currentIndex: currentIndex >= updated.length ? updated.length - 1 : currentIndex > idx ? currentIndex - 1 : currentIndex,
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

  copySlide: (id) => {
    const slide = get().slides.find((s) => s.id === id);
    if (slide) set({ clipboardSlide: slide });
  },

  pasteSlide: (targetIndex) => {
    const { clipboardSlide } = get();
    if (!clipboardSlide) return;
    const clone = deepCloneSlide(clipboardSlide);
    set((state) => {
      const updated = [...state.slides];
      updated.splice(targetIndex + 1, 0, clone);
      return { slides: updated, currentIndex: targetIndex + 1, selectedObjectId: null };
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

  addTextBox: (slideId) => {
    const newObj = createObject('body', 'Text', { x: 400, y: 250, width: 300, height: 60, fontSize: 22 });
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
    const newObj = createObject('shape', '', {
      shapeType,
      x: 380,
      y: 195,
      width: 200,
      height: 150,
      fill: '#60A5FA',
      stroke: '#1E40AF',
      strokeWidth: 2,
    });
    set((state) => ({
      slides: state.slides.map((s) =>
        s.id === slide.id ? { ...s, objects: [...s.objects, newObj] } : s
      ),
      selectedObjectId: newObj.id,
    }));
  },

  addImage: (slideId, src, origWidth, origHeight) => {
    // Resize to fit within 400x400 while maintaining aspect ratio
    let width = origWidth;
    let height = origHeight;
    const maxSize = 400;
    if (width > maxSize || height > maxSize) {
      const scale = Math.min(maxSize / width, maxSize / height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }
    const x = Math.round((960 - width) / 2);
    const y = Math.round((540 - height) / 2);
    const newObj: SlideObject = {
      id: crypto.randomUUID(),
      type: 'image',
      text: '',
      x,
      y,
      width,
      height,
      src,
      originalSrc: src,
      rotation: 0,
      imgOpacity: 1,
      cornerRadius: 0,
    };
    set((state) => ({
      slides: state.slides.map((s) =>
        s.id === slideId ? { ...s, objects: [...s.objects, newObj] } : s
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

  updateSlideBackground: (slideId, bg) => {
    set((state) => ({
      slides: state.slides.map((s) => (s.id === slideId ? { ...s, background: bg } : s)),
    }));
  },

  applyBackgroundToAll: (bg) => {
    set((state) => ({
      slides: state.slides.map((s) => ({ ...s, background: bg })),
    }));
  },

  resetSlideBackground: (slideId) => {
    set((state) => ({
      slides: state.slides.map((s) => (s.id === slideId ? { ...s, background: undefined } : s)),
    }));
  },

  // ── Alignment & Arrangement ──

  alignObjects: (slideId, objectIds, alignType) => {
    set((state) => {
      const slide = state.slides.find(s => s.id === slideId);
      if (!slide) return state;
      const objs = slide.objects.filter(o => objectIds.includes(o.id));
      if (objs.length < 2) return state;

      let updates: Record<string, Partial<SlideObject>> = {};
      switch (alignType) {
        case 'left': {
          const minX = Math.min(...objs.map(o => o.x));
          objs.forEach(o => { updates[o.id] = { x: minX }; });
          break;
        }
        case 'center-h': {
          const avgCenter = objs.reduce((s, o) => s + o.x + o.width / 2, 0) / objs.length;
          objs.forEach(o => { updates[o.id] = { x: Math.round(avgCenter - o.width / 2) }; });
          break;
        }
        case 'right': {
          const maxRight = Math.max(...objs.map(o => o.x + o.width));
          objs.forEach(o => { updates[o.id] = { x: maxRight - o.width }; });
          break;
        }
        case 'top': {
          const minY = Math.min(...objs.map(o => o.y));
          objs.forEach(o => { updates[o.id] = { y: minY }; });
          break;
        }
        case 'center-v': {
          const avgMiddle = objs.reduce((s, o) => s + o.y + o.height / 2, 0) / objs.length;
          objs.forEach(o => { updates[o.id] = { y: Math.round(avgMiddle - o.height / 2) }; });
          break;
        }
        case 'bottom': {
          const maxBottom = Math.max(...objs.map(o => o.y + o.height));
          objs.forEach(o => { updates[o.id] = { y: maxBottom - o.height }; });
          break;
        }
      }
      return {
        slides: state.slides.map(s => s.id !== slideId ? s : {
          ...s,
          objects: s.objects.map(o => updates[o.id] ? { ...o, ...updates[o.id] } : o),
        }),
      };
    });
  },

  distributeObjects: (slideId, objectIds, distributeType) => {
    set((state) => {
      const slide = state.slides.find(s => s.id === slideId);
      if (!slide) return state;
      const objs = slide.objects.filter(o => objectIds.includes(o.id));
      if (objs.length < 3) return state;

      let updates: Record<string, Partial<SlideObject>> = {};
      if (distributeType === 'horizontal' || distributeType === 'left-edges' || distributeType === 'right-edges') {
        const sorted = [...objs].sort((a, b) => a.x - b.x);
        if (distributeType === 'horizontal') {
          const totalWidth = sorted.reduce((s, o) => s + o.width, 0);
          const minX = sorted[0].x;
          const maxRight = sorted[sorted.length - 1].x + sorted[sorted.length - 1].width;
          const spacing = (maxRight - minX - totalWidth) / (sorted.length - 1);
          let currentX = minX;
          sorted.forEach(o => {
            updates[o.id] = { x: Math.round(currentX) };
            currentX += o.width + spacing;
          });
        } else if (distributeType === 'left-edges') {
          const minX = sorted[0].x;
          const maxX = sorted[sorted.length - 1].x;
          const step = (maxX - minX) / (sorted.length - 1);
          sorted.forEach((o, i) => { updates[o.id] = { x: Math.round(minX + step * i) }; });
        } else {
          const sortedByRight = [...objs].sort((a, b) => (a.x + a.width) - (b.x + b.width));
          const minR = sortedByRight[0].x + sortedByRight[0].width;
          const maxR = sortedByRight[sortedByRight.length - 1].x + sortedByRight[sortedByRight.length - 1].width;
          const step = (maxR - minR) / (sortedByRight.length - 1);
          sortedByRight.forEach((o, i) => { updates[o.id] = { x: Math.round(minR + step * i - o.width) }; });
        }
      } else {
        const sorted = [...objs].sort((a, b) => a.y - b.y);
        if (distributeType === 'vertical') {
          const totalHeight = sorted.reduce((s, o) => s + o.height, 0);
          const minY = sorted[0].y;
          const maxBottom = sorted[sorted.length - 1].y + sorted[sorted.length - 1].height;
          const spacing = (maxBottom - minY - totalHeight) / (sorted.length - 1);
          let currentY = minY;
          sorted.forEach(o => {
            updates[o.id] = { y: Math.round(currentY) };
            currentY += o.height + spacing;
          });
        } else if (distributeType === 'top-edges') {
          const minY = sorted[0].y;
          const maxY = sorted[sorted.length - 1].y;
          const step = (maxY - minY) / (sorted.length - 1);
          sorted.forEach((o, i) => { updates[o.id] = { y: Math.round(minY + step * i) }; });
        } else {
          const sortedByBottom = [...objs].sort((a, b) => (a.y + a.height) - (b.y + b.height));
          const minB = sortedByBottom[0].y + sortedByBottom[0].height;
          const maxB = sortedByBottom[sortedByBottom.length - 1].y + sortedByBottom[sortedByBottom.length - 1].height;
          const step = (maxB - minB) / (sortedByBottom.length - 1);
          sortedByBottom.forEach((o, i) => { updates[o.id] = { y: Math.round(minB + step * i - o.height) }; });
        }
      }
      return {
        slides: state.slides.map(s => s.id !== slideId ? s : {
          ...s,
          objects: s.objects.map(o => updates[o.id] ? { ...o, ...updates[o.id] } : o),
        }),
      };
    });
  },

  matchObjectSize: (slideId, objectIds, dimension) => {
    set((state) => {
      const slide = state.slides.find(s => s.id === slideId);
      if (!slide) return state;
      const objs = slide.objects.filter(o => objectIds.includes(o.id));
      if (objs.length < 2) return state;
      const ref = objs[0];
      const updates: Record<string, Partial<SlideObject>> = {};
      objs.slice(1).forEach(o => {
        if (dimension === 'width') updates[o.id] = { width: ref.width };
        else if (dimension === 'height') updates[o.id] = { height: ref.height };
        else updates[o.id] = { width: ref.width, height: ref.height };
      });
      return {
        slides: state.slides.map(s => s.id !== slideId ? s : {
          ...s,
          objects: s.objects.map(o => updates[o.id] ? { ...o, ...updates[o.id] } : o),
        }),
      };
    });
  },

  reorderObject: (slideId, objectId, direction) => {
    set((state) => {
      const slide = state.slides.find(s => s.id === slideId);
      if (!slide) return state;
      const objects = [...slide.objects];
      const idx = objects.findIndex(o => o.id === objectId);
      if (idx === -1) return state;

      let newObjects = [...objects];
      switch (direction) {
        case 'front': {
          const [obj] = newObjects.splice(idx, 1);
          newObjects.push(obj);
          break;
        }
        case 'back': {
          const [obj] = newObjects.splice(idx, 1);
          newObjects.unshift(obj);
          break;
        }
        case 'forward': {
          if (idx < newObjects.length - 1) {
            [newObjects[idx], newObjects[idx + 1]] = [newObjects[idx + 1], newObjects[idx]];
          }
          break;
        }
        case 'backward': {
          if (idx > 0) {
            [newObjects[idx], newObjects[idx - 1]] = [newObjects[idx - 1], newObjects[idx]];
          }
          break;
        }
      }
      return {
        slides: state.slides.map(s => s.id !== slideId ? s : { ...s, objects: newObjects }),
      };
    });
  },

  // ── Presentation management ──

  newPresentation: (name) => {
    const meta = createPresentationMeta(name, 1);
    const newSlides: SlideData[] = [
      { id: crypto.randomUUID(), name: 'Title Slide', objects: [createObject('title', name), createObject('body', '')] },
    ];
    slideCounter = 1;
    set({ presentationId: meta.id, presentationMeta: meta, slides: newSlides, currentIndex: 0, selectedObjectId: null });
    savePresentation({ meta, slides: newSlides, currentIndex: 0 });
    saveToStorage({ id: meta.id, slides: newSlides, currentIndex: 0, meta });
  },

  openPresentation: (id) => {
    const record = loadPresentation(id);
    if (!record) return;
    slideCounter = record.slides.length;
    set({
      presentationId: record.meta.id,
      presentationMeta: record.meta,
      slides: record.slides,
      currentIndex: Math.min(record.currentIndex, record.slides.length - 1),
      selectedObjectId: null,
    });
    saveToStorage({ id: record.meta.id, slides: record.slides, currentIndex: record.currentIndex, meta: record.meta });
  },

  saveCurrent: () => {
    const { slides, currentIndex, presentationMeta } = get();
    if (!presentationMeta) {
      const meta = createPresentationMeta('Untitled Presentation', slides.length);
      set({ presentationId: meta.id, presentationMeta: meta });
      savePresentation({ meta, slides, currentIndex });
      saveToStorage({ id: meta.id, slides, currentIndex, meta });
    } else {
      const meta = { ...presentationMeta, modifiedAt: new Date().toISOString(), slideCount: slides.length };
      set({ presentationMeta: meta });
      savePresentation({ meta, slides, currentIndex });
      saveToStorage({ id: meta.id, slides, currentIndex, meta });
    }
  },

  saveAs: (newName) => {
    const { slides, currentIndex } = get();
    const meta = createPresentationMeta(newName, slides.length);
    set({ presentationId: meta.id, presentationMeta: meta });
    savePresentation({ meta, slides, currentIndex });
    saveToStorage({ id: meta.id, slides, currentIndex, meta });
  },

  deleteSavedPresentation: (id) => { deletePresentationFromStorage(id); },
  listSavedPresentations: () => listPresentationsFromStorage(),

  updatePresentationMeta: (updates) => {
    const { presentationMeta, slides, currentIndex } = get();
    if (!presentationMeta) return;
    const meta = { ...presentationMeta, ...updates, modifiedAt: new Date().toISOString() };
    set({ presentationMeta: meta });
    savePresentation({ meta, slides, currentIndex });
    saveToStorage({ id: meta.id, slides, currentIndex, meta });
  },

  closePresentation: () => {
    clearStorage();
    slideCounter = initialSlides.length;
    set({ presentationId: null, presentationMeta: null, slides: initialSlides, currentIndex: 0, selectedObjectId: null });
  },
}));
