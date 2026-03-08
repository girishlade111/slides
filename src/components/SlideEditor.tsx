import { Plus, Trash2, Square, CircleIcon } from 'lucide-react';
import type { SlideObject } from '@/data/slides';
import { cn } from '@/lib/utils';
import { useSlidesStore } from '@/store/useSlidesStore';

const typeLabels: Record<string, string> = {
  title: 'Title',
  subtitle: 'Subtitle',
  body: 'Body',
  shape: 'Shape',
};

export function SlideEditor() {
  const { slides, currentIndex, selectedObjectId, addBodyObject, addShape } = useSlidesStore();
  const slide = slides[currentIndex];
  if (!slide) return null;

  const selectedObj = selectedObjectId ? slide.objects.find((o) => o.id === selectedObjectId) : null;

  return (
    <div className="w-72 h-full bg-muted/30 border-l border-border p-4 flex flex-col gap-3 overflow-y-auto">
      <h2 className="text-sm font-semibold text-foreground">
        {selectedObj ? `Edit ${typeLabels[selectedObj.type] || 'Object'}` : 'Properties'}
      </h2>

      {selectedObj ? (
        <SelectedObjectEditor obj={selectedObj} slideId={slide.id} />
      ) : (
        <p className="text-xs text-muted-foreground">Click an object on the canvas to edit it.</p>
      )}

      <div className="mt-auto flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground">Insert</p>
        <button
          onClick={() => addBodyObject(slide.id)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors',
            'border border-dashed border-border text-muted-foreground',
            'hover:border-primary hover:text-primary'
          )}
        >
          <Plus className="w-3.5 h-3.5" />
          Body Text
        </button>
        <button
          onClick={() => addShape('rectangle')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors',
            'border border-dashed border-border text-muted-foreground',
            'hover:border-primary hover:text-primary'
          )}
        >
          <Square className="w-3.5 h-3.5" />
          Rectangle
        </button>
        <button
          onClick={() => addShape('circle')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors',
            'border border-dashed border-border text-muted-foreground',
            'hover:border-primary hover:text-primary'
          )}
        >
          <CircleIcon className="w-3.5 h-3.5" />
          Circle
        </button>
      </div>
    </div>
  );
}

function SelectedObjectEditor({ obj, slideId }: { obj: SlideObject; slideId: string }) {
  const { updateObjectText, updateObjectStyle, deleteObject } = useSlidesStore();
  const slide = useSlidesStore((s) => s.slides.find((sl) => sl.id === slideId));

  const isText = obj.type !== 'shape';
  const isShape = obj.type === 'shape';

  return (
    <div className="flex flex-col gap-3">
      {/* Text editing (for text objects only) */}
      {isText && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Text</label>
          {obj.type === 'title' ? (
            <input
              type="text"
              value={obj.text}
              onChange={(e) => updateObjectText(slideId, obj.id, e.target.value)}
              placeholder="Slide title"
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/50"
            />
          ) : (
            <textarea
              value={obj.text}
              onChange={(e) => updateObjectText(slideId, obj.id, e.target.value)}
              placeholder="Text..."
              rows={4}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          )}
        </div>
      )}

      {/* Font Size (text only) */}
      {isText && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Font Size</label>
          <input
            type="number"
            value={obj.fontSize ?? 22}
            min={10}
            max={120}
            onChange={(e) => updateObjectStyle(slideId, obj.id, { fontSize: Number(e.target.value) })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      )}

      {/* Align (text only) */}
      {isText && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Align</label>
          <div className="flex gap-1">
            {(['left', 'center', 'right'] as const).map((a) => (
              <button
                key={a}
                onClick={() => updateObjectStyle(slideId, obj.id, { align: a })}
                className={cn(
                  'flex-1 px-2 py-1.5 text-xs rounded-md border transition-colors capitalize',
                  (obj.align ?? 'left') === a
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:bg-muted'
                )}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Shape properties */}
      {isShape && (
        <>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Shape</label>
            <span className="text-sm text-foreground capitalize">{obj.shapeType}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Fill Color</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={obj.fill ?? '#3b82f6'}
                onChange={(e) => updateObjectStyle(slideId, obj.id, { fill: e.target.value })}
                className="w-8 h-8 rounded border border-border cursor-pointer"
              />
              <input
                type="text"
                value={obj.fill ?? '#3b82f6'}
                onChange={(e) => updateObjectStyle(slideId, obj.id, { fill: e.target.value })}
                className="flex-1 px-2 py-1.5 text-xs rounded-md border border-border bg-background text-foreground outline-none"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Stroke Color</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={obj.stroke ?? '#1e40af'}
                onChange={(e) => updateObjectStyle(slideId, obj.id, { stroke: e.target.value })}
                className="w-8 h-8 rounded border border-border cursor-pointer"
              />
              <input
                type="text"
                value={obj.stroke ?? '#1e40af'}
                onChange={(e) => updateObjectStyle(slideId, obj.id, { stroke: e.target.value })}
                className="flex-1 px-2 py-1.5 text-xs rounded-md border border-border bg-background text-foreground outline-none"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Stroke Width</label>
            <input
              type="number"
              value={obj.strokeWidth ?? 2}
              min={0}
              max={20}
              onChange={(e) => updateObjectStyle(slideId, obj.id, { strokeWidth: Number(e.target.value) })}
              className="w-full px-2 py-1.5 text-xs rounded-md border border-border bg-background text-foreground outline-none"
            />
          </div>
        </>
      )}

      {/* Position */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">X</label>
          <input
            type="number"
            value={Math.round(obj.x)}
            onChange={(e) => updateObjectStyle(slideId, obj.id, { x: Number(e.target.value) })}
            className="w-full px-2 py-1.5 text-xs rounded-md border border-border bg-background text-foreground outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Y</label>
          <input
            type="number"
            value={Math.round(obj.y)}
            onChange={(e) => updateObjectStyle(slideId, obj.id, { y: Number(e.target.value) })}
            className="w-full px-2 py-1.5 text-xs rounded-md border border-border bg-background text-foreground outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Width</label>
          <input
            type="number"
            value={Math.round(obj.width)}
            onChange={(e) => updateObjectStyle(slideId, obj.id, { width: Number(e.target.value) })}
            className="w-full px-2 py-1.5 text-xs rounded-md border border-border bg-background text-foreground outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Height</label>
          <input
            type="number"
            value={Math.round(obj.height)}
            onChange={(e) => updateObjectStyle(slideId, obj.id, { height: Number(e.target.value) })}
            className="w-full px-2 py-1.5 text-xs rounded-md border border-border bg-background text-foreground outline-none"
          />
        </div>
      </div>

      {/* Delete */}
      {slide && slide.objects.length > 1 && (
        <button
          onClick={() => deleteObject(slideId, obj.id)}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          Delete Object
        </button>
      )}
    </div>
  );
}
