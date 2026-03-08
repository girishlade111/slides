import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import LZString from 'lz-string';
import {
  Presentation,
  Slide,
  SlideObject,
  HistoryState,
  createDefaultSlide,
  createDefaultPresentation,
} from './types';

const MAX_HISTORY = 20;
const AUTOSAVE_KEY = 'lade-slides-presentation';
const AUTOSAVE_DEBOUNCE_MS = 3000;

// Compressed persistence helpers
function saveCompressed(key: string, data: unknown): void {
  try {
    const json = JSON.stringify(data);
    const compressed = LZString.compressToUTF16(json);
    localStorage.setItem(key, compressed);
  } catch (e) {
    console.warn('Auto-save failed:', e);
  }
}

function loadCompressed<T>(key: string): T | null {
  try {
    const compressed = localStorage.getItem(key);
    if (!compressed) return null;
    // Try decompressing first (new format)
    const json = LZString.decompressFromUTF16(compressed);
    if (json) return JSON.parse(json) as T;
    // Fallback: try raw JSON (old format migration)
    return JSON.parse(compressed) as T;
  } catch {
    return null;
  }
}

interface PresentationStore {
  // Core state
  presentation: Presentation;
  currentSlideIndex: number;
  selectedObjectIds: string[];
  clipboard: SlideObject[];
  history: HistoryState;
  isSaving: boolean;
  lastSavedAt: number | null;

  // Slide operations
  addSlide: (afterIndex?: number) => void;
  deleteSlide: (slideId: string) => void;
  duplicateSlide: (slideId: string) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;
  navigateSlide: (direction: 'prev' | 'next') => void;
  setCurrentSlideIndex: (index: number) => void;
  updateSlide: (slideId: string, updates: Partial<Slide>) => void;
  updateSlideNotes: (slideId: string, notes: string) => void;

  // Object operations
  addObject: (slideId: string, object: SlideObject) => void;
  updateObject: (slideId: string, objectId: string, updates: Partial<SlideObject>) => void;
  deleteObject: (slideId: string, objectId: string) => void;
  moveObject: (slideId: string, objectId: string, deltaX: number, deltaY: number) => void;
  resizeObject: (slideId: string, objectId: string, width: number, height: number) => void;
  rotateObject: (slideId: string, objectId: string, angle: number) => void;
  duplicateObject: (slideId: string, objectId: string) => void;
  bringToFront: (slideId: string, objectId: string) => void;
  sendToBack: (slideId: string, objectId: string) => void;
  bringForward: (slideId: string, objectId: string) => void;
  sendBackward: (slideId: string, objectId: string) => void;
  selectObjects: (objectIds: string[]) => void;
  clearSelection: () => void;

  // Clipboard
  copyObjects: () => void;
  pasteObjects: () => void;
  cutObjects: () => void;

  // History
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Presentation meta
  setPresentationName: (name: string) => void;
  setTheme: (theme: string) => void;
  
