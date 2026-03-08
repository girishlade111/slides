import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSlidesStore } from '@/store/useSlidesStore';
import { cn } from '@/lib/utils';

interface PresentationSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const slideSizes = ['16:9', '4:3', 'custom'] as const;

export function PresentationSettingsDialog({ open, onOpenChange }: PresentationSettingsDialogProps) {
  const { presentationMeta, updatePresentationMeta, slides } = useSlidesStore();

  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [slideSize, setSlideSize] = useState<'16:9' | '4:3' | 'custom'>('16:9');

  useEffect(() => {
    if (open && presentationMeta) {
      setName(presentationMeta.name);
      setAuthor(presentationMeta.author);
      setSlideSize(presentationMeta.slideSize);
    }
  }, [open, presentationMeta]);

  const handleSave = () => {
    updatePresentationMeta({ name: name.trim() || 'Untitled', author: author.trim(), slideSize });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Presentation Settings</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Presentation Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Author</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Slide Size</label>
            <div className="flex gap-1">
              {slideSizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSlideSize(s)}
                  className={cn(
                    'flex-1 px-2 py-1.5 text-xs rounded-md border transition-colors',
                    slideSize === s
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:bg-muted'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {presentationMeta && (
            <div className="flex flex-col gap-1 text-xs text-muted-foreground border-t border-border pt-3">
              <p>Slides: {slides.length}</p>
              <p>Created: {new Date(presentationMeta.createdAt).toLocaleString()}</p>
              <p>Modified: {new Date(presentationMeta.modifiedAt).toLocaleString()}</p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
