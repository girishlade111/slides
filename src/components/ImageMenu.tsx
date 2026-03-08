import { useState, useRef, useEffect, useCallback } from 'react';
import { ImageIcon, Upload, Link, Clock, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSlidesStore } from '@/store/useSlidesStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
const RECENT_IMAGES_KEY = 'slideforge_recent_images';

function getRecentImages(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_IMAGES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function addRecentImage(src: string) {
  const recents = getRecentImages().filter((s) => s !== src);
  recents.unshift(src);
  localStorage.setItem(RECENT_IMAGES_KEY, JSON.stringify(recents.slice(0, 10)));
}

export function ImageMenu() {
  const [open, setOpen] = useState(false);
  const [showUrlDialog, setShowUrlDialog] = useState(false);
  const [showRecentsDialog, setShowRecentsDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { slides, currentIndex, addImage } = useSlidesStore();
  const currentSlideId = slides[currentIndex]?.id;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!currentSlideId) return;
    setError(null);
    if (file.size > MAX_FILE_SIZE) {
      setError('File size exceeds 10MB limit');
      return;
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Unsupported file type');
      return;
    }
    setLoading(true);
    try {
      const dataUrl = await readFileAsDataURL(file);
      const { width, height } = await getImageDimensions(dataUrl);
      addImage(currentSlideId, dataUrl, width, height);
      addRecentImage(dataUrl);
      setOpen(false);
    } catch (err) {
      setError('Failed to load image');
    } finally {
      setLoading(false);
    }
  }, [currentSlideId, addImage]);

  const handleUrlInsert = useCallback(async () => {
    if (!currentSlideId || !urlInput.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(urlInput);
      if (!response.ok) throw new Error('Failed to fetch');
      const blob = await response.blob();
      if (blob.size > MAX_FILE_SIZE) throw new Error('Image too large');
      const dataUrl = await blobToDataURL(blob);
      const { width, height } = await getImageDimensions(dataUrl);
      addImage(currentSlideId, dataUrl, width, height);
      addRecentImage(dataUrl);
      setShowUrlDialog(false);
      setUrlInput('');
      setOpen(false);
    } catch (err) {
      setError('Failed to load image from URL. Check CORS or try downloading it first.');
    } finally {
      setLoading(false);
    }
  }, [currentSlideId, urlInput, addImage]);

  const handleRecentClick = useCallback(async (src: string) => {
    if (!currentSlideId) return;
    const { width, height } = await getImageDimensions(src);
    addImage(currentSlideId, src, width, height);
    setShowRecentsDialog(false);
    setOpen(false);
  }, [currentSlideId, addImage]);

  const recents = getRecentImages();

  return (
    <>
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md border border-border text-foreground hover:bg-muted transition-colors"
          title="Insert Image"
        >
          <ImageIcon className="w-3 h-3" />
          Image
        </button>

        {open && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-popover border border-border rounded-lg shadow-lg z-50">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload from Device
            </button>
            <button
              onClick={() => { setShowUrlDialog(true); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors"
            >
              <Link className="w-3.5 h-3.5" />
              Insert from URL
            </button>
            {recents.length > 0 && (
              <button
                onClick={() => { setShowRecentsDialog(true); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors border-t border-border"
              >
                <Clock className="w-3.5 h-3.5" />
                Recent Images ({recents.length})
              </button>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.gif,.svg,.webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
            e.target.value = '';
          }}
        />
      </div>

      {/* URL Dialog */}
      <Dialog open={showUrlDialog} onOpenChange={setShowUrlDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Insert Image from URL</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.png"
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/50"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowUrlDialog(false)}
                className="px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUrlInsert}
                disabled={loading || !urlInput.trim()}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                  'bg-primary text-primary-foreground hover:bg-primary/90',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                Insert
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recents Dialog */}
      <Dialog open={showRecentsDialog} onOpenChange={setShowRecentsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Recent Images</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
            {recents.map((src, i) => (
              <button
                key={i}
                onClick={() => handleRecentClick(src)}
                className="aspect-square rounded border border-border overflow-hidden hover:ring-2 hover:ring-primary transition-all"
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50">
          <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg shadow-lg border border-border">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span className="text-sm">Loading image...</span>
          </div>
        </div>
      )}
    </>
  );
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = src;
  });
}
