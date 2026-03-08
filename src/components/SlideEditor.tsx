import { Plus, Trash2, Square, CircleIcon } from 'lucide-react';
import type { SlideObject } from '@/data/slides';
import { cn } from '@/lib/utils';
import { useSlidesStore } from '@/store/useSlidesStore';
import { ShapePropertiesPanel } from '@/components/ShapePropertiesPanel';

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
        selectedObj.type === 'shape' ? (
          <ShapePropertiesPanel obj={selectedObj} slideId={slide.id} />
        ) : (
          <SelectedObjectEditor obj={selectedObj} slideId={slide.id} />
        )
      ) : (
        <p className="text-xs text-muted-foreground">Click an object on the canvas to edit it.</p>
      )}

      <div className="mt-auto flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground">Quick Insert</p>
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

  return (
    <div className="flex flex-col gap-3">
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

      {/* Position */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'X', key: 'x', value: obj.x },
          { label: 'Y', key: 'y', value: obj.y },
          { label: 'Width', key: 'width', value: obj.width },
          { label: 'Height', key: 'height', value: obj.height },
        ].map(({ label, key, value }) => (
          <div key={key} className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">{label}</label>
            <input
              type="number"
              value={Math.round(value)}
              onChange={(e) => updateObjectStyle(slideId, obj.id, { [key]: Number(e.target.value) })}
              className="w-full px-2 py-1.5 text-xs rounded-md border border-border bg-background text-foreground outline-none"
            />
          </div>
        ))}
      </div>

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
