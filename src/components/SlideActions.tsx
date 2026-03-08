import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlideActionsProps {
  onAdd: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canDelete: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function SlideActions({
  onAdd, onDelete, onMoveUp, onMoveDown,
  canDelete, canMoveUp, canMoveDown,
}: SlideActionsProps) {
  const btn = (onClick: () => void, disabled: boolean, icon: React.ReactNode, label: string) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors',
        'bg-background border border-border text-foreground',
        'hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed'
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="flex items-center gap-1.5 px-2 py-2 border-b border-border bg-muted/30 flex-wrap">
      {btn(onAdd, false, <Plus className="w-3.5 h-3.5" />, 'New Slide')}
      {btn(onDelete, !canDelete, <Trash2 className="w-3.5 h-3.5" />, 'Delete')}
      {btn(onMoveUp, !canMoveUp, <ChevronUp className="w-3.5 h-3.5" />, 'Up')}
      {btn(onMoveDown, !canMoveDown, <ChevronDown className="w-3.5 h-3.5" />, 'Down')}
    </div>
  );
}
