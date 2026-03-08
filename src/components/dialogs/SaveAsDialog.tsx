import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSlidesStore } from '@/store/useSlidesStore';

interface SaveAsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaveAsDialog({ open, onOpenChange }: SaveAsDialogProps) {
  const { saveAs, presentationMeta } = useSlidesStore();
  const [name, setName] = useState('');

  const handleOpenChange = (o: boolean) => {
    if (o) setName(presentationMeta?.name ? `${presentationMeta.name} (Copy)` : 'Untitled Presentation');
    onOpenChange(o);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    saveAs(name.trim());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Save As</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-foreground">Presentation Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
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
              onClick={handleSave}
              disabled={!name.trim()}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
