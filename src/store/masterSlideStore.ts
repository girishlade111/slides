import { create } from 'zustand';
import LZString from 'lz-string';
import {
  MasterSlide,
  MasterLayout,
  MasterPlaceholder,
  createDefaultMasterSlide,
  createBuiltInLayouts,
} from './masterSlideTypes';
import type { SlideObject, TextProperties } from './types';

const STORAGE_KEY = 'lade-master-slides';

function saveCompressed(key: string, data: unknown): void {
  try {
    localStorage.setItem(key, LZString.compressToUTF16(JSON.stringify(data)));
  } catch (e) {
    console.warn('Master slide save failed:', e);
  }
}

function loadCompressed<T>(key: string): T | null {
  try {
    const c = localStorage.getItem(key);
    if (!c) return null;
    const json = LZString.decompressFromUTF16(c);
    if (json) return JSON.parse(json) as T;
    return JSON.parse(c) as T;
  } catch {
    return null;
  }
}

interface MasterSlideStore {
  masterSlides: MasterSlide[];
  activeMasterId: string | null;
  editingMaster: boolean;
  selectedLayoutId: string | null;
  selectedPlaceholderId: string | null;

  // Init
  loadMasterSlides: () => void;
  saveMasterSlides: () => void;

  // Master CRUD
  createMasterSlide: (name?: string) => string;
  deleteMasterSlide: (id: string) => void;
  renameMasterSlide: (id: string, name: string) => void;
  setActiveMaster: (id: string) => void;

  // Layout operations
  updateLayout: (masterId: string, layoutId: string, updates: Partial<MasterLayout>) => void;
  addLayout: (masterId: string, layout: MasterLayout) => void;
  deleteLayout: (masterId: string, layoutId: string) => void;

  // Placeholder operations
  addPlaceholder: (masterId: string, layoutId: string, placeholder: MasterPlaceholder) => void;
  updatePlaceholder: (masterId: string, layoutId: string, placeholderId: string, updates: Partial<MasterPlaceholder>) => void;
  deletePlaceholder: (masterId: string, layoutId: string, placeholderId: string) => void;

  // Editor mode
  setEditingMaster: (editing: boolean) => void;
  setSelectedLayoutId: (id: string | null) => void;
  setSelectedPlaceholderId: (id: string | null) => void;

  // Apply layout → generate slide objects
  generateObjectsFromLayout: (layoutId: string) => SlideObject[];

  // Export / Import
  exportMaster: (masterId: string) => string;
  importMaster: (json: string) => string | null;

  // Helpers
  getActiveMaster: () => MasterSlide | null;
  getLayout: (masterId: string, layoutId: string) => MasterLayout | undefined;
}

