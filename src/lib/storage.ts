import type { SlideData } from '@/data/slides';

const STORAGE_KEY = 'lade-slides:current';

interface StoredState {
  slides: SlideData[];
  currentIndex: number;
}

export function saveToStorage(state: StoredState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

export function loadFromStorage(): StoredState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredState;
    if (!Array.isArray(parsed.slides) || parsed.slides.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
