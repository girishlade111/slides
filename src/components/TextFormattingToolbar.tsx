import { useSlidesStore } from '@/store/useSlidesStore';
import type { SlideObject } from '@/data/slides';
import { cn } from '@/lib/utils';
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered,
  Type, Palette,
} from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';

const FONT_FAMILIES = [
  'Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana',
  'Comic Sans MS', 'Impact', 'Trebuchet MS', 'Lucida Sans',
  'Segoe UI', 'Tahoma', 'Calibri', 'Cambria',
];

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 44, 48, 56, 64, 72, 96];

const COLOR_PALETTE = [
  '#000000', '#434343', '#666666', '#999999', '#cccccc', '#ffffff',
  '#ff0000', '#ff6600', '#ffcc00', '#33cc33', '#3399ff', '#6633cc',
  '#cc0066', '#ff3399', '#ff9966', '#99cc33', '#00cccc', '#9966ff',
  '#800000', '#804000', '#808000', '#008000', '#004080', '#400080',
];

const LINE_SPACINGS = [1.0, 1.15, 1.5, 2.0, 2.5, 3.0];

interface Props {
  obj: SlideObject;
  slideId: string;
}

export function TextFormattingToolbar({ obj, slideId }: Props) {
  const { updateObjectStyle } = useSlidesStore();
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState<'text' | 'bg' | null>(null);
  const [showSpacing, setShowSpacing] = useState(false);
  const [customSize, setCustomSize] = useState('');
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const popoverRef = useRef<HTMLDivElement>(null);

  const update = useCallback((props: Partial<SlideObject>) => {
    updateObjectStyle(slideId, obj.id, props);
  }, [updateObjectStyle, slideId, obj.id]);

  // Close popovers on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowFontPicker(false);
        setShowColorPicker(null);
        setShowSpacing(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const addRecentColor = (color: string) => {
    setRecentColors((prev) => [color, ...prev.filter((c) => c !== color)].slice(0, 8));
  };

  const isBold = obj.fontWeight === 'bold';
  const isItalic = obj.fontStyle === 'italic';
  const isUnderline = obj.textDecoration === 'underline';
  const isStrikethrough = obj.textDecoration === 'line-through';

  const ToggleBtn = ({ active, onClick, children, title }: { active: boolean; onClick: () => void; children: React.ReactNode; title: string }) => (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'p-1.5 rounded transition-colors',
        active ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      {children}
    </button>
  );

  return (
    <div ref={popoverRef} className="flex flex-wrap items-center gap-0.5 p-1.5 bg-card border border-border rounded-lg shadow-sm">
      {/* Font Family */}
      <div className="relative">
        <button
          onClick={() => { setShowFontPicker(!showFontPicker); setShowColorPicker(null); setShowSpacing(false); }}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-muted transition-colors text-foreground max-w-[120px] truncate"
          title="Font family"
        >
          <Type className="w-3 h-3 shrink-0" />
          <span className="truncate">{obj.fontFamily ?? 'Inter'}</span>
        </button>
        {showFontPicker && (
          <div className="absolute top-full left-0 mt-1 w-48 max-h-60 overflow-y-auto bg-popover border border-border rounded-lg shadow-lg z-50">
            {FONT_FAMILIES.map((f) => (
              <button
                key={f}
                onClick={() => { update({ fontFamily: f }); setShowFontPicker(false); }}
                className={cn(
                  'w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors',
                  (obj.fontFamily ?? 'Inter') === f && 'bg-primary/10 text-primary font-medium'
                )}
                style={{ fontFamily: f }}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-border mx-0.5" />

      {/* Font Size */}
      <select
        value={obj.fontSize ?? 22}
        onChange={(e) => update({ fontSize: Number(e.target.value) })}
        className="w-14 px-1 py-1 text-xs rounded border border-border bg-background text-foreground outline-none"
      >
        {FONT_SIZES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <input
        type="number"
        value={customSize}
        placeholder="..."
        min={6}
        max={200}
        onChange={(e) => {
          setCustomSize(e.target.value);
          const v = Number(e.target.value);
          if (v >= 6 && v <= 200) update({ fontSize: v });
        }}
        onBlur={() => setCustomSize('')}
        className="w-10 px-1 py-1 text-xs rounded border border-border bg-background text-foreground outline-none"
        title="Custom size"
      />

      <div className="w-px h-5 bg-border mx-0.5" />

      {/* Bold / Italic / Underline / Strikethrough */}
      <ToggleBtn active={isBold} onClick={() => update({ fontWeight: isBold ? 'normal' : 'bold' })} title="Bold (Ctrl+B)">
        <Bold className="w-3.5 h-3.5" />
      </ToggleBtn>
      <ToggleBtn active={isItalic} onClick={() => update({ fontStyle: isItalic ? 'normal' : 'italic' })} title="Italic (Ctrl+I)">
        <Italic className="w-3.5 h-3.5" />
      </ToggleBtn>
      <ToggleBtn active={isUnderline} onClick={() => update({ textDecoration: isUnderline ? 'none' : 'underline' })} title="Underline (Ctrl+U)">
        <Underline className="w-3.5 h-3.5" />
      </ToggleBtn>
      <ToggleBtn active={isStrikethrough} onClick={() => update({ textDecoration: isStrikethrough ? 'none' : 'line-through' })} title="Strikethrough">
        <Strikethrough className="w-3.5 h-3.5" />
      </ToggleBtn>

      <div className="w-px h-5 bg-border mx-0.5" />

      {/* Text Color */}
      <div className="relative">
        <button
          onClick={() => { setShowColorPicker(showColorPicker === 'text' ? null : 'text'); setShowFontPicker(false); setShowSpacing(false); }}
          title="Text color"
          className="p-1.5 rounded hover:bg-muted transition-colors"
        >
          <div className="w-3.5 h-3.5 flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold leading-none" style={{ color: obj.color ?? '#1a1a2e' }}>A</span>
            <div className="w-3.5 h-0.5 rounded-full mt-px" style={{ backgroundColor: obj.color ?? '#1a1a2e' }} />
          </div>
        </button>
        {showColorPicker === 'text' && (
          <ColorPopover
            color={obj.color ?? '#1a1a2e'}
            recentColors={recentColors}
            onChange={(c) => { update({ color: c }); addRecentColor(c); }}
            onClose={() => setShowColorPicker(null)}
            showTransparent={false}
          />
        )}
      </div>

      {/* Background Color */}
      <div className="relative">
        <button
          onClick={() => { setShowColorPicker(showColorPicker === 'bg' ? null : 'bg'); setShowFontPicker(false); setShowSpacing(false); }}
          title="Highlight color"
          className="p-1.5 rounded hover:bg-muted transition-colors"
        >
          <Palette className="w-3.5 h-3.5" style={{ color: obj.backgroundColor && obj.backgroundColor !== 'transparent' ? obj.backgroundColor : undefined }} />
        </button>
        {showColorPicker === 'bg' && (
          <ColorPopover
            color={obj.backgroundColor ?? 'transparent'}
            recentColors={recentColors}
            onChange={(c) => { update({ backgroundColor: c }); addRecentColor(c); }}
            onClose={() => setShowColorPicker(null)}
            showTransparent
          />
        )}
      </div>

      <div className="w-px h-5 bg-border mx-0.5" />

      {/* Alignment */}
      <ToggleBtn active={obj.align === 'left' || !obj.align} onClick={() => update({ align: 'left' })} title="Align left (Ctrl+L)">
        <AlignLeft className="w-3.5 h-3.5" />
      </ToggleBtn>
      <ToggleBtn active={obj.align === 'center'} onClick={() => update({ align: 'center' })} title="Align center (Ctrl+E)">
        <AlignCenter className="w-3.5 h-3.5" />
      </ToggleBtn>
      <ToggleBtn active={obj.align === 'right'} onClick={() => update({ align: 'right' })} title="Align right (Ctrl+R)">
        <AlignRight className="w-3.5 h-3.5" />
      </ToggleBtn>
      <ToggleBtn active={obj.align === 'justify'} onClick={() => update({ align: 'justify' })} title="Justify">
        <AlignJustify className="w-3.5 h-3.5" />
      </ToggleBtn>

      <div className="w-px h-5 bg-border mx-0.5" />

      {/* Lists */}
      <ToggleBtn active={obj.listStyle === 'bullet'} onClick={() => update({ listStyle: obj.listStyle === 'bullet' ? 'none' : 'bullet' })} title="Bullet list">
        <List className="w-3.5 h-3.5" />
      </ToggleBtn>
      <ToggleBtn active={obj.listStyle === 'numbered'} onClick={() => update({ listStyle: obj.listStyle === 'numbered' ? 'none' : 'numbered' })} title="Numbered list">
        <ListOrdered className="w-3.5 h-3.5" />
      </ToggleBtn>

      <div className="w-px h-5 bg-border mx-0.5" />

      {/* Line Spacing */}
      <div className="relative">
        <button
          onClick={() => { setShowSpacing(!showSpacing); setShowFontPicker(false); setShowColorPicker(null); }}
          className="px-1.5 py-1 text-xs rounded hover:bg-muted transition-colors text-muted-foreground"
          title="Line spacing"
        >
          {obj.lineHeight ?? 1.15}×
        </button>
        {showSpacing && (
          <div className="absolute top-full right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50">
            {LINE_SPACINGS.map((s) => (
              <button
                key={s}
                onClick={() => { update({ lineHeight: s }); setShowSpacing(false); }}
                className={cn(
                  'w-full text-left px-4 py-1.5 text-xs hover:bg-muted transition-colors',
                  (obj.lineHeight ?? 1.15) === s && 'bg-primary/10 text-primary font-medium'
                )}
              >
                {s.toFixed(s % 1 === 0 ? 1 : 2)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ColorPopover({
  color, recentColors, onChange, onClose, showTransparent,
}: {
  color: string;
  recentColors: string[];
  onChange: (c: string) => void;
  onClose: () => void;
  showTransparent: boolean;
}) {
  const [hex, setHex] = useState(color === 'transparent' ? '' : color);

  return (
    <div className="absolute top-full left-0 mt-1 p-2 bg-popover border border-border rounded-lg shadow-lg z-50 w-52">
      {showTransparent && (
        <button
          onClick={() => { onChange('transparent'); onClose(); }}
          className="w-full text-left px-2 py-1 text-xs rounded hover:bg-muted mb-1 text-muted-foreground"
        >
          Transparent
        </button>
      )}
      <div className="grid grid-cols-6 gap-1 mb-2">
        {COLOR_PALETTE.map((c) => (
          <button
            key={c}
            onClick={() => { onChange(c); setHex(c); onClose(); }}
            className={cn(
              'w-6 h-6 rounded border transition-transform hover:scale-110',
              color === c ? 'border-primary ring-1 ring-primary' : 'border-border'
            )}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
      {recentColors.length > 0 && (
        <>
          <p className="text-[10px] text-muted-foreground mb-1">Recent</p>
          <div className="flex gap-1 mb-2">
            {recentColors.map((c) => (
              <button
                key={c}
                onClick={() => { onChange(c); setHex(c); onClose(); }}
                className="w-5 h-5 rounded border border-border hover:scale-110 transition-transform"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </>
      )}
      <div className="flex gap-1">
        <input
          type="color"
          value={hex || '#000000'}
          onChange={(e) => { setHex(e.target.value); onChange(e.target.value); }}
          className="w-7 h-7 rounded border border-border cursor-pointer"
        />
        <input
          type="text"
          value={hex}
          placeholder="#000000"
          onChange={(e) => {
            setHex(e.target.value);
            if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) onChange(e.target.value);
          }}
          className="flex-1 px-2 py-1 text-xs rounded border border-border bg-background text-foreground outline-none"
        />
      </div>
    </div>
  );
}
