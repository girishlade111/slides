import type { SlideObject, ImageFilters, ShadowConfig, ImageBorder } from '@/data/slides';
import { useSlidesStore } from '@/store/useSlidesStore';
import { cn } from '@/lib/utils';
import { FlipHorizontal, FlipVertical, RotateCcw, RotateCw, Replace, Trash2 } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';

interface Props {
  obj: SlideObject;
  slideId: string;
}

const FILTER_PRESETS: { name: string; filters: Partial<ImageFilters> }[] = [
  { name: 'None', filters: { grayscale: false, sepia: false, blur: 0, brightness: 100, contrast: 100, saturation: 100 } },
  { name: 'Grayscale', filters: { grayscale: true, sepia: false } },
  { name: 'Sepia', filters: { grayscale: false, sepia: true } },
  { name: 'Vintage', filters: { sepia: true, saturation: 80, contrast: 90 } },
  { name: 'Cool', filters: { saturation: 110, brightness: 105 } },
  { name: 'Warm', filters: { saturation: 120, contrast: 105, brightness: 102 } },
];

export function ImagePropertiesPanel({ obj, slideId }: Props) {
  const { updateObjectStyle, deleteObject } = useSlidesStore();
  const slide = useSlidesStore((s) => s.slides.find((sl) => sl.id === slideId));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = useCallback((props: Partial<SlideObject>) => updateObjectStyle(slideId, obj.id, props), [updateObjectStyle, slideId, obj.id]);

  const filters = obj.filters ?? { grayscale: false, sepia: false, blur: 0, brightness: 100, contrast: 100, saturation: 100 };
  const border = obj.border ?? { enabled: false, color: '#1E40AF', width: 2 };
  const shadow = obj.shadow ?? { enabled: false, color: '#000000', blur: 8, offsetX: 4, offsetY: 4 };

  const updateFilters = (patch: Partial<ImageFilters>) => update({ filters: { ...filters, ...patch } });
  const updateBorder = (patch: Partial<ImageBorder>) => update({ border: { ...border, ...patch } });
  const updateShadow = (patch: Partial<ShadowConfig>) => update({ shadow: { ...shadow, ...patch } });

  const handleReplace = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const src = reader.result as string;
      update({ src, originalSrc: src });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium text-muted-foreground">Image</p>

      {/* Preview */}
      <div className="w-full aspect-video rounded border border-border overflow-hidden bg-muted">
        <img src={obj.src} alt="" className="w-full h-full object-contain" />
      </div>

      {/* Filters */}
      <Section title="Filters">
        <div className="flex flex-wrap gap-1">
          {FILTER_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => updateFilters(p.filters)}
              className={cn(
                'px-2 py-1 text-[10px] rounded border transition-colors',
                'border-border hover:bg-muted'
              )}
            >
              {p.name}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Blur
          <input type="range" min={0} max={10} value={filters.blur} onChange={(e) => updateFilters({ blur: Number(e.target.value) })} className="flex-1 h-1 accent-primary" />
          <span className="w-6 text-right">{filters.blur}</span>
        </label>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Brightness
          <input type="range" min={50} max={150} value={filters.brightness} onChange={(e) => updateFilters({ brightness: Number(e.target.value) })} className="flex-1 h-1 accent-primary" />
          <span className="w-8 text-right">{filters.brightness}%</span>
        </label>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Contrast
          <input type="range" min={50} max={150} value={filters.contrast} onChange={(e) => updateFilters({ contrast: Number(e.target.value) })} className="flex-1 h-1 accent-primary" />
          <span className="w-8 text-right">{filters.contrast}%</span>
        </label>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Saturation
          <input type="range" min={0} max={200} value={filters.saturation} onChange={(e) => updateFilters({ saturation: Number(e.target.value) })} className="flex-1 h-1 accent-primary" />
          <span className="w-8 text-right">{filters.saturation}%</span>
        </label>
      </Section>

      {/* Adjustments */}
      <Section title="Adjustments">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Opacity
          <input type="range" min={0} max={100} value={Math.round((obj.imgOpacity ?? 1) * 100)} onChange={(e) => update({ imgOpacity: Number(e.target.value) / 100 })} className="flex-1 h-1 accent-primary" />
          <span className="w-8 text-right">{Math.round((obj.imgOpacity ?? 1) * 100)}%</span>
        </label>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Rounded Corners
          <input type="range" min={0} max={50} value={obj.cornerRadius ?? 0} onChange={(e) => update({ cornerRadius: Number(e.target.value) })} className="flex-1 h-1 accent-primary" />
          <span className="w-6 text-right">{obj.cornerRadius ?? 0}</span>
        </label>
      </Section>

      {/* Border */}
      <Section title="Border">
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={border.enabled} onChange={(e) => updateBorder({ enabled: e.target.checked })} className="accent-primary" />
          <span className="text-muted-foreground">Enable border</span>
        </label>
        {border.enabled && (
          <div className="flex gap-2 items-center">
            <input type="color" value={border.color} onChange={(e) => updateBorder({ color: e.target.value })} className="w-6 h-6 rounded border border-border cursor-pointer" />
            <input type="number" min={1} max={10} value={border.width} onChange={(e) => updateBorder({ width: Number(e.target.value) })} className="w-12 px-1 py-0.5 text-xs rounded border border-border bg-background text-foreground outline-none" />
          </div>
        )}
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
            <input type="number" value={Math.round(obj.width)} min={20} onChange={(e) => update({ width: Number(e.target.value) })} className="px-2 py-1 text-xs rounded border border-border bg-background text-foreground outline-none" />
          </label>
          <label className="flex flex-col gap-0.5">
            <span className="text-[10px] text-muted-foreground">Height</span>
            <input type="number" value={Math.round(obj.height)} min={20} onChange={(e) => update({ height: Number(e.target.value) })} className="px-2 py-1 text-xs rounded border border-border bg-background text-foreground outline-none" />
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
          <button onClick={() => update({ rotation: ((obj.rotation ?? 0) - 90 + 360) % 360 })} title="Rotate left 90°" className="p-1.5 rounded border border-border text-muted-foreground hover:bg-muted">
            <RotateCcw className="w-3 h-3" />
          </button>
          <button onClick={() => update({ rotation: ((obj.rotation ?? 0) + 90) % 360 })} title="Rotate right 90°" className="p-1.5 rounded border border-border text-muted-foreground hover:bg-muted">
            <RotateCw className="w-3 h-3" />
          </button>
          <button onClick={() => update({ width: obj.width })} title="Flip horizontal" className="p-1.5 rounded border border-border text-muted-foreground hover:bg-muted">
            <FlipHorizontal className="w-3 h-3" />
          </button>
          <button onClick={() => update({ height: obj.height })} title="Flip vertical" className="p-1.5 rounded border border-border text-muted-foreground hover:bg-muted">
            <FlipVertical className="w-3 h-3" />
          </button>
        </div>
      </Section>

      {/* Replace */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"
      >
        <Replace className="w-3 h-3" /> Replace Image
      </button>
      <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.gif,.svg,.webp" className="hidden" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) handleReplace(file);
        e.target.value = '';
      }} />

      {/* Delete */}
      {slide && slide.objects.length > 1 && (
        <button onClick={() => deleteObject(slideId, obj.id)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors">
          <Trash2 className="w-3 h-3" /> Delete Image
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
