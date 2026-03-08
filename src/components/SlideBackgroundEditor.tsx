import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useSlidesStore } from '@/store/useSlidesStore';
import type { SlideBackground, GradientStop } from '@/data/slides';
import { Paintbrush, X, Upload, Loader2 } from 'lucide-react';

const PRESET_COLORS = [
  '#ffffff', '#000000', '#e5e7eb', '#374151',
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6',
  '#ec4899', '#14b8a6', '#6366f1', '#f59e0b', '#10b981', '#06b6d4',
];

const PATTERN_TYPES = [
  { type: 'dots', label: 'Dots' },
  { type: 'grid', label: 'Grid' },
  { type: 'diagonal-stripes', label: 'Diagonal Stripes' },
  { type: 'horizontal-stripes', label: 'Horizontal Stripes' },
  { type: 'vertical-stripes', label: 'Vertical Stripes' },
  { type: 'checkerboard', label: 'Checkerboard' },
  { type: 'hexagons', label: 'Hexagons' },
  { type: 'triangles', label: 'Triangles' },
];

const TABS = ['Solid', 'Gradient', 'Image', 'Pattern'] as const;
type Tab = typeof TABS[number];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SlideBackgroundEditor({ open, onClose }: Props) {
  const { slides, currentIndex, updateSlideBackground, applyBackgroundToAll, resetSlideBackground } = useSlidesStore();
  const slide = slides[currentIndex];
  const [tab, setTab] = useState<Tab>('Solid');
  const [recentColors, setRecentColors] = useState<string[]>([]);

  // Local state for editing
  const [color, setColor] = useState('#ffffff');
  const [gradType, setGradType] = useState<'linear' | 'radial' | 'diagonal-lr' | 'diagonal-rl'>('linear');
  const [gradStops, setGradStops] = useState<GradientStop[]>([
    { color: '#3b82f6', position: 0 },
    { color: '#8b5cf6', position: 100 },
  ]);
  const [gradAngle, setGradAngle] = useState(180);
  const [imgSrc, setImgSrc] = useState('');
  const [imgFit, setImgFit] = useState<'fill' | 'fit' | 'stretch' | 'tile' | 'center'>('fill');
  const [imgOpacity, setImgOpacity] = useState(100);
  const [imgBlur, setImgBlur] = useState(0);
  const [patternType, setPatternType] = useState('dots');
  const [patternColor, setPatternColor] = useState('#3b82f6');
  const [patternBg, setPatternBg] = useState('#ffffff');
  const [patternScale, setPatternScale] = useState(1);
  const [imgLoading, setImgLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Init from current slide background
  useEffect(() => {
    if (!slide?.background) return;
    const bg = slide.background;
    if (bg.type === 'color' && bg.color) { setColor(bg.color); setTab('Solid'); }
    if (bg.type === 'gradient' && bg.gradient) {
      setGradType(bg.gradient.type);
      setGradStops(bg.gradient.stops);
      setGradAngle(bg.gradient.angle);
      setTab('Gradient');
    }
    if (bg.type === 'image' && bg.image) {
      setImgSrc(bg.image.src);
      setImgFit(bg.image.fit);
      setImgOpacity(bg.image.opacity);
      setImgBlur(bg.image.blur);
      setTab('Image');
    }
    if (bg.type === 'pattern' && bg.pattern) {
      setPatternType(bg.pattern.type);
      setPatternColor(bg.pattern.color);
      setPatternBg(bg.pattern.backgroundColor);
      setPatternScale(bg.pattern.scale);
      setTab('Pattern');
    }
  }, [slide?.id]);

  if (!open || !slide) return null;

  const addRecent = (c: string) => setRecentColors((prev) => [c, ...prev.filter((x) => x !== c)].slice(0, 8));

  const buildBg = (): SlideBackground => {
    if (tab === 'Solid') return { type: 'color', color };
    if (tab === 'Gradient') return { type: 'gradient', gradient: { type: gradType, stops: gradStops, angle: gradAngle } };
    if (tab === 'Image') return { type: 'image', image: { src: imgSrc, fit: imgFit, opacity: imgOpacity, blur: imgBlur } };
    return { type: 'pattern', pattern: { type: patternType, color: patternColor, backgroundColor: patternBg, scale: patternScale } };
  };

  const applyThis = () => { const bg = buildBg(); updateSlideBackground(slide.id, bg); };
  const applyAll = () => { const bg = buildBg(); applyBackgroundToAll(bg); };
  const reset = () => { resetSlideBackground(slide.id); setColor('#ffffff'); };

  const handleUploadBg = async (file: File) => {
    setImgLoading(true);
    const reader = new FileReader();
    reader.onload = () => { setImgSrc(reader.result as string); setImgLoading(false); };
    reader.onerror = () => setImgLoading(false);
    reader.readAsDataURL(file);
  };

  const updateStop = (idx: number, patch: Partial<GradientStop>) => {
    setGradStops((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const addStop = () => {
    if (gradStops.length >= 5) return;
    setGradStops((prev) => [...prev, { color: '#ffffff', position: 50 }].sort((a, b) => a.position - b.position));
  };

  const removeStop = (idx: number) => {
    if (gradStops.length <= 2) return;
    setGradStops((prev) => prev.filter((_, i) => i !== idx));
  };

  // Gradient CSS preview
  const gradientCSS = () => {
    const stops = gradStops.map((s) => `${s.color} ${s.position}%`).join(', ');
    if (gradType === 'radial') return `radial-gradient(circle, ${stops})`;
    const angles: Record<string, number> = { linear: gradAngle, 'diagonal-lr': 135, 'diagonal-rl': 225 };
    return `linear-gradient(${angles[gradType] ?? gradAngle}deg, ${stops})`;
  };

  // Pattern CSS preview
  const patternCSS = () => {
    const s = 20 * patternScale;
    switch (patternType) {
      case 'dots':
        return { backgroundImage: `radial-gradient(circle, ${patternColor} 1.5px, transparent 1.5px)`, backgroundSize: `${s}px ${s}px`, backgroundColor: patternBg };
      case 'grid':
        return { backgroundImage: `linear-gradient(${patternColor} 1px, transparent 1px), linear-gradient(90deg, ${patternColor} 1px, transparent 1px)`, backgroundSize: `${s}px ${s}px`, backgroundColor: patternBg };
      case 'diagonal-stripes':
        return { backgroundImage: `repeating-linear-gradient(45deg, ${patternColor}, ${patternColor} 2px, transparent 2px, transparent ${s}px)`, backgroundColor: patternBg };
      case 'horizontal-stripes':
        return { backgroundImage: `repeating-linear-gradient(0deg, ${patternColor}, ${patternColor} 2px, transparent 2px, transparent ${s}px)`, backgroundColor: patternBg };
      case 'vertical-stripes':
        return { backgroundImage: `repeating-linear-gradient(90deg, ${patternColor}, ${patternColor} 2px, transparent 2px, transparent ${s}px)`, backgroundColor: patternBg };
      case 'checkerboard':
        return { backgroundImage: `repeating-conic-gradient(${patternColor} 0% 25%, ${patternBg} 0% 50%)`, backgroundSize: `${s}px ${s}px` };
      case 'hexagons':
        return { backgroundImage: `radial-gradient(circle farthest-side at 0% 50%, ${patternBg} 23.5%, transparent 0) ${s / 2}px 0, radial-gradient(circle farthest-side at 0% 50%, ${patternColor} 24%, transparent 0) ${s / 2}px ${s / 2}px`, backgroundSize: `${s}px ${s}px`, backgroundColor: patternBg };
      case 'triangles':
        return { backgroundImage: `linear-gradient(60deg, ${patternColor} 25%, transparent 25.5%), linear-gradient(-60deg, ${patternColor} 25%, transparent 25.5%)`, backgroundSize: `${s}px ${s}px`, backgroundColor: patternBg };
      default:
        return { backgroundColor: patternBg };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60">
      <div className="w-[480px] max-h-[80vh] bg-card rounded-xl border border-border shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Paintbrush className="w-4 h-4" /> Slide Background
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 px-3 py-2 text-xs font-medium transition-colors',
                tab === t ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'Solid' && (
            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">Preset Colors</p>
              <div className="grid grid-cols-8 gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setColor(c); addRecent(c); }}
                    className={cn('w-8 h-8 rounded border hover:scale-110 transition-transform', color === c ? 'ring-2 ring-primary border-primary' : 'border-border')}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex gap-2 items-center">
                <input type="color" value={color} onChange={(e) => { setColor(e.target.value); addRecent(e.target.value); }} className="w-8 h-8 rounded border border-border cursor-pointer" />
                <input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="flex-1 px-2 py-1.5 text-xs rounded border border-border bg-background text-foreground outline-none" />
              </div>
              {recentColors.length > 0 && (
                <>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">Recent</p>
                  <div className="flex gap-1">
                    {recentColors.map((c) => (
                      <button key={c} onClick={() => setColor(c)} className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </>
              )}
              {/* Preview */}
              <div className="h-20 rounded-lg border border-border" style={{ backgroundColor: color }} />
            </div>
          )}

          {tab === 'Gradient' && (
            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">Type</p>
              <div className="flex gap-1">
                {(['linear', 'radial', 'diagonal-lr', 'diagonal-rl'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setGradType(t)}
                    className={cn('flex-1 px-2 py-1.5 text-[10px] rounded border capitalize', gradType === t ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-muted')}
                  >
                    {t.replace(/-/g, ' ')}
                  </button>
                ))}
              </div>

              {gradType === 'linear' && (
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  Angle
                  <input type="range" min={0} max={360} value={gradAngle} onChange={(e) => setGradAngle(Number(e.target.value))} className="flex-1 h-1 accent-primary" />
                  <span className="w-8 text-right">{gradAngle}°</span>
                </label>
              )}

              <p className="text-[10px] font-semibold text-muted-foreground uppercase">Color Stops</p>
              {gradStops.map((stop, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input type="color" value={stop.color} onChange={(e) => updateStop(i, { color: e.target.value })} className="w-7 h-7 rounded border border-border cursor-pointer" />
                  <input type="range" min={0} max={100} value={stop.position} onChange={(e) => updateStop(i, { position: Number(e.target.value) })} className="flex-1 h-1 accent-primary" />
                  <span className="text-[10px] text-muted-foreground w-8 text-right">{stop.position}%</span>
                  {gradStops.length > 2 && (
                    <button onClick={() => removeStop(i)} className="text-destructive text-xs hover:bg-destructive/10 rounded px-1">×</button>
                  )}
                </div>
              ))}
              {gradStops.length < 5 && (
                <button onClick={addStop} className="text-xs text-primary hover:underline">+ Add stop</button>
              )}

              {/* Preview */}
              <div className="h-20 rounded-lg border border-border" style={{ background: gradientCSS() }} />
            </div>
          )}

          {tab === 'Image' && (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-lg text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                {imgLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload Background Image
              </button>
              <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.gif,.webp" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUploadBg(file);
                e.target.value = '';
              }} />

              {imgSrc && (
                <>
                  <div className="h-24 rounded-lg border border-border overflow-hidden">
                    <img src={imgSrc} alt="" className="w-full h-full object-cover" style={{ opacity: imgOpacity / 100, filter: imgBlur > 0 ? `blur(${imgBlur}px)` : undefined }} />
                  </div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">Fit</p>
                  <div className="flex gap-1">
                    {(['fill', 'fit', 'stretch', 'tile', 'center'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setImgFit(f)}
                        className={cn('flex-1 px-2 py-1.5 text-[10px] rounded border capitalize', imgFit === f ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-muted')}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    Opacity
                    <input type="range" min={0} max={100} value={imgOpacity} onChange={(e) => setImgOpacity(Number(e.target.value))} className="flex-1 h-1 accent-primary" />
                    <span className="w-8 text-right">{imgOpacity}%</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    Blur
                    <input type="range" min={0} max={20} value={imgBlur} onChange={(e) => setImgBlur(Number(e.target.value))} className="flex-1 h-1 accent-primary" />
                    <span className="w-6 text-right">{imgBlur}</span>
                  </label>
                </>
              )}
            </div>
          )}

          {tab === 'Pattern' && (
            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">Pattern</p>
              <div className="grid grid-cols-4 gap-1.5">
                {PATTERN_TYPES.map((p) => (
                  <button
                    key={p.type}
                    onClick={() => setPatternType(p.type)}
                    className={cn(
                      'p-2 rounded border text-[10px] text-center transition-colors',
                      patternType === p.type ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 items-center">
                <label className="flex items-center gap-1 text-xs text-muted-foreground">
                  Pattern <input type="color" value={patternColor} onChange={(e) => setPatternColor(e.target.value)} className="w-6 h-6 rounded border border-border cursor-pointer" />
                </label>
                <label className="flex items-center gap-1 text-xs text-muted-foreground">
                  Background <input type="color" value={patternBg} onChange={(e) => setPatternBg(e.target.value)} className="w-6 h-6 rounded border border-border cursor-pointer" />
                </label>
              </div>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                Scale
                <input type="range" min={0.5} max={3} step={0.1} value={patternScale} onChange={(e) => setPatternScale(Number(e.target.value))} className="flex-1 h-1 accent-primary" />
                <span className="w-8 text-right">{patternScale.toFixed(1)}</span>
              </label>
              {/* Preview */}
              <div className="h-20 rounded-lg border border-border" style={patternCSS()} />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-border">
          <button onClick={applyThis} className="flex-1 px-3 py-2 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            Apply to This Slide
          </button>
          <button onClick={applyAll} className="flex-1 px-3 py-2 text-xs font-medium rounded-md border border-primary text-primary hover:bg-primary/10 transition-colors">
            Apply to All
          </button>
          <button onClick={reset} className="px-3 py-2 text-xs font-medium rounded-md border border-border text-muted-foreground hover:bg-muted transition-colors">
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
