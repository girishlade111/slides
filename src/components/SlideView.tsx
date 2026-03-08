import type { SlideData } from '@/data/slides';
import { cn } from '@/lib/utils';

interface SlideViewProps {
  slide: SlideData;
}

export function SlideView({ slide }: SlideViewProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-8 py-12 text-center gap-4">
      {slide.objects.map((obj) => {
        switch (obj.type) {
          case 'title':
            return (
              <h1 key={obj.id} className="text-4xl font-bold text-foreground">
                {obj.text || <span className="text-muted-foreground/40 italic">Untitled</span>}
              </h1>
            );
          case 'subtitle':
            return (
              <h2 key={obj.id} className="text-2xl font-medium text-muted-foreground">
                {obj.text || <span className="text-muted-foreground/40 italic">Subtitle</span>}
              </h2>
            );
          case 'body':
            return (
              <p key={obj.id} className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                {obj.text || <span className="text-muted-foreground/40 italic">Body text</span>}
              </p>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
