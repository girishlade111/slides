import type { SlideTheme } from '@/data/themes';
import { Trash2 } from 'lucide-react';

interface ThemeCardProps {
  theme: SlideTheme;
  onApply: (theme: SlideTheme) => void;
  onApplyAll: (theme: SlideTheme) => void;
  onCreateSlides: (theme: SlideTheme) => void;
  onDelete?: (themeId: string) => void;
}

export function ThemeCard({ theme, onApply, onApplyAll, onCreateSlides, onDelete }: ThemeCardProps) {
  const { colors } = theme;

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      {/* Theme preview */}
      <div
        className="h-24 relative flex items-center justify-center p-3"
        style={{ background: colors.background }}
      >
        <div className="w-full max-w-[180px]">
          <div
            className="h-2 rounded-full mb-1.5"
            style={{ background: colors.primary, width: '70%' }}
          />
          <div
            className="h-1.5 rounded-full mb-1"
            style={{ background: colors.textSecondary, width: '90%' }}
          />
          <div
            className="h-1.5 rounded-full mb-2"
            style={{ background: colors.textSecondary, width: '60%' }}
          />
          <div className="flex gap-1">
            <div
              className="h-6 flex-1 rounded"
              style={{ background: colors.surface }}
            />
            <div
              className="h-6 flex-1 rounded"
              style={{ background: colors.accent }}
            />
          </div>
        </div>
        {/* Color swatches */}
        <div className="absolute bottom-1.5 right-1.5 flex gap-0.5">
          {[colors.primary, colors.accent, colors.surface].map((c, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full border border-white/30"
              style={{ background: c }}
            />
          ))}
        </div>
      </div>

      <div className="p-2.5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-foreground truncate">{theme.name}</span>
          {!theme.builtin && onDelete && (
            <button
              onClick={() => onDelete(theme.id)}
              className="p-0.5 text-muted-foreground hover:text-destructive transition-colors"
              title="Delete theme"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onApply(theme)}
            className="flex-1 text-[10px] px-1.5 py-1 rounded border border-border text-foreground hover:bg-muted transition-colors"
          >
            This Slide
          </button>
          <button
            onClick={() => onApplyAll(theme)}
            className="flex-1 text-[10px] px-1.5 py-1 rounded border border-border text-foreground hover:bg-muted transition-colors"
          >
            All Slides
          </button>
          <button
            onClick={() => onCreateSlides(theme)}
            className="flex-1 text-[10px] px-1.5 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Template
          </button>
        </div>
      </div>
    </div>
  );
}
