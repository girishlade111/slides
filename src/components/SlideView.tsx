import type { SlideData } from '@/data/slides';

interface SlideViewProps {
  slide: SlideData;
}

export function SlideView({ slide }: SlideViewProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-8 py-12 text-center">
      <h1 className="text-4xl font-bold text-foreground mb-6">{slide.title}</h1>
      <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
        {slide.content}
      </p>
    </div>
  );
}
