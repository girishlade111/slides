import { useState } from 'react';
import { X, Trash2, GripVertical } from 'lucide-react';
import {
  ENTRANCE_EFFECTS, EMPHASIS_EFFECTS, EXIT_EFFECTS,
  EASING_OPTIONS, createObjectAnimation,
  type ObjectAnimation, type AnimationCategory, type EasingType, type StartTrigger,
} from '@/data/animations';
import { useSlidesStore } from '@/store/useSlidesStore';
import { Slider } from '@/components/ui/slider';

interface AnimationsPanelProps {
  open: boolean;
  onClose: () => void;
}

const TRIGGER_OPTIONS: { value: StartTrigger; label: string }[] = [
  { value: 'onClick', label: 'On Click' },
  { value: 'withPrevious', label: 'With Previous' },
  { value: 'afterPrevious', label: 'After Previous' },
  { value: 'auto', label: 'Auto (after delay)' },
];

export function AnimationsPanel({ open, onClose }: AnimationsPanelProps) {
  const { slides, currentIndex, selectedObjectId } = useSlidesStore();
  const slide = slides[currentIndex];
  const [tab, setTab] = useState<AnimationCategory>('entrance');
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!open || !slide) return null;

  const animations: ObjectAnimation[] = slide.animations?.[selectedObjectId ?? ''] ?? [];
  const allAnimations = slide.animations ?? {};

  // Flatten all animations for timeline
  const timeline: (ObjectAnimation & { objectId: string })[] = [];
  for (const [objId, anims] of Object.entries(allAnimations)) {
    for (const a of anims) {
      timeline.push({ ...a, objectId: objId });
    }
  }
  timeline.sort((a, b) => a.order - b.order);

  const addAnimation = (effect: string, directions?: string[]) => {
    if (!selectedObjectId) return;
    const dir = directions?.[0];
    const order = animations.length;
    const anim = createObjectAnimation(tab, effect, order, dir);
    const store = useSlidesStore.getState();
    const existing = slide.animations?.[selectedObjectId] ?? [];
    const newAnims = { ...slide.animations, [selectedObjectId]: [...existing, anim] };
    store.setSlides(store.slides.map(s => s.id === slide.id ? { ...s, animations: newAnims } : s));
    setEditingId(anim.id);
  };

  const updateAnimation = (animId: string, updates: Partial<ObjectAnimation>) => {
    if (!selectedObjectId) return;
    const store = useSlidesStore.getState();
    const objAnims = (slide.animations?.[selectedObjectId] ?? []).map(a =>
      a.id === animId ? { ...a, ...updates } : a
    );
    const newAnims = { ...slide.animations, [selectedObjectId]: objAnims };
    store.setSlides(store.slides.map(s => s.id === slide.id ? { ...s, animations: newAnims } : s));
  };

  const removeAnimation = (animId: string) => {
    if (!selectedObjectId) return;
    const store = useSlidesStore.getState();
    const objAnims = (slide.animations?.[selectedObjectId] ?? []).filter(a => a.id !== animId);
    const newAnims = { ...slide.animations, [selectedObjectId]: objAnims };
    store.setSlides(store.slides.map(s => s.id === slide.id ? { ...s, animations: newAnims } : s));
    if (editingId === animId) setEditingId(null);
  };

  const editingAnim = animations.find(a => a.id === editingId);

  const effectsList = tab === 'entrance' ? ENTRANCE_EFFECTS : tab === 'emphasis' ? EMPHASIS_EFFECTS : EXIT_EFFECTS;

  const getObjLabel = (objId: string) => {
    const obj = slide.objects.find(o => o.id === objId);
    if (!obj) return 'Unknown';
    if (obj.type === 'shape') return `Shape (${obj.shapeType ?? 'rect'})`;
    if (obj.type === 'image') return 'Image';
    return obj.text?.slice(0, 20) || obj.type;
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 w-80 bg-background border-l border-border shadow-xl z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Object Animations</h2>
        <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      {!selectedObjectId ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <p className="text-xs text-muted-foreground text-center">Select an object on the canvas to add animations</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Category tabs */}
          <div className="flex border-b border-border">
            {(['entrance', 'emphasis', 'exit'] as AnimationCategory[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 text-xs py-2 font-medium capitalize transition-colors ${
                  tab === t ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Effects list */}
          <div className="p-3">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">
              Add {tab} Animation
            </label>
            <div className="grid grid-cols-2 gap-1.5 mb-4">
              {effectsList.map(eff => (
                <button
                  key={eff.value}
                  onClick={() => addAnimation(eff.value, 'directions' in eff ? (eff as any).directions : undefined)}
                  className="px-2 py-1.5 text-[10px] rounded border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-left"
                >
                  {eff.label}
                </button>
              ))}
            </div>

            {/* Current object animations */}
            {animations.length > 0 && (
              <div className="mb-4">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">
                  Applied Animations ({animations.length})
                </label>
                <div className="space-y-1">
                  {animations.map(anim => (
                    <div
                      key={anim.id}
                      onClick={() => setEditingId(anim.id)}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer transition-colors ${
                        editingId === anim.id ? 'bg-primary/10 border border-primary/30' : 'bg-muted/50 hover:bg-muted'
                      }`}
                    >
                      <GripVertical className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        anim.type === 'entrance' ? 'bg-green-500' : anim.type === 'exit' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <span className="flex-1 truncate text-foreground">{anim.effect}</span>
                      <span className="text-[10px] text-muted-foreground">{anim.duration}s</span>
                      <button
                        onClick={e => { e.stopPropagation(); removeAnimation(anim.id); }}
                        className="p-0.5 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Edit selected animation */}
            {editingAnim && (
              <div className="space-y-3 border-t border-border pt-3">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
                  Edit: {editingAnim.effect}
                </label>

                {/* Direction (if applicable) */}
                {(() => {
                  const effDef = [...ENTRANCE_EFFECTS, ...EXIT_EFFECTS].find(e => e.value === editingAnim.effect);
                  if (!effDef || !('directions' in effDef) || !effDef.directions) return null;
                  return (
                    <div>
                      <span className="text-[10px] text-muted-foreground">Direction</span>
                      <div className="grid grid-cols-4 gap-1 mt-1">
                        {effDef.directions.map(d => (
                          <button
                            key={d}
                            onClick={() => updateAnimation(editingAnim.id, { direction: d })}
                            className={`text-[10px] py-1 rounded border capitalize transition-colors ${
                              editingAnim.direction === d
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border text-muted-foreground hover:bg-muted'
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Start trigger */}
                <div>
                  <span className="text-[10px] text-muted-foreground">Start</span>
                  <select
                    value={editingAnim.startTrigger}
                    onChange={e => updateAnimation(editingAnim.id, { startTrigger: e.target.value as StartTrigger })}
                    className="w-full h-7 text-xs rounded border border-border bg-background text-foreground px-2 mt-0.5"
                  >
                    {TRIGGER_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <span className="text-[10px] text-muted-foreground flex justify-between">
                    <span>Duration</span><span className="font-mono">{editingAnim.duration.toFixed(1)}s</span>
                  </span>
                  <Slider
                    min={0.1} max={5} step={0.1}
                    value={[editingAnim.duration]}
                    onValueChange={([v]) => updateAnimation(editingAnim.id, { duration: v })}
                  />
                </div>

                {/* Delay */}
                <div>
                  <span className="text-[10px] text-muted-foreground flex justify-between">
                    <span>Delay</span><span className="font-mono">{editingAnim.delay.toFixed(1)}s</span>
                  </span>
                  <Slider
                    min={0} max={10} step={0.1}
                    value={[editingAnim.delay]}
                    onValueChange={([v]) => updateAnimation(editingAnim.id, { delay: v })}
                  />
                </div>

                {/* Easing */}
                <div>
                  <span className="text-[10px] text-muted-foreground">Easing</span>
                  <select
                    value={editingAnim.easing}
                    onChange={e => updateAnimation(editingAnim.id, { easing: e.target.value as EasingType })}
                    className="w-full h-7 text-xs rounded border border-border bg-background text-foreground px-2 mt-0.5"
                  >
                    {EASING_OPTIONS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                  </select>
                </div>

                {/* Repeat */}
                <div>
                  <span className="text-[10px] text-muted-foreground">Repeat</span>
                  <div className="grid grid-cols-4 gap-1 mt-1">
                    {[1, 2, 3, 0].map(r => (
                      <button
                        key={r}
                        onClick={() => updateAnimation(editingAnim.id, { repeat: r })}
                        className={`text-[10px] py-1 rounded border transition-colors ${
                          editingAnim.repeat === r
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {r === 0 ? 'Loop' : `${r}×`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          {timeline.length > 0 && (
            <div className="border-t border-border p-3 mt-auto">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">
                Slide Animation Timeline
              </label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {timeline.map((a, i) => (
                  <div key={a.id} className="flex items-center gap-2 text-[10px] text-muted-foreground px-1">
                    <span className="w-4 text-right font-mono">{i + 1}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      a.type === 'entrance' ? 'bg-green-500' : a.type === 'exit' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <span className="flex-1 truncate">{getObjLabel(a.objectId)}: {a.effect}</span>
                    <span className="font-mono">{a.delay > 0 ? `+${a.delay}s ` : ''}{a.duration}s</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
