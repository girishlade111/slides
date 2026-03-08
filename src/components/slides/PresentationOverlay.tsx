import { useEffect, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import type { SlideData } from '@/data/slides';
import { KonvaSlideCanvas } from './KonvaSlideCanvas';

interface PresentationOverlayProps {
  slides: SlideData[];
  startIndex: number;
  onClose: () => void;
}

export function PresentationOverlay({ slides, startIndex, onClose }: PresentationOverlayProps) {
  const [idx, setIdx] = useState(startIndex);
  const total = slides.length;

  const goNext = useCallback(() => setIdx((i) => Math.min(i + 1, total - 1)), [total]);
  const goPrev = useCallback(() => setIdx((i) => Math.max(i - 1, 0)), []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' || e.key === ' ') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, goNext, goPrev]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center cursor-pointer"
      onClick={goNext}
    >
      {/* Close button */}
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        title="Exit (Esc)"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Slide counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium">
        {idx + 1} / {total}
      </div>

      {/* Canvas */}
      <div
        className="pointer-events-none"
        style={{ transform: 'scale(1.5)', transformOrigin: 'center center' }}
        onClick={(e) => e.stopPropagation()}
      >
        <KonvaSlideCanvas slide={slides[idx]} readOnly />
      </div>

      {/* Invisible prev zone */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1/4 cursor-pointer"
        onClick={(e) => { e.stopPropagation(); goPrev(); }}
      />
    </div>
  );
}
