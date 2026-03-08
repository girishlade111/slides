import { useState } from 'react';
import type { SlideData } from '@/data/slides';
import { cn } from '@/lib/utils';

interface SlideListProps {
  slides: SlideData[];
  currentIndex: number;
  onSelect: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function SlideList({ slides, currentIndex, onSelect, onReorder }: SlideListProps) {
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragFrom(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(index);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (!isNaN(fromIndex) && fromIndex !== toIndex) {
      onReorder(fromIndex, toIndex);
    }
    setDragFrom(null);
    setDragOver(null);
  };

  const handleDragEnd = () => {
    setDragFrom(null);
    setDragOver(null);
  };

  return (
    <nav className="flex-1 bg-muted/50 overflow-y-auto py-3 px-2 flex flex-col gap-1">
      {slides.map((slide, index) => (
        <button
          key={slide.id}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={() => setDragOver(null)}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          onClick={() => onSelect(index)}
          className={cn(
            'w-full text-left px-3 py-2.5 rounded-lg flex items-start gap-3 transition-colors',
            index === currentIndex
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted text-foreground',
            dragFrom === index && 'opacity-40',
            dragOver === index && dragFrom !== index && 'ring-2 ring-primary ring-offset-1'
          )}
        >
          <span className={cn(
            'text-xs font-bold mt-0.5 shrink-0',
            index === currentIndex ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}>
            {index + 1}
          </span>
          <span className="text-sm font-medium truncate">{slide.title}</span>
        </button>
      ))}
    </nav>
  );
}
