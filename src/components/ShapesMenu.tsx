import { useState, useRef, useEffect } from 'react';
import { Shapes } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSlidesStore } from '@/store/useSlidesStore';
import type { ShapeType } from '@/data/slides';

interface ShapeItem { type: ShapeType; label: string; icon: string; }
interface ShapeCategory { name: string; shapes: ShapeItem[]; }

const CATEGORIES: ShapeCategory[] = [
  {
    name: 'Basic Shapes',
    shapes: [
      { type: 'rectangle', label: 'Rectangle', icon: '▬' },
      { type: 'rounded-rectangle', label: 'Rounded Rect', icon: '▢' },
      { type: 'circle', label: 'Circle / Ellipse', icon: '●' },
      { type: 'triangle', label: 'Triangle', icon: '▲' },
      { type: 'diamond', label: 'Diamond', icon: '◆' },
      { type: 'pentagon', label: 'Pentagon', icon: '⬠' },
      { type: 'hexagon', label: 'Hexagon', icon: '⬡' },
      { type: 'octagon', label: 'Octagon', icon: '⯃' },
      { type: 'star', label: 'Star', icon: '★' },
      { type: 'heart', label: 'Heart', icon: '♥' },
      { type: 'cloud', label: 'Cloud', icon: '☁' },
    ],
  },
  {
    name: 'Arrows & Lines',
    shapes: [
      { type: 'arrow-right', label: 'Arrow Right', icon: '→' },
      { type: 'arrow-left', label: 'Arrow Left', icon: '←' },
      { type: 'arrow-up', label: 'Arrow Up', icon: '↑' },
      { type: 'arrow-down', label: 'Arrow Down', icon: '↓' },
      { type: 'double-arrow', label: 'Double Arrow', icon: '↔' },
      { type: 'curved-arrow', label: 'Curved Arrow', icon: '↪' },
      { type: 'line', label: 'Line', icon: '─' },
      { type: 'connector-line', label: 'Connector', icon: '⟶' },
      { type: 'elbow-connector', label: 'Elbow', icon: '⌐' },
    ],
  },
  {
    name: 'Flowchart',
    shapes: [
      { type: 'process', label: 'Process', icon: '▭' },
      { type: 'decision', label: 'Decision', icon: '◇' },
      { type: 'start-end', label: 'Start / End', icon: '⬭' },
      { type: 'document', label: 'Document', icon: '🗎' },
      { type: 'database', label: 'Database', icon: '⛁' },
      { type: 'manual-input', label: 'Manual Input', icon: '⏢' },
    ],
  },
  {
    name: 'Callouts & Banners',
    shapes: [
      { type: 'speech-bubble', label: 'Speech Bubble', icon: '💬' },
      { type: 'thought-bubble', label: 'Thought Bubble', icon: '💭' },
      { type: 'rectangular-callout', label: 'Rect Callout', icon: '🗨' },
      { type: 'banner', label: 'Banner', icon: '🏷' },
      { type: 'ribbon', label: 'Ribbon', icon: '🎀' },
    ],
  },
];

export function ShapesMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const addShape = useSlidesStore((s) => s.addShape);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleInsert = (shapeType: ShapeType) => {
    addShape(shapeType);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md border border-border text-foreground hover:bg-muted transition-colors"
        title="Insert Shape"
      >
        <Shapes className="w-3 h-3" />
        Shapes
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 max-h-[400px] overflow-y-auto bg-popover border border-border rounded-lg shadow-lg z-50">
          {CATEGORIES.map((cat) => (
            <div key={cat.name}>
              <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50 sticky top-0">
                {cat.name}
              </div>
              <div className="grid grid-cols-4 gap-0.5 p-1">
                {cat.shapes.map((s) => (
                  <button
                    key={s.type}
                    onClick={() => handleInsert(s.type)}
                    title={s.label}
                    className={cn(
                      'flex flex-col items-center justify-center p-1.5 rounded text-center',
                      'hover:bg-muted transition-colors'
                    )}
                  >
                    <span className="text-base leading-none">{s.icon}</span>
                    <span className="text-[9px] text-muted-foreground mt-0.5 truncate w-full">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
