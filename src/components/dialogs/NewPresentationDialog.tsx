import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSlidesStore } from '@/store/useSlidesStore';
import { cn } from '@/lib/utils';

interface NewPresentationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewPresentationDialog({ open, onOpenChange }: NewPresentationDialogProps) {
  const { newPresentation } = useSlidesStore();
  const [name, setName] = useState('Untitled Presentation');

  const handleCreate = () => {
    if (!name.trim()) return;
    newPresentation(name.trim());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>New Presentation</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-foreground">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            autoFocus
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/50"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!name.trim()}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
            >
              Create
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
