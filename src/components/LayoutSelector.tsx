import React from 'react';
import { cn } from '@/lib/utils';
import { useMasterSlideStore } from '@/store/masterSlideStore';
import { usePresentationStore } from '@/store/presentationStore';
import type { MasterLayout, MasterPlaceholder } from '@/store/masterSlideTypes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SplitSquareHorizontal, ChevronDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const PLACEHOLDER_COLORS: Record<MasterPlaceholder['type'], string> = {
  title: 'hsl(174, 80%, 41%)',
  content: 'hsl(217, 91%, 60%)',
  subtitle: 'hsl(262, 83%, 58%)',
  footer: 'hsl(25, 95%, 53%)',
  number: 'hsl(0, 84%, 60%)',
  image: 'hsl(142, 71%, 45%)',
};

export function LayoutSelector() {
  const masterStore = useMasterSlideStore();
  const presStore = usePresentationStore();
  const master = masterStore.getActiveMaster();

  if (!master) return null;

  const handleApplyLayout = (layout: MasterLayout) => {
    const currentSlide = presStore.presentation.slides[presStore.currentSlideIndex];
    if (!currentSlide) return;

    const objects = masterStore.generateObjectsFromLayout(layout.id);

    presStore.updateSlide(currentSlide.id, {
      objects,
      background: {
        type: layout.background.type,
        value: layout.background.value,
        gradientFrom: layout.background.gradientFrom,
        gradientTo: layout.background.gradientTo,
        gradientDirection: layout.background.gradientDirection,
      },
    });

    toast({ title: `Applied "${layout.name}" layout` });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-[#f0f0f0] text-[11px] text-[#444] font-medium">
          <SplitSquareHorizontal className="w-4 h-4" strokeWidth={1.5} />
          Layout
          <ChevronDown className="w-3 h-3 text-[#999]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[420px] p-3">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
          Apply Layout to Current Slide
        </div>
        <div className="grid grid-cols-3 gap-2">
          {master.layouts.map((layout) => (
            <button
              key={layout.id}
              onClick={() => handleApplyLayout(layout)}
              className="rounded-lg border border-border p-1.5 hover:ring-2 hover:ring-primary/30 transition-all text-left"
            >
              {/* Mini preview */}
              <div
                className="w-full aspect-video rounded border border-border/50 mb-1 relative overflow-hidden"
                style={{ backgroundColor: layout.background.value }}
              >
                {layout.placeholders.map((p) => (
                  <div
                    key={p.id}
                    className="absolute border border-dashed rounded-sm"
                    style={{
                      left: `${(p.x / 1920) * 100}%`,
                      top: `${(p.y / 1080) * 100}%`,
                      width: `${(p.width / 1920) * 100}%`,
                      height: `${(p.height / 1080) * 100}%`,
                      borderColor: PLACEHOLDER_COLORS[p.type],
                      backgroundColor: `${PLACEHOLDER_COLORS[p.type]}15`,
                    }}
                  />
                ))}
              </div>
              <span className="text-[10px] font-medium text-foreground leading-tight block">{layout.name}</span>
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
