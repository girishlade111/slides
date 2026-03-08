import type { SlideObject, ShadowConfig } from '@/data/slides';
import { useSlidesStore } from '@/store/useSlidesStore';
import { cn } from '@/lib/utils';
import { FlipHorizontal, FlipVertical, Lock, Unlock, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Props {
  obj: SlideObject;
  slideId: string;
}

export function ShapePropertiesPanel({ obj, slideId }: Props) {
  const { updateObjectStyle, deleteObject } = useSlidesStore();
  const slide = useSlidesStore((s) => s.slides.find((sl) => sl.id === slideId));
  const [lockAspect, setLockAspect] = useState(false);

  const update = (props: Partial<SlideObject>) => updateObjectStyle(slideId, obj.id, props);

  const updateShadow = (patch: Partial<ShadowConfig>) => {
    const current = obj.shadow ?? { enabled: false, color: '#000000', blur: 4, offsetX: 2, offsetY: 2 };
    update({ shadow: { ...current, ...patch } });
  };

  const shadow = obj.shadow ?? { enabled: false, color: '#000000', blur: 4, offsetX: 2, offsetY: 2 };

  const handleWidthChange = (w: number) => {
    if (lockAspect && obj.width > 0) {
      const ratio = obj.height / obj.width;
      update({ width: w, height: Math.round(w * ratio) });
    } else {
      update({ width: w });
    }
  };

  const handleHeightChange = (h: number) => {
    if (lockAspect && obj.height > 0) {
      const ratio = obj.width / obj.height;
      update({ height: h, width: Math.round(h * ratio) });
    } else {
      update({ height: h });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium text-muted-foreground capitalize">{obj.shapeType?.replace(/-/g, ' ') ?? 'Shape'}</p>

      {/* Fill */}
      <Section title="Fill">
        <div className="flex gap-2 items-center">
          <input type="color" value={obj.fill ?? '#60A5FA'} onChange={(e) => update({ fill: e.target.value })} className="w-7 h-7 rounded border border-border cursor-pointer" />
          <input type="text" value={obj.fill ?? '#60A5FA'} onChange={(e) => update({ fill: e.target.value })} className="flex-1 px-2 py-1 text-xs rounded border border-border bg-background text-foreground outline-none" />
          <button onClick={() => update({ fill: 'transparent' })} className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground hover:bg-muted">None</button>
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Opacity
          <input type="range" min={0} max={100} value={Math.round((obj.fillOpacity ?? 1) * 100)} onChange={(e) => update({ fillOpacity: Number(e.target.value) / 100 })} className="flex-1 h-1 accent-primary" />
          <span className="w-8 text-right">{Math.round((obj.fillOpacity ?? 1) * 100)}%</span>
        </label>
      </Section>

      {/* Border */}
      <Section title="Border">
        <div className="flex gap-2 items-center">
          <input type="color" value={obj.stroke ?? '#1E40AF'} onChange={(e) => update({ stroke: e.target.value })} className="w-7 h-7 rounded border border-border cursor-pointer" />
          <input type="text" value={obj.stroke ?? '#1E40AF'} onChange={(e) => update({ stroke: e.target.value })} className="flex-1 px-2 py-1 text-xs rounded border border-border bg-background text-foreground outline-none" />
          <button onClick={() => update({ stroke: 'transparent', strokeWidth: 0 })} className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground hover:bg-muted">None</button>
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Width
          <input type="range" min={0} max={10} step={0.5} value={obj.strokeWidth ?? 2} onChange={(e) => update({ strokeWidth: Number(e.target.value) })} className="flex-1 h-1 accent-primary" />
          <span className="w-6 text-right">{obj.strokeWidth ?? 2}</span>
        </label>
        <div className="flex gap-1">
          {(['solid', 'dashed', 'dotted'] as const).map((s) => (
            <button key={s} onClick={() => update({ strokeStyle: s })} className={cn('flex-1 px-2 py-1 text-[10px] rounded border capitalize', (obj.strokeStyle ?? 'solid') === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-muted')}>
              {s}
            </button>
          ))}
        </div>
      </Section>

      {/* Shadow */}
      <Section title="Shadow">
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={shadow.enabled} onChange={(e) => updateShadow({ enabled: e.target.checked })} className="accent-primary" />
          <span className="text-muted-foreground">Enable shadow</span>
        </label>
        {shadow.enabled && (
          <>
            <div className="flex gap-2 items-center">
              <input type="color" value={shadow.color} onChange={(e) => updateShadow({ color: e.target.value })} className="w-6 h-6 rounded border border-border cursor-pointer" />
              <label className="flex items-center gap-1 text-xs text-muted-foreground flex-1">
                Blur <input type="number" min={0} max={20} value={shadow.blur} onChange={(e) => updateShadow({ blur: Number(e.target.value) })} className="w-12 px-1 py-0.5 text-xs rounded border border-border bg-background text-foreground outline-none" />
              </label>
            </div>
            <div className="flex gap-2">
              <label className="flex items-center gap-1 text-xs text-muted-foreground">
                X <input type="number" value={shadow.offsetX} onChange={(e) => updateShadow({ offsetX: Number(e.target.value) })} className="w-12 px-1 py-0.5 text-xs rounded border border-border bg-background text-foreground outline-none" />
              </label>
              <label className="flex items-center gap-1 text-xs text-muted-foreground">
                Y <input type="number" value={shadow.offsetY} onChange={(e) => updateShadow({ offsetY: Number(e.target.value) })} className="w-12 px-1 py-0.5 text-xs rounded border border-border bg-background text-foreground outline-none" />
              </label>
            </div>
          </>
        )}
      </Section>

      {/* Transform */}
      <Section title="Transform">
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-0.5">
            <span className="text-[10px] text-muted-foreground">Width</span>
            <input type="number" value={Math.round(obj.width)} min={20} onChange={(e) => handleWidthChange(Number(e.target.value))} className="px-2 py-1 text-xs rounded border border-border bg-background text-foreground outline-none" />
          </label>
          <label className="flex flex-col gap-0.5">
            <span className="text-[10px] text-muted-foreground">Height</span>
            <input type="number" value={Math.round(obj.height)} min={20} onChange={(e) => handleHeightChange(Number(e.target.value))} className="px-2 py-1 text-xs rounded border border-border bg-background text-foreground outline-none" />
          </label>
          <label className="flex flex-col gap-0.5">
            <span className="text-[10px] text-muted-foreground">X</span>
            <input type="number" value={Math.round(obj.x)} onChange={(e) => update({ x: Number(e.target.value) })} className="px-2 py-1 text-xs rounded border border-border bg-background text-foreground outline-none" />
          </label>
          <label className="flex flex-col gap-0.5">
            <span className="text-[10px] text-muted-foreground">Y</span>
            <input type="number" value={Math.round(obj.y)} onChange={(e) => update({ y: Number(e.target.value) })} className="px-2 py-1 text-xs rounded border border-border bg-background text-foreground outline-none" />
          </label>
        </div>
        <label className="flex flex-col gap-0.5">
          <span className="text-[10px] text-muted-foreground">Rotation (°)</span>
          <input type="number" min={0} max={360} value={obj.rotation ?? 0} onChange={(e) => update({ rotation: Number(e.target.value) })} className="px-2 py-1 text-xs rounded border border-border bg-background text-foreground outline-none" />
        </label>
        <div className="flex items-center gap-2">
          <button onClick={() => setLockAspect(!lockAspect)} title="Lock aspect ratio" className={cn('p-1.5 rounded border transition-colors', lockAspect ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground hover:bg-muted')}>
            {lockAspect ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
          </button>
          <button onClick={() => update({ width: obj.width, x: obj.x })} title="Flip horizontal" className="p-1.5 rounded border border-border text-muted-foreground hover:bg-muted">
            <FlipHorizontal className="w-3 h-3" />
          </button>
          <button onClick={() => update({ height: obj.height, y: obj.y })} title="Flip vertical" className="p-1.5 rounded border border-border text-muted-foreground hover:bg-muted">
            <FlipVertical className="w-3 h-3" />
          </button>
        </div>
      </Section>

      {/* Delete */}
      {slide && slide.objects.length > 1 && (
        <button onClick={() => deleteObject(slideId, obj.id)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors">
          <Trash2 className="w-3 h-3" /> Delete Shape
        </button>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
      {children}
    </div>
  );
}
