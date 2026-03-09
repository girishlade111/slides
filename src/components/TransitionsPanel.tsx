import { useState } from 'react';
import { X, Play } from 'lucide-react';
import { TRANSITION_OPTIONS, EASING_OPTIONS, DEFAULT_TRANSITION, type SlideTransition, type TransitionType, type EasingType } from '@/data/animations';
import { useSlidesStore } from '@/store/useSlidesStore';
import { Slider } from '@/components/ui/slider';

interface TransitionsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function TransitionsPanel({ open, onClose }: TransitionsPanelProps) {
  const { slides, currentIndex } = useSlidesStore();
  const slide = slides[currentIndex];
  const current: SlideTransition = slide?.transition ?? DEFAULT_TRANSITION;

  const [transition, setTransition] = useState<SlideTransition>(current);
  const [previewing, setPreviewing] = useState(false);

  if (!open || !slide) return null;

  const updateStore = (t: SlideTransition, all = false) => {
    const store = useSlidesStore.getState();
    if (all) {
      store.setSlides(store.slides.map(s => ({ ...s, transition: t })));
    } else {
      store.setSlides(store.slides.map(s => s.id === slide.id ? { ...s, transition: t } : s));
    }
  };

  const set = (partial: Partial<SlideTransition>) => {
    const next = { ...transition, ...partial };
    setTransition(next);
    updateStore(next);
  };

  const handlePreview = () => {
    setPreviewing(true);
    setTimeout(() => setPreviewing(false), (transition.duration * 1000) + 100);
  };

  const groups = TRANSITION_OPTIONS.reduce<Record<string, typeof TRANSITION_OPTIONS>>((acc, o) => {
    (acc[o.group] ??= []).push(o);
    return acc;
  }, {});

  return (
    <div className="fixed right-0 top-0 bottom-0 w-80 bg-background border-l border-border shadow-xl z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Slide Transitions</h2>
        <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Transition type grid */}
        {Object.entries(groups).map(([group, items]) => (
          <div key={group}>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">{group}</label>
            <div className="grid grid-cols-3 gap-1.5">
              {items.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => set({ type: opt.value })}
                  className={`px-2 py-1.5 text-[10px] rounded border transition-colors ${
                    transition.type === opt.value
                      ? 'border-primary bg-primary/10 text-primary font-medium'
                      : 'border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Duration */}
        <div>
          <label className="text-xs text-muted-foreground mb-2 flex justify-between">
            <span>Duration</span>
            <span className="font-mono">{transition.duration.toFixed(1)}s</span>
          </label>
          <Slider
            min={0.3}
            max={3}
            step={0.1}
            value={[transition.duration]}
            onValueChange={([v]) => set({ duration: v })}
          />
        </div>

        {/* Easing */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Easing</label>
          <select
            value={transition.easing}
            onChange={e => set({ easing: e.target.value as EasingType })}
            className="w-full h-8 text-xs rounded border border-border bg-background text-foreground px-2"
          >
            {EASING_OPTIONS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
          </select>
        </div>

        {/* Preview */}
        <button
          onClick={handlePreview}
          disabled={transition.type === 'none' || previewing}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-md border border-border text-foreground hover:bg-muted disabled:opacity-40 transition-colors"
        >
          <Play className="w-3 h-3" />
          {previewing ? 'Playing...' : 'Preview Transition'}
        </button>

        {/* Apply buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => updateStore(transition, false)}
            className="flex-1 py-2 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Apply to This Slide
          </button>
          <button
            onClick={() => updateStore(transition, true)}
            className="flex-1 py-2 text-xs font-medium rounded-md border border-border text-foreground hover:bg-muted transition-colors"
          >
            Apply to All
          </button>
        </div>
      </div>
    </div>
  );
}
