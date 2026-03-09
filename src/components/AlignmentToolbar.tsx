import {
  AlignHorizontalJustifyStart, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd,
  AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd,
  AlignHorizontalSpaceAround, AlignVerticalSpaceAround,
  MoveHorizontal, MoveVertical,
  ArrowUpToLine, ArrowDownToLine, ChevronUp, ChevronDown,
  Copy,
} from 'lucide-react';
import { useSlidesStore } from '@/store/useSlidesStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

function ToolBtn({ icon: Icon, label, onClick, disabled }: {
  icon: React.ElementType; label: string; onClick: () => void; disabled?: boolean;
}) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            disabled={disabled}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Icon className="w-4 h-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function AlignmentToolbar() {
  const { slides, currentIndex, selectedObjectIds, selectedObjectId } = useSlidesStore();
  const slide = slides[currentIndex];
  if (!slide) return null;

  const ids = selectedObjectIds.length > 0 ? selectedObjectIds : selectedObjectId ? [selectedObjectId] : [];
  if (ids.length === 0) return null;

  const slideId = slide.id;
  const multi = ids.length >= 2;
  const hasSelection = ids.length >= 1;

  const align = (type: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom') =>
    useSlidesStore.getState().alignObjects(slideId, ids, type);
  const distribute = (type: 'horizontal' | 'vertical') =>
    useSlidesStore.getState().distributeObjects(slideId, ids, type);
  const matchSize = (dim: 'width' | 'height' | 'both') =>
    useSlidesStore.getState().matchObjectSize(slideId, ids, dim);
  const reorder = (dir: 'front' | 'back' | 'forward' | 'backward') => {
    ids.forEach(id => useSlidesStore.getState().reorderObject(slideId, id, dir));
  };

  return (
    <div className="flex items-center gap-0.5 px-2 py-1 border-b border-border bg-muted/20">
      {/* Align group */}
      <span className="text-[10px] text-muted-foreground mr-1 uppercase tracking-wider">Align</span>
      <ToolBtn icon={AlignHorizontalJustifyStart} label="Align Left (Ctrl+Shift+L)" onClick={() => align('left')} disabled={!multi} />
      <ToolBtn icon={AlignHorizontalJustifyCenter} label="Align Center H (Ctrl+Shift+E)" onClick={() => align('center-h')} disabled={!multi} />
      <ToolBtn icon={AlignHorizontalJustifyEnd} label="Align Right (Ctrl+Shift+R)" onClick={() => align('right')} disabled={!multi} />
      <ToolBtn icon={AlignVerticalJustifyStart} label="Align Top (Ctrl+Shift+T)" onClick={() => align('top')} disabled={!multi} />
      <ToolBtn icon={AlignVerticalJustifyCenter} label="Align Middle V (Ctrl+Shift+M)" onClick={() => align('center-v')} disabled={!multi} />
      <ToolBtn icon={AlignVerticalJustifyEnd} label="Align Bottom (Ctrl+Shift+B)" onClick={() => align('bottom')} disabled={!multi} />

      <Separator orientation="vertical" className="h-5 mx-1" />

      {/* Distribute */}
      <span className="text-[10px] text-muted-foreground mr-1 uppercase tracking-wider">Distribute</span>
      <ToolBtn icon={AlignHorizontalSpaceAround} label="Distribute Horizontally" onClick={() => distribute('horizontal')} disabled={ids.length < 3} />
      <ToolBtn icon={AlignVerticalSpaceAround} label="Distribute Vertically" onClick={() => distribute('vertical')} disabled={ids.length < 3} />

      <Separator orientation="vertical" className="h-5 mx-1" />

      {/* Size */}
      <span className="text-[10px] text-muted-foreground mr-1 uppercase tracking-wider">Size</span>
      <ToolBtn icon={MoveHorizontal} label="Match Width" onClick={() => matchSize('width')} disabled={!multi} />
      <ToolBtn icon={MoveVertical} label="Match Height" onClick={() => matchSize('height')} disabled={!multi} />
      <ToolBtn icon={Copy} label="Match Both" onClick={() => matchSize('both')} disabled={!multi} />

      <Separator orientation="vertical" className="h-5 mx-1" />

      {/* Arrange */}
      <span className="text-[10px] text-muted-foreground mr-1 uppercase tracking-wider">Arrange</span>
      <ToolBtn icon={ArrowUpToLine} label="Bring to Front" onClick={() => reorder('front')} disabled={!hasSelection} />
      <ToolBtn icon={ChevronUp} label="Bring Forward (Ctrl+Shift+])" onClick={() => reorder('forward')} disabled={!hasSelection} />
      <ToolBtn icon={ChevronDown} label="Send Backward (Ctrl+Shift+[)" onClick={() => reorder('backward')} disabled={!hasSelection} />
      <ToolBtn icon={ArrowDownToLine} label="Send to Back" onClick={() => reorder('back')} disabled={!hasSelection} />
    </div>
  );
}
