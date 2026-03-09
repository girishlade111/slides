import { useState, useEffect } from 'react';
import { X, Plus, Palette } from 'lucide-react';
import { BUILTIN_THEMES, loadCustomThemes, saveCustomThemes, type SlideTheme } from '@/data/themes';
import { ThemeCard } from '@/components/ThemeCard';
import { ThemeEditor } from '@/components/ThemeEditor';
import { useSlidesStore } from '@/store/useSlidesStore';
import { createObject, type SlideData } from '@/data/slides';

interface ThemesPanelProps {
  open: boolean;
  onClose: () => void;
}

function applyThemeToSlide(slide: SlideData, theme: SlideTheme): SlideData {
  return {
    ...slide,
    background: { type: 'color', color: theme.colors.background },
    objects: slide.objects.map(obj => {
      if (obj.type === 'title' || obj.type === 'subtitle') {
        return { ...obj, color: theme.colors.textPrimary, fontFamily: theme.fonts.heading };
      }
      if (obj.type === 'body') {
        return { ...obj, color: theme.colors.textPrimary, fontFamily: theme.fonts.body };
      }
      if (obj.type === 'shape') {
        return { ...obj, fill: theme.colors.accent, stroke: theme.colors.primary };
      }
      return obj;
    }),
  };
}

function createTemplateSlides(theme: SlideTheme): SlideData[] {
  const bg = { type: 'color' as const, color: theme.colors.background };
  return [
    {
      id: crypto.randomUUID(),
      name: 'Title Slide',
      background: bg,
      objects: [
        createObject('title', 'Presentation Title', { color: theme.colors.textPrimary, fontFamily: theme.fonts.heading, x: 60, y: 180, width: 840, height: 100, fontSize: 52, align: 'center' }),
        createObject('subtitle', 'Your subtitle goes here', { color: theme.colors.textSecondary, fontFamily: theme.fonts.body, x: 160, y: 300, width: 640, height: 50, fontSize: 24, align: 'center' }),
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Agenda',
      background: bg,
      objects: [
        createObject('title', 'Agenda', { color: theme.colors.textPrimary, fontFamily: theme.fonts.heading }),
        createObject('body', '• Item One\n• Item Two\n• Item Three\n• Item Four\n• Item Five', {
          color: theme.colors.textPrimary, fontFamily: theme.fonts.body, lineHeight: 1.8, listStyle: 'bullet',
        }),
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Content',
      background: bg,
      objects: [
        createObject('title', 'Content Title', { color: theme.colors.textPrimary, fontFamily: theme.fonts.heading }),
        createObject('body', 'Add your main content here. This layout provides space for text and supporting visuals.', {
          color: theme.colors.textPrimary, fontFamily: theme.fonts.body, x: 60, y: 160, width: 480, height: 260,
        }),
        createObject('shape', '', {
          shapeType: 'rectangle', x: 560, y: 160, width: 340, height: 260,
          fill: theme.colors.surface, stroke: theme.colors.accent, strokeWidth: 2,
        }),
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Two Columns',
      background: bg,
      objects: [
        createObject('title', 'Two Column Layout', { color: theme.colors.textPrimary, fontFamily: theme.fonts.heading }),
        createObject('body', 'Left column content goes here with supporting details.', {
          color: theme.colors.textPrimary, fontFamily: theme.fonts.body, x: 60, y: 160, width: 400, height: 260,
        }),
        createObject('body', 'Right column content goes here with additional information.', {
          color: theme.colors.textPrimary, fontFamily: theme.fonts.body, x: 500, y: 160, width: 400, height: 260,
        }),
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Thank You',
      background: bg,
      objects: [
        createObject('title', 'Thank You!', { color: theme.colors.textPrimary, fontFamily: theme.fonts.heading, x: 60, y: 180, width: 840, height: 100, fontSize: 52, align: 'center' }),
        createObject('subtitle', 'Questions & Discussion', { color: theme.colors.accent, fontFamily: theme.fonts.body, x: 160, y: 300, width: 640, height: 50, fontSize: 24, align: 'center' }),
      ],
    },
  ];
}

export function ThemesPanel({ open, onClose }: ThemesPanelProps) {
  const [customThemes, setCustomThemes] = useState<SlideTheme[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [tab, setTab] = useState<'builtin' | 'custom'>('builtin');

  const { slides, currentIndex, setSlides } = useSlidesStore();
  const currentSlide = slides[currentIndex];

  useEffect(() => {
    setCustomThemes(loadCustomThemes());
  }, [open]);

  if (!open) return null;

  const handleApply = (theme: SlideTheme) => {
    if (!currentSlide) return;
    const updated = slides.map(s => s.id === currentSlide.id ? applyThemeToSlide(s, theme) : s);
    setSlides(updated);
  };

  const handleApplyAll = (theme: SlideTheme) => {
    setSlides(slides.map(s => applyThemeToSlide(s, theme)));
  };

  const handleCreateSlides = (theme: SlideTheme) => {
    const templateSlides = createTemplateSlides(theme);
    setSlides([...slides, ...templateSlides]);
  };

  const handleSaveCustom = (theme: SlideTheme) => {
    const existing = customThemes.findIndex(t => t.id === theme.id);
    let updated: SlideTheme[];
    if (existing >= 0) {
      updated = customThemes.map(t => t.id === theme.id ? theme : t);
    } else {
      updated = [...customThemes, { ...theme, builtin: false }];
    }
    setCustomThemes(updated);
    saveCustomThemes(updated);
    setShowEditor(false);
  };

  const handleDeleteCustom = (themeId: string) => {
    const updated = customThemes.filter(t => t.id !== themeId);
    setCustomThemes(updated);
    saveCustomThemes(updated);
  };

  const themes = tab === 'builtin' ? BUILTIN_THEMES : customThemes;

  return (
    <div className="fixed right-0 top-0 bottom-0 w-80 bg-background border-l border-border shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Themes</h2>
        </div>
        <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => { setTab('builtin'); setShowEditor(false); }}
          className={`flex-1 text-xs py-2 font-medium transition-colors ${tab === 'builtin' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Built-in ({BUILTIN_THEMES.length})
        </button>
        <button
          onClick={() => { setTab('custom'); setShowEditor(false); }}
          className={`flex-1 text-xs py-2 font-medium transition-colors ${tab === 'custom' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Custom ({customThemes.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {showEditor ? (
          <ThemeEditor
            onSave={handleSaveCustom}
            onCancel={() => setShowEditor(false)}
          />
        ) : (
          <div className="space-y-3">
            {tab === 'custom' && (
              <button
                onClick={() => setShowEditor(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-md border-2 border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Create Custom Theme
              </button>
            )}
            {themes.length === 0 && tab === 'custom' && !showEditor && (
              <p className="text-xs text-muted-foreground text-center py-8">
                No custom themes yet. Create one to get started!
              </p>
            )}
            {themes.map(theme => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                onApply={handleApply}
                onApplyAll={handleApplyAll}
                onCreateSlides={handleCreateSlides}
                onDelete={!theme.builtin ? handleDeleteCustom : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
