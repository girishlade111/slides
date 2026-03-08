import type { SlideData } from '@/data/slides';

interface SlideEditorProps {
  slide: SlideData;
  onChange: (updates: Partial<Pick<SlideData, 'title' | 'content'>>) => void;
}

export function SlideEditor({ slide, onChange }: SlideEditorProps) {
  return (
    <div className="w-72 h-full bg-muted/30 border-l border-border p-4 flex flex-col gap-4 overflow-y-auto">
      <h2 className="text-sm font-semibold text-foreground">Edit Slide</h2>
      
      <div className="flex flex-col gap-1.5">
        <label htmlFor="slide-title" className="text-xs font-medium text-muted-foreground">
          Title
        </label>
        <input
          id="slide-title"
          type="text"
          value={slide.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="flex flex-col gap-1.5 flex-1">
        <label htmlFor="slide-content" className="text-xs font-medium text-muted-foreground">
          Content
        </label>
        <textarea
          id="slide-content"
          value={slide.content}
          onChange={(e) => onChange({ content: e.target.value })}
          className="w-full flex-1 min-h-[120px] px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Changes save automatically. The sidebar and preview update in real time.
      </p>
    </div>
  );
}
