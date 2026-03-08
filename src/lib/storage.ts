import type { SlideData } from '@/data/slides';

const CURRENT_KEY = 'lade-slides:current';
const PRESENTATIONS_KEY = 'lade-slides:presentations';

// ── Presentation metadata ──

export interface PresentationMeta {
  id: string;
  name: string;
  author: string;
  slideSize: '16:9' | '4:3' | 'custom';
  createdAt: string;
  modifiedAt: string;
  slideCount: number;
}

export interface PresentationRecord {
  meta: PresentationMeta;
  slides: SlideData[];
  currentIndex: number;
}

// ── Current presentation (backward compat) ──

interface StoredState {
  id?: string;
  slides: SlideData[];
  currentIndex: number;
  meta?: PresentationMeta;
}

export function saveToStorage(state: StoredState): void {
  try {
    localStorage.setItem(CURRENT_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

export function loadFromStorage(): StoredState | null {
  try {
    const raw = localStorage.getItem(CURRENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredState;
    if (!Array.isArray(parsed.slides) || parsed.slides.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearStorage(): void {
  try { localStorage.removeItem(CURRENT_KEY); } catch { /* ignore */ }
}

// ── Multi-presentation storage ──

function loadAllPresentations(): Record<string, PresentationRecord> {
  try {
    const raw = localStorage.getItem(PRESENTATIONS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, PresentationRecord>;
  } catch {
    return {};
  }
}

function saveAllPresentations(data: Record<string, PresentationRecord>): void {
  try {
    localStorage.setItem(PRESENTATIONS_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

export function listPresentations(): PresentationMeta[] {
  const all = loadAllPresentations();
  return Object.values(all)
    .map((r) => r.meta)
    .sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());
}

export function loadPresentation(id: string): PresentationRecord | null {
  const all = loadAllPresentations();
  return all[id] ?? null;
}

export function savePresentation(record: PresentationRecord): void {
  const all = loadAllPresentations();
  all[record.meta.id] = { ...record, meta: { ...record.meta, modifiedAt: new Date().toISOString(), slideCount: record.slides.length } };
  saveAllPresentations(all);
}

export function deletePresentation(id: string): void {
  const all = loadAllPresentations();
  delete all[id];
  saveAllPresentations(all);
}

export function createPresentationMeta(name: string, slideCount: number): PresentationMeta {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name,
    author: '',
    slideSize: '16:9',
    createdAt: now,
    modifiedAt: now,
    slideCount,
  };
}