  // Persistence
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => boolean;
  newPresentation: () => void;
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function reindexSlides(slides: Slide[]): Slide[] {
  return slides.map((s, i) => ({ ...s, order: i }));
}

export const usePresentationStore = create<PresentationStore>()(
  subscribeWithSelector((set, get) => {
    // Push current state to history before mutation
    const pushHistory = () => {
      const { presentation, history } = get();
      const newPast = [...history.past, deepClone(presentation)].slice(-MAX_HISTORY);
      set({ history: { past: newPast, future: [] } });
    };

    const autoSave = () => {
      set({ isSaving: true });
      const { presentation } = get();
      saveCompressed(AUTOSAVE_KEY, presentation);
      set({ isSaving: false, lastSavedAt: Date.now() });
    };

    return {
      presentation: createDefaultPresentation(),
      currentSlideIndex: 0,
      selectedObjectIds: [],
      clipboard: [],
      history: { past: [], future: [] },
      isSaving: false,
      lastSavedAt: null,

      // === Slide Operations ===

      addSlide: (afterIndex?: number) => {
        pushHistory();
        set((state) => {
          const idx = afterIndex ?? state.currentSlideIndex;
          const newSlide = createDefaultSlide(idx + 1);
          const slides = [...state.presentation.slides];
          slides.splice(idx + 1, 0, newSlide);
          return {
            presentation: {
              ...state.presentation,
              slides: reindexSlides(slides),
              updatedAt: Date.now(),
            },
            currentSlideIndex: idx + 1,
          };
        });
        autoSave();
      },

      deleteSlide: (slideId: string) => {
        const { presentation } = get();
        if (presentation.slides.length <= 1) return; // Can't delete last slide
        pushHistory();
        set((state) => {
          const slides = state.presentation.slides.filter((s) => s.id !== slideId);
          const newIndex = Math.min(state.currentSlideIndex, slides.length - 1);
          return {
            presentation: {
              ...state.presentation,
              slides: reindexSlides(slides),
              updatedAt: Date.now(),
            },
            currentSlideIndex: newIndex,
            selectedObjectIds: [],
          };
        });
        autoSave();
      },

      duplicateSlide: (slideId: string) => {
        pushHistory();
        set((state) => {
          const sourceIndex = state.presentation.slides.findIndex((s) => s.id === slideId);
          if (sourceIndex === -1) return state;
          const source = state.presentation.slides[sourceIndex];
          const clone: Slide = {
            ...deepClone(source),
            id: crypto.randomUUID(),
            name: `${source.name} (Copy)`,
          };
          // Give all objects new IDs
          clone.objects = clone.objects.map((obj) => ({
            ...obj,
            id: crypto.randomUUID(),
          }));
          const slides = [...state.presentation.slides];
          slides.splice(sourceIndex + 1, 0, clone);
          return {
            presentation: {
              ...state.presentation,
              slides: reindexSlides(slides),
              updatedAt: Date.now(),
            },
            currentSlideIndex: sourceIndex + 1,
          };
        });
        autoSave();
      },

      reorderSlides: (fromIndex: number, toIndex: number) => {
        if (fromIndex === toIndex) return;
        pushHistory();
        set((state) => {
          const slides = [...state.presentation.slides];
          const [moved] = slides.splice(fromIndex, 1);
          slides.splice(toIndex, 0, moved);
          return {
            presentation: {
              ...state.presentation,
              slides: reindexSlides(slides),
              updatedAt: Date.now(),
            },
            currentSlideIndex: toIndex,
          };
        });
        autoSave();
      },

      navigateSlide: (direction: 'prev' | 'next') => {
        set((state) => {
          const max = state.presentation.slides.length - 1;
          const newIndex =
            direction === 'next'
              ? Math.min(max, state.currentSlideIndex + 1)
              : Math.max(0, state.currentSlideIndex - 1);
          return { currentSlideIndex: newIndex };
        });
      },

      setCurrentSlideIndex: (index: number) => {
        set({ currentSlideIndex: index, selectedObjectIds: [] });
      },

      updateSlide: (slideId: string, updates: Partial<Slide>) => {
        pushHistory();
        set((state) => ({
          presentation: {
            ...state.presentation,
            slides: state.presentation.slides.map((s) =>
              s.id === slideId ? { ...s, ...updates } : s
            ),
            updatedAt: Date.now(),
          },
        }));
        autoSave();
      },

      updateSlideNotes: (slideId: string, notes: string) => {
        set((state) => ({
          presentation: {
            ...state.presentation,
            slides: state.presentation.slides.map((s) =>
              s.id === slideId ? { ...s, notes } : s
            ),
            updatedAt: Date.now(),
          },
        }));
        autoSave();
      },

      // === Object Operations ===

      addObject: (slideId: string, object: SlideObject) => {
        pushHistory();
        set((state) => ({
          presentation: {
            ...state.presentation,
            slides: state.presentation.slides.map((s) =>
              s.id === slideId ? { ...s, objects: [...s.objects, object] } : s
            ),
            updatedAt: Date.now(),
          },
          selectedObjectIds: [object.id],
        }));
        autoSave();
      },

      updateObject: (slideId: string, objectId: string, updates: Partial<SlideObject>) => {
        set((state) => ({
          presentation: {
            ...state.presentation,
            slides: state.presentation.slides.map((s) =>
              s.id === slideId
                ? {
                    ...s,
                    objects: s.objects.map((o) =>
                      o.id === objectId ? { ...o, ...updates } : o
                    ),
                  }
                : s
            ),
            updatedAt: Date.now(),
          },
        }));
      },

      deleteObject: (slideId: string, objectId: string) => {
        pushHistory();
        set((state) => ({
          presentation: {
            ...state.presentation,
            slides: state.presentation.slides.map((s) =>
              s.id === slideId
                ? { ...s, objects: s.objects.filter((o) => o.id !== objectId) }
                : s
            ),
            updatedAt: Date.now(),
          },
          selectedObjectIds: state.selectedObjectIds.filter((id) => id !== objectId),
        }));
        autoSave();
      },

      selectObjects: (objectIds: string[]) => set({ selectedObjectIds: objectIds }),
      clearSelection: () => set({ selectedObjectIds: [] }),

      // === Dedicated Object Manipulation ===

      moveObject: (slideId: string, objectId: string, deltaX: number, deltaY: number) => {
        set((state) => ({
          presentation: {
            ...state.presentation,
            slides: state.presentation.slides.map((s) =>
              s.id === slideId
                ? {
                    ...s,
                    objects: s.objects.map((o) =>
                      o.id === objectId
                        ? { ...o, position: { x: Math.round(o.position.x + deltaX), y: Math.round(o.position.y + deltaY) } }
                        : o
                    ),
                  }
                : s
            ),
            updatedAt: Date.now(),
          },
        }));
      },

      resizeObject: (slideId: string, objectId: string, width: number, height: number) => {
        pushHistory();
        set((state) => ({
          presentation: {
            ...state.presentation,
            slides: state.presentation.slides.map((s) =>
              s.id === slideId
                ? {
                    ...s,
                    objects: s.objects.map((o) =>
                      o.id === objectId
                        ? { ...o, size: { width: Math.max(20, Math.round(width)), height: Math.max(20, Math.round(height)) } }
                        : o
                    ),
                  }
                : s
            ),
            updatedAt: Date.now(),
          },
        }));
        autoSave();
      },

      rotateObject: (slideId: string, objectId: string, angle: number) => {
        pushHistory();
        set((state) => ({
          presentation: {
            ...state.presentation,
            slides: state.presentation.slides.map((s) =>
              s.id === slideId
                ? {
                    ...s,
                    objects: s.objects.map((o) =>
                      o.id === objectId ? { ...o, rotation: angle % 360 } : o
                    ),
                  }
                : s
            ),
            updatedAt: Date.now(),
          },
        }));
        autoSave();
      },

      duplicateObject: (slideId: string, objectId: string) => {
        pushHistory();
        set((state) => {
          const slide = state.presentation.slides.find((s) => s.id === slideId);
          if (!slide) return state;
          const source = slide.objects.find((o) => o.id === objectId);
          if (!source) return state;
          const clone: SlideObject = {
            ...deepClone(source),
            id: crypto.randomUUID(),
            position: { x: source.position.x + 30, y: source.position.y + 30 },
            zIndex: Date.now(),
          };
          return {
            presentation: {
              ...state.presentation,
              slides: state.presentation.slides.map((s) =>
                s.id === slideId ? { ...s, objects: [...s.objects, clone] } : s
              ),
              updatedAt: Date.now(),
            },
            selectedObjectIds: [clone.id],
          };
        });
        autoSave();
      },

      bringToFront: (slideId: string, objectId: string) => {
        pushHistory();
        set((state) => {
          const maxZ = Math.max(...(state.presentation.slides.find(s => s.id === slideId)?.objects.map(o => o.zIndex) || [0]));
          return {
            presentation: {
              ...state.presentation,
              slides: state.presentation.slides.map((s) =>
                s.id === slideId
                  ? { ...s, objects: s.objects.map((o) => o.id === objectId ? { ...o, zIndex: maxZ + 1 } : o) }
                  : s
              ),
              updatedAt: Date.now(),
            },
          };
        });
        autoSave();
      },

      sendToBack: (slideId: string, objectId: string) => {
        pushHistory();
        set((state) => {
          const minZ = Math.min(...(state.presentation.slides.find(s => s.id === slideId)?.objects.map(o => o.zIndex) || [0]));
          return {
            presentation: {
              ...state.presentation,
              slides: state.presentation.slides.map((s) =>
                s.id === slideId
                  ? { ...s, objects: s.objects.map((o) => o.id === objectId ? { ...o, zIndex: minZ - 1 } : o) }
                  : s
              ),
              updatedAt: Date.now(),
            },
          };
        });
        autoSave();
      },

      bringForward: (slideId: string, objectId: string) => {
        pushHistory();
        set((state) => ({
          presentation: {
            ...state.presentation,
            slides: state.presentation.slides.map((s) =>
              s.id === slideId
                ? { ...s, objects: s.objects.map((o) => o.id === objectId ? { ...o, zIndex: o.zIndex + 1 } : o) }
                : s
            ),
            updatedAt: Date.now(),
          },
        }));
        autoSave();
      },

      sendBackward: (slideId: string, objectId: string) => {
        pushHistory();
        set((state) => ({
          presentation: {
            ...state.presentation,
            slides: state.presentation.slides.map((s) =>
              s.id === slideId
                ? { ...s, objects: s.objects.map((o) => o.id === objectId ? { ...o, zIndex: Math.max(0, o.zIndex - 1) } : o) }
                : s
            ),
            updatedAt: Date.now(),
          },
        }));
        autoSave();
      },

      // === Clipboard ===

      copyObjects: () => {
        const { selectedObjectIds, presentation, currentSlideIndex } = get();
        const slide = presentation.slides[currentSlideIndex];
        if (!slide) return;
        const copied = slide.objects.filter((o) => selectedObjectIds.includes(o.id));
        set({ clipboard: deepClone(copied) });
      },

      pasteObjects: () => {
        const { clipboard, presentation, currentSlideIndex } = get();
        if (clipboard.length === 0) return;
        const slide = presentation.slides[currentSlideIndex];
        if (!slide) return;
        pushHistory();
        const pasted = clipboard.map((obj) => ({
          ...deepClone(obj),
          id: crypto.randomUUID(),
          position: { x: obj.position.x + 20, y: obj.position.y + 20 },
        }));
        set((state) => ({
          presentation: {
            ...state.presentation,
            slides: state.presentation.slides.map((s) =>
              s.id === slide.id ? { ...s, objects: [...s.objects, ...pasted] } : s
            ),
            updatedAt: Date.now(),
          },
          selectedObjectIds: pasted.map((o) => o.id),
        }));
        autoSave();
      },

      cutObjects: () => {
        const store = get();
        store.copyObjects();
        const { selectedObjectIds, presentation, currentSlideIndex } = get();
        const slide = presentation.slides[currentSlideIndex];
        if (!slide) return;
        pushHistory();
        set((state) => ({
          presentation: {
            ...state.presentation,
            slides: state.presentation.slides.map((s) =>
              s.id === slide.id
                ? { ...s, objects: s.objects.filter((o) => !selectedObjectIds.includes(o.id)) }
                : s
            ),
            updatedAt: Date.now(),
          },
          selectedObjectIds: [],
        }));
        autoSave();
      },

      // === History ===

      undo: () => {
        const { history, presentation } = get();
        if (history.past.length === 0) return;
        const previous = history.past[history.past.length - 1];
        set({
          presentation: previous,
          history: {
            past: history.past.slice(0, -1),
            future: [deepClone(presentation), ...history.future].slice(0, MAX_HISTORY),
          },
        });
        autoSave();
      },

      redo: () => {
        const { history, presentation } = get();
        if (history.future.length === 0) return;
        const next = history.future[0];
        set({
          presentation: next,
          history: {
            past: [...history.past, deepClone(presentation)].slice(-MAX_HISTORY),
            future: history.future.slice(1),
          },
        });
        autoSave();
      },

      canUndo: () => get().history.past.length > 0,
      canRedo: () => get().history.future.length > 0,

      // === Presentation Meta ===

      setPresentationName: (name: string) => {
        set((state) => ({
          presentation: { ...state.presentation, name, updatedAt: Date.now() },
        }));
        autoSave();
      },

      setTheme: (theme: string) => {
        pushHistory();
        set((state) => ({
          presentation: { ...state.presentation, theme, updatedAt: Date.now() },
        }));
        autoSave();
      },

      // === Persistence ===

      saveToLocalStorage: () => {
        autoSave();
      },

      loadFromLocalStorage: () => {
        const presentation = loadCompressed<Presentation>(AUTOSAVE_KEY);
        if (presentation && presentation.slides && presentation.slides.length > 0) {
          set({
            presentation,
            currentSlideIndex: 0,
            selectedObjectIds: [],
            history: { past: [], future: [] },
            lastSavedAt: Date.now(),
          });
          return true;
        }
        return false;
      },

      newPresentation: () => {
        set({
          presentation: createDefaultPresentation(),
          currentSlideIndex: 0,
          selectedObjectIds: [],
          clipboard: [],
          history: { past: [], future: [] },
        });
        autoSave();
      },
    };
  })
);