export const useMasterSlideStore = create<MasterSlideStore>()((set, get) => {
  const persist = () => {
    const { masterSlides, activeMasterId } = get();
    saveCompressed(STORAGE_KEY, { masterSlides, activeMasterId });
  };

  return {
    masterSlides: [],
    activeMasterId: null,
    editingMaster: false,
    selectedLayoutId: null,
    selectedPlaceholderId: null,

    loadMasterSlides: () => {
      const data = loadCompressed<{ masterSlides: MasterSlide[]; activeMasterId: string | null }>(STORAGE_KEY);
      if (data && data.masterSlides.length > 0) {
        set({ masterSlides: data.masterSlides, activeMasterId: data.activeMasterId });
      } else {
        const defaultMaster = createDefaultMasterSlide();
        set({ masterSlides: [defaultMaster], activeMasterId: defaultMaster.id });
        persist();
      }
    },

    saveMasterSlides: persist,

    createMasterSlide: (name = 'Custom Master') => {
      const master: MasterSlide = {
        id: crypto.randomUUID(),
        name,
        layouts: createBuiltInLayouts(),
      };
      set((s) => ({ masterSlides: [...s.masterSlides, master] }));
      persist();
      return master.id;
    },

    deleteMasterSlide: (id) => {
      set((s) => {
        const filtered = s.masterSlides.filter((m) => m.id !== id);
        return {
          masterSlides: filtered,
          activeMasterId: s.activeMasterId === id ? (filtered[0]?.id ?? null) : s.activeMasterId,
        };
      });
      persist();
    },

    renameMasterSlide: (id, name) => {
      set((s) => ({
        masterSlides: s.masterSlides.map((m) => (m.id === id ? { ...m, name } : m)),
      }));
      persist();
    },

    setActiveMaster: (id) => {
      set({ activeMasterId: id });
      persist();
    },

    updateLayout: (masterId, layoutId, updates) => {
      set((s) => ({
        masterSlides: s.masterSlides.map((m) =>
          m.id === masterId
            ? { ...m, layouts: m.layouts.map((l) => (l.id === layoutId ? { ...l, ...updates } : l)) }
            : m
        ),
      }));
      persist();
    },

    addLayout: (masterId, layout) => {
      set((s) => ({
        masterSlides: s.masterSlides.map((m) =>
          m.id === masterId ? { ...m, layouts: [...m.layouts, layout] } : m
        ),
      }));
      persist();
    },

    deleteLayout: (masterId, layoutId) => {
      set((s) => ({
        masterSlides: s.masterSlides.map((m) =>
          m.id === masterId ? { ...m, layouts: m.layouts.filter((l) => l.id !== layoutId) } : m
        ),
      }));
      persist();
    },

    addPlaceholder: (masterId, layoutId, placeholder) => {
      set((s) => ({
        masterSlides: s.masterSlides.map((m) =>
          m.id === masterId
            ? {
                ...m,
                layouts: m.layouts.map((l) =>
                  l.id === layoutId
                    ? { ...l, placeholders: [...l.placeholders, placeholder] }
                    : l
                ),
              }
            : m
        ),
      }));
      persist();
    },

    updatePlaceholder: (masterId, layoutId, placeholderId, updates) => {
      set((s) => ({
        masterSlides: s.masterSlides.map((m) =>
          m.id === masterId
            ? {
                ...m,
                layouts: m.layouts.map((l) =>
                  l.id === layoutId
                    ? {
                        ...l,
                        placeholders: l.placeholders.map((p) =>
                          p.id === placeholderId ? { ...p, ...updates } : p
                        ),
                      }
                    : l
                ),
              }
            : m
        ),
      }));
      persist();
    },

    deletePlaceholder: (masterId, layoutId, placeholderId) => {
      set((s) => ({
        masterSlides: s.masterSlides.map((m) =>
          m.id === masterId
            ? {
                ...m,
                layouts: m.layouts.map((l) =>
                  l.id === layoutId
                    ? { ...l, placeholders: l.placeholders.filter((p) => p.id !== placeholderId) }
                    : l
                ),
              }
            : m
        ),
      }));
      persist();
    },

    setEditingMaster: (editing) => set({ editingMaster: editing }),
    setSelectedLayoutId: (id) => set({ selectedLayoutId: id, selectedPlaceholderId: null }),
    setSelectedPlaceholderId: (id) => set({ selectedPlaceholderId: id }),

    generateObjectsFromLayout: (layoutId) => {
      const { masterSlides, activeMasterId } = get();
      const master = masterSlides.find((m) => m.id === activeMasterId);
      if (!master) return [];
      const layout = master.layouts.find((l) => l.id === layoutId);
      if (!layout) return [];

      return layout.placeholders.map((p, i): SlideObject => ({
        id: crypto.randomUUID(),
        type: p.type === 'image' ? 'image' : 'text',
        position: { x: p.x, y: p.y },
        size: { width: p.width, height: p.height },
        rotation: 0,
        zIndex: i + 1,
        locked: false,
        visible: true,
        opacity: 1,
        properties: p.type === 'image'
          ? {
              type: 'image' as const,
              src: '',
              alt: p.defaultText,
              objectFit: 'contain' as const,
              filters: { brightness: 100, contrast: 100, grayscale: 0, blur: 0, sepia: 0 },
            }
          : {
              type: 'text' as const,
              content: p.defaultText,
              fontFamily: p.fontFamily,
              fontSize: p.fontSize,
              fontWeight: 400,
              fontStyle: 'normal' as const,
              textDecoration: 'none' as const,
              textAlign: p.align as TextProperties['textAlign'],
              color: p.color,
              lineHeight: 1.4,
              letterSpacing: 0,
            },
      }));
    },

    exportMaster: (masterId) => {
      const master = get().masterSlides.find((m) => m.id === masterId);
      return JSON.stringify(master, null, 2);
    },

    importMaster: (json) => {
      try {
        const master = JSON.parse(json) as MasterSlide;
        if (!master.id || !master.layouts) return null;
        master.id = crypto.randomUUID(); // give new ID
        set((s) => ({ masterSlides: [...s.masterSlides, master] }));
        persist();
        return master.id;
      } catch {
        return null;
      }
    },

    getActiveMaster: () => {
      const { masterSlides, activeMasterId } = get();
      return masterSlides.find((m) => m.id === activeMasterId) ?? null;
    },

    getLayout: (masterId, layoutId) => {
      const master = get().masterSlides.find((m) => m.id === masterId);
      return master?.layouts.find((l) => l.id === layoutId);
    },
  };
});

// Auto-load on first import
useMasterSlideStore.getState().loadMasterSlides();
