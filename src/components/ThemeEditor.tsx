import { useState } from 'react';
import type { SlideTheme } from '@/data/themes';
import { createDefaultTheme } from '@/data/themes';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

interface ThemeEditorProps {
  onSave: (theme: SlideTheme) => void;
  onCancel: () => void;
  initial?: SlideTheme;
}

const COLOR_FIELDS: { key: keyof SlideTheme['colors']; label: string }[] = [
  { key: 'background', label: 'Background' },
  { key: 'surface', label: 'Surface' },
  { key: 'primary', label: 'Primary' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'accent', label: 'Accent' },
  { key: 'textPrimary', label: 'Text Primary' },
  { key: 'textSecondary', label: 'Text Secondary' },
];

const FONT_OPTIONS = [
  'Inter', 'Arial', 'Georgia', 'Times New Roman', 'Courier New',
  'Verdana', 'Helvetica', 'Trebuchet MS', 'Palatino', 'Garamond',
];

export function ThemeEditor({ onSave, onCancel, initial }: ThemeEditorProps) {
  const [theme, setTheme] = useState<SlideTheme>(initial ?? createDefaultTheme());

  const updateColor = (key: keyof SlideTheme['colors'], value: string) => {
    setTheme(t => ({ ...t, colors: { ...t.colors, [key]: value } }));
  };

  const updateFont = (key: 'heading' | 'body', value: string) => {
    setTheme(t => ({ ...t, fonts: { ...t.fonts, [key]: value } }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          {initial ? 'Edit Theme' : 'Create Custom Theme'}
        </h3>
        <button onClick={onCancel} className="p-1 text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Theme Name</label>
        <Input
          value={theme.name}
          onChange={e => setTheme(t => ({ ...t, name: e.target.value }))}
          className="h-8 text-xs"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-2 block">Colors</label>
        <div className="grid grid-cols-2 gap-2">
          {COLOR_FIELDS.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-2">
              <input
                type="color"
                value={theme.colors[key]}
                onChange={e => updateColor(key, e.target.value)}
                className="w-6 h-6 rounded border border-border cursor-pointer"
              />
              <span className="text-[10px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-2 block">Fonts</label>
        <div className="space-y-2">
          <div>
            <span className="text-[10px] text-muted-foreground">Heading</span>
            <select
              value={theme.fonts.heading}
              onChange={e => updateFont('heading', e.target.value)}
              className="w-full h-7 text-xs rounded border border-border bg-background text-foreground px-2 mt-0.5"
            >
              {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground">Body</span>
            <select
              value={theme.fonts.body}
              onChange={e => updateFont('body', e.target.value)}
              className="w-full h-7 text-xs rounded border border-border bg-background text-foreground px-2 mt-0.5"
            >
              {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Preview</label>
        <div
          className="h-20 rounded-lg flex items-center justify-center p-3"
          style={{ background: theme.colors.background }}
        >
          <div className="text-center">
            <div style={{ color: theme.colors.textPrimary, fontFamily: theme.fonts.heading, fontSize: 14, fontWeight: 600 }}>
              Heading Text
            </div>
            <div style={{ color: theme.colors.textSecondary, fontFamily: theme.fonts.body, fontSize: 11 }}>
              Body text preview
            </div>
            <div className="flex gap-1 justify-center mt-1">
              <div className="w-8 h-3 rounded" style={{ background: theme.colors.accent }} />
              <div className="w-8 h-3 rounded" style={{ background: theme.colors.surface }} />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => onSave(theme)}
        className="w-full py-2 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        {initial ? 'Update Theme' : 'Save Theme'}
      </button>
    </div>
  );
}
