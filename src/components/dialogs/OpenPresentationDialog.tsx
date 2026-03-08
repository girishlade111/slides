import { useState } from 'react';
import { Search, FolderOpen, Trash2, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSlidesStore } from '@/store/useSlidesStore';
import type { PresentationMeta } from '@/lib/storage';

interface OpenPresentationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OpenPresentationDialog({ open, onOpenChange }: OpenPresentationDialogProps) {
  const { listSavedPresentations, openPresentation, deleteSavedPresentation } = useSlidesStore();
  const [search, setSearch] = useState('');
  const [presentations, setPresentations] = useState<PresentationMeta[]>([]);

  // Refresh list when dialog opens
  const handleOpenChange = (o: boolean) => {
    if (o) setPresentations(listSavedPresentations());
    onOpenChange(o);
  };

  const filtered = presentations.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpen = (id: string) => {
    openPresentation(id);
    onOpenChange(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    deleteSavedPresentation(id);
    setPresentations((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Open Presentation</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search presentations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 min-h-[200px]">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
              <FileText className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-sm">{presentations.length === 0 ? 'No saved presentations yet.' : 'No matches found.'}</p>
            </div>
          ) : (
            filtered.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
              >
                <div className="w-16 h-10 rounded bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.slideCount} slide{p.slideCount !== 1 ? 's' : ''} · Modified {new Date(p.modifiedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpen(p.id)}
                    className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
