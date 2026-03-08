import type { SlideData } from '@/data/slides';
import { cn } from '@/lib/utils';

interface SlideListProps {
  slides: SlideData[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

export function SlideList({ slides, currentIndex, onSelect }: SlideListProps) {
  return (
    <nav className="w-60 h-full bg-muted/50 border-r border-border overflow-y-auto py-3 px-2 flex flex-col gap-1">
      {slides.map((slide, index) => (
        <button
          key={slide.id}
          onClick={() => onSelect(index)}
          className={cn(
            'w-full text-left px-3 py-2.5 rounded-lg flex items-start gap-3 transition-colors',
            index === currentIndex
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted text-foreground'
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
