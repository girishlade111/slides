import { useState, useRef, useEffect } from 'react';
import { Plus, Copy, Trash2, ChevronUp, ChevronDown, Clipboard, Files } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { SlideData } from '@/data/slides';
import { getSlideName } from '@/data/slides';
import { useSlidesStore } from '@/store/useSlidesStore';
import { cn } from '@/lib/utils';
import { SlideThumbnailPreview } from './SlideThumbnailPreview';

export function SlideSidebar() {
  const {
    slides, currentIndex, setCurrentIndex,
    addSlideAfter, duplicateSlide, deleteSlideById,
    moveSlideUp, moveSlideDown, reorderSlides,
    copySlide, pasteSlide, clipboardSlide,
  } = useSlidesStore();

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; slideId: string; index: number } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = slides.findIndex((s) => s.id === active.id);
    const newIndex = slides.findIndex((s) => s.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      reorderSlides(oldIndex, newIndex);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, slideId: string, index: number) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, slideId, index });
  };

  // Close context menu on click anywhere
  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [contextMenu]);

  return (
    <div className="w-60 flex flex-col border-r border-border bg-muted/20 h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Slides</span>
        <button
          onClick={() => addSlideAfter(currentIndex)}
          title="Add Slide"
          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Slide list with dnd */}
      <div className="flex-1 overflow-y-auto py-2 px-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={slides.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            {slides.map((slide, index) => (
              <SortableSlideItem
                key={slide.id}
                slide={slide}
                index={index}
                isActive={index === currentIndex}
                onClick={() => setCurrentIndex(index)}
                onContextMenu={(e) => handleContextMenu(e, slide.id, index)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <SlideContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          slideId={contextMenu.slideId}
          index={contextMenu.index}
          totalSlides={slides.length}
          hasClipboard={!!clipboardSlide}
          onNewSlide={() => addSlideAfter(contextMenu.index)}
          onDuplicate={() => duplicateSlide(contextMenu.slideId)}
          onDelete={() => deleteSlideById(contextMenu.slideId)}
          onMoveUp={moveSlideUp}
          onMoveDown={moveSlideDown}
          onCopy={() => copySlide(contextMenu.slideId)}
          onPaste={() => pasteSlide(contextMenu.index)}
        />
      )}
    </div>
  );
}

// ── Sortable slide item ──

interface SortableSlideItemProps {
  slide: SlideData;
  index: number;
  isActive: boolean;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

function SortableSlideItem({ slide, index, isActive, onClick, onContextMenu }: SortableSlideItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={cn(
        'relative mb-2 rounded-lg cursor-pointer transition-all group',
        'border-2',
        isActive
          ? 'border-primary ring-1 ring-primary/30 scale-[1.02]'
          : 'border-transparent hover:border-border',
        isDragging && 'opacity-50 z-50'
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-background rounded-md overflow-hidden">
        <SlideThumbnailPreview slide={slide} />

        {/* Slide number overlay */}
        <div className={cn(
          'absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-bold',
          isActive ? 'bg-primary text-primary-foreground' : 'bg-background/80 text-muted-foreground'
        )}>
          {index + 1}
        </div>
      </div>

      {/* Name */}
      <p className={cn(
        'text-[11px] font-medium truncate px-1 py-1',
        isActive ? 'text-foreground' : 'text-muted-foreground'
      )}>
        {getSlideName(slide)}
      </p>
    </div>
  );
}

// ── Context menu ──

interface SlideContextMenuProps {
  x: number;
  y: number;
  slideId: string;
  index: number;
  totalSlides: number;
  hasClipboard: boolean;
  onNewSlide: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onCopy: () => void;
  onPaste: () => void;
}

function SlideContextMenu({
  x, y, index, totalSlides, hasClipboard,
  onNewSlide, onDuplicate, onDelete, onMoveUp, onMoveDown, onCopy, onPaste,
}: SlideContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Adjust position to stay in viewport
  const [pos, setPos] = useState({ x, y });
  useEffect(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const nx = x + rect.width > window.innerWidth ? x - rect.width : x;
    const ny = y + rect.height > window.innerHeight ? y - rect.height : y;
    setPos({ x: Math.max(0, nx), y: Math.max(0, ny) });
  }, [x, y]);

  const item = (icon: React.ReactNode, label: string, action: () => void, disabled = false) => (
    <button
      onClick={(e) => { e.stopPropagation(); action(); }}
      disabled={disabled}
      className={cn(
        'flex items-center gap-2 w-full px-3 py-1.5 text-sm text-foreground rounded-md transition-colors',
        disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-muted'
      )}
    >
      <span className="w-4 h-4 flex items-center justify-center text-muted-foreground">{icon}</span>
      {label}
    </button>
  );

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] bg-popover border border-border rounded-lg shadow-lg py-1 px-1 min-w-[180px]"
      style={{ left: pos.x, top: pos.y }}
      onClick={(e) => e.stopPropagation()}
    >
      {item(<Plus className="w-3.5 h-3.5" />, 'New Slide', onNewSlide)}
      {item(<Files className="w-3.5 h-3.5" />, 'Duplicate Slide', onDuplicate)}
      <div className="my-1 border-t border-border" />
      {item(<Copy className="w-3.5 h-3.5" />, 'Copy Slide', onCopy)}
      {item(<Clipboard className="w-3.5 h-3.5" />, 'Paste Slide', onPaste, !hasClipboard)}
      <div className="my-1 border-t border-border" />
      {item(<ChevronUp className="w-3.5 h-3.5" />, 'Move Up', onMoveUp, index === 0)}
      {item(<ChevronDown className="w-3.5 h-3.5" />, 'Move Down', onMoveDown, index >= totalSlides - 1)}
      <div className="my-1 border-t border-border" />
      {item(<Trash2 className="w-3.5 h-3.5" />, 'Delete Slide', onDelete, totalSlides <= 1)}
    </div>
  );
}
