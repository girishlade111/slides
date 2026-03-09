import { useEffect, useState, useCallback, useRef } from 'react';
import { X } from 'lucide-react';
import type { SlideData } from '@/data/slides';
import { DEFAULT_TRANSITION, EASING_OPTIONS, getTransitionStyles, getAnimationKeyframes } from '@/data/animations';
import type { ObjectAnimation } from '@/data/animations';
import { KonvaSlideCanvas } from './KonvaSlideCanvas';

interface PresentationOverlayProps {
  slides: SlideData[];
  startIndex: number;
  onClose: () => void;
}

export function PresentationOverlay({ slides, startIndex, onClose }: PresentationOverlayProps) {
  const [idx, setIdx] = useState(startIndex);
  const [prevIdx, setPrevIdx] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [animStep, setAnimStep] = useState(0); // current animation step on this slide
  const total = slides.length;
  const containerRef = useRef<HTMLDivElement>(null);
  const animRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const currentSlide = slides[idx];
  const transition = currentSlide?.transition ?? DEFAULT_TRANSITION;

  // Collect entrance animations for current slide sorted by order
  const entranceAnims: (ObjectAnimation & { objectId: string })[] = [];
  if (currentSlide?.animations) {
    for (const [objId, anims] of Object.entries(currentSlide.animations)) {
      for (const a of anims) {
        if (a.type === 'entrance') entranceAnims.push({ ...a, objectId: objId });
      }
    }
  }
  entranceAnims.sort((a, b) => a.order - b.order);

  const clickAnims = entranceAnims.filter(a => a.startTrigger === 'onClick');
  const totalClickSteps = clickAnims.length;

  const changeSlide = useCallback((newIdx: number) => {
    if (newIdx < 0 || newIdx >= total || transitioning) return;
    const target = slides[newIdx];
    const trans = target?.transition ?? DEFAULT_TRANSITION;

    if (trans.type !== 'none') {
      setPrevIdx(idx);
      setTransitioning(true);
      setIdx(newIdx);
      setAnimStep(0);
      setTimeout(() => {
        setTransitioning(false);
        setPrevIdx(null);
      }, trans.duration * 1000);
    } else {
      setIdx(newIdx);
      setAnimStep(0);
    }
  }, [idx, total, transitioning, slides]);

  const handleAdvance = useCallback(() => {
    // If there are click-triggered animations remaining, advance animation step
    if (animStep < totalClickSteps) {
      setAnimStep(s => s + 1);
      return;
    }
    // Otherwise go to next slide
    if (idx < total - 1) changeSlide(idx + 1);
  }, [animStep, totalClickSteps, idx, total, changeSlide]);

  const handleBack = useCallback(() => {
    if (animStep > 0) {
      setAnimStep(s => s - 1);
      return;
    }
    if (idx > 0) changeSlide(idx - 1);
  }, [animStep, idx, changeSlide]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' || e.key === ' ') handleAdvance();
      if (e.key === 'ArrowLeft') handleBack();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, handleAdvance, handleBack]);

  // Play entrance animations when slide loads or animStep changes
  useEffect(() => {
    if (!currentSlide?.animations) return;

    // Auto and withPrevious animations play immediately
    entranceAnims.forEach(a => {
      if (a.startTrigger === 'auto' || a.startTrigger === 'withPrevious' || a.startTrigger === 'afterPrevious') {
        playAnimation(a);
      }
    });

    // Play onClick animations up to current step
    clickAnims.slice(0, animStep).forEach(a => playAnimation(a));
  }, [idx, animStep]);

  const playAnimation = (anim: ObjectAnimation & { objectId: string }) => {
    const el = animRefs.current.get(anim.objectId);
    if (!el) return;
    const keyframes = getAnimationKeyframes(anim);
    const ease = EASING_OPTIONS.find(e => e.value === anim.easing)?.css ?? 'ease';
    el.animate(keyframes, {
      duration: anim.duration * 1000,
      delay: anim.delay * 1000,
      easing: ease,
      fill: 'forwards',
      iterations: anim.repeat === 0 ? Infinity : anim.repeat,
    });
  };

  const easingCss = EASING_OPTIONS.find(e => e.value === transition.easing)?.css ?? 'ease';

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center cursor-pointer"
      onClick={handleAdvance}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        title="Exit (Esc)"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium">
        {idx + 1} / {total}
        {totalClickSteps > 0 && (
          <span className="ml-2 text-white/40">
            (click {Math.min(animStep, totalClickSteps)}/{totalClickSteps})
          </span>
        )}
      </div>

      {/* Slide container with transitions */}
      <div className="relative" style={{ width: 960, height: 540, transform: 'scale(1.5)', transformOrigin: 'center center' }}>
        {/* Previous slide (exiting) */}
        {prevIdx !== null && transitioning && (
          <div
            style={{
              ...getTransitionStyles(transition, 'exit'),
              transition: `all ${transition.duration}s ${easingCss}`,
            }}
          >
            <div className="pointer-events-none">
              <KonvaSlideCanvas slide={slides[prevIdx]} readOnly />
            </div>
          </div>
        )}

        {/* Current slide (entering) */}
        <div
          style={transitioning ? {
            ...getTransitionStyles(transition, 'enter'),
            transition: `all ${transition.duration}s ${easingCss}`,
          } : { position: 'absolute', inset: 0 }}
        >
          <div className="pointer-events-none" onClick={(e) => e.stopPropagation()}>
            <KonvaSlideCanvas slide={currentSlide} readOnly />
          </div>
        </div>
      </div>

      {/* Invisible prev zone */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1/4 cursor-pointer"
        onClick={(e) => { e.stopPropagation(); handleBack(); }}
      />
    </div>
  );
}
