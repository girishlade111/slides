import { Plus, Trash2 } from 'lucide-react';
import type { SlideData } from '@/data/slides';
import { cn } from '@/lib/utils';

interface SlideEditorProps {
  slide: SlideData;
  onUpdateText: (objectId: string, text: string) => void;
  onAddBody: () => void;
  onDeleteObject: (objectId: string) => void;
}

const typeLabels: Record<string, string> = {
  title: 'Title',
  subtitle: 'Subtitle',
  body: 'Body',
};

export function SlideEditor({ slide, onUpdateText, onAddBody, onDeleteObject }: SlideEditorProps) {
  return (
    <div className="w-72 h-full bg-muted/30 border-l border-border p-4 flex flex-col gap-3 overflow-y-auto">
      <h2 className="text-sm font-semibold text-foreground">Edit Slide</h2>

      {slide.objects.map((obj) => (
        <div key={obj.id} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">
              {typeLabels[obj.type] || obj.type}
            </label>
            {slide.objects.length > 1 && (
              <button
                onClick={() => onDeleteObject(obj.id)}
                title="Remove"
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
          {obj.type === 'title' ? (
            <input
              type="text"
              value={obj.text}
              onChange={(e) => onUpdateText(obj.id, e.target.value)}
              placeholder="Slide title"
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/50"
            />
          ) : (
            <textarea
              value={obj.text}
              onChange={(e) => onUpdateText(obj.id, e.target.value)}
              placeholder={`${typeLabels[obj.type] || 'Text'}...`}
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          )}
        </div>
      ))}

      <button
        onClick={onAddBody}
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors',
          'border border-dashed border-border text-muted-foreground',
          'hover:border-primary hover:text-primary'
        )}
      >
        <Plus className="w-3.5 h-3.5" />
        Add Body Text
      </button>

      <p className="text-xs text-muted-foreground mt-auto">
        Changes update the preview in real time.
      </p>
    </div>
  );
}
