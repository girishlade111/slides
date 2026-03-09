export interface GradientDef {
  stops: { color: string; position: number }[];
  angle: number;
}

export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
}

export interface ThemeFonts {
  heading: string;
  body: string;
}

export interface SlideTheme {
  id: string;
  name: string;
  builtin: boolean;
  colors: ThemeColors;
  fonts: ThemeFonts;
  gradients: {
    primary: GradientDef;
    secondary: GradientDef;
  };
}

export const BUILTIN_THEMES: SlideTheme[] = [
  {
    id: 'modern-dark',
    name: 'Modern Dark',
    builtin: true,
    colors: {
      background: '#1a1a2e',
      surface: '#16213e',
      primary: '#0f3460',
      secondary: '#533483',
      accent: '#00d2ff',
      textPrimary: '#e0e0e0',
      textSecondary: '#a0a0b0',
    },
    fonts: { heading: 'Inter', body: 'Inter' },
    gradients: {
      primary: { stops: [{ color: '#1a1a2e', position: 0 }, { color: '#16213e', position: 100 }], angle: 135 },
      secondary: { stops: [{ color: '#0f3460', position: 0 }, { color: '#533483', position: 100 }], angle: 45 },
    },
  },
  {
    id: 'professional-light',
    name: 'Professional Light',
    builtin: true,
    colors: {
      background: '#ffffff',
      surface: '#f8f9fa',
      primary: '#2c3e50',
      secondary: '#34495e',
      accent: '#1abc9c',
      textPrimary: '#2c3e50',
      textSecondary: '#7f8c8d',
    },
    fonts: { heading: 'Inter', body: 'Inter' },
    gradients: {
      primary: { stops: [{ color: '#ffffff', position: 0 }, { color: '#f8f9fa', position: 100 }], angle: 180 },
      secondary: { stops: [{ color: '#1abc9c', position: 0 }, { color: '#16a085', position: 100 }], angle: 135 },
    },
  },
  {
    id: 'vibrant-gradient',
    name: 'Vibrant Gradient',
    builtin: true,
    colors: {
      background: '#667eea',
      surface: '#764ba2',
      primary: '#667eea',
      secondary: '#764ba2',
      accent: '#f093fb',
      textPrimary: '#ffffff',
      textSecondary: '#e0d0f0',
    },
    fonts: { heading: 'Inter', body: 'Inter' },
    gradients: {
      primary: { stops: [{ color: '#667eea', position: 0 }, { color: '#764ba2', position: 100 }], angle: 135 },
      secondary: { stops: [{ color: '#f093fb', position: 0 }, { color: '#f5576c', position: 100 }], angle: 45 },
    },
  },
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    builtin: true,
    colors: {
      background: '#ffffff',
      surface: '#e8f0fe',
      primary: '#003366',
      secondary: '#004488',
      accent: '#4a90d9',
      textPrimary: '#1a1a1a',
      textSecondary: '#555555',
    },
    fonts: { heading: 'Inter', body: 'Inter' },
    gradients: {
      primary: { stops: [{ color: '#003366', position: 0 }, { color: '#004488', position: 100 }], angle: 135 },
      secondary: { stops: [{ color: '#4a90d9', position: 0 }, { color: '#357abd', position: 100 }], angle: 90 },
    },
  },
  {
    id: 'minimal-white',
    name: 'Minimal White',
    builtin: true,
    colors: {
      background: '#ffffff',
      surface: '#fafafa',
      primary: '#111111',
      secondary: '#333333',
      accent: '#000000',
      textPrimary: '#111111',
      textSecondary: '#888888',
    },
    fonts: { heading: 'Inter', body: 'Inter' },
    gradients: {
      primary: { stops: [{ color: '#ffffff', position: 0 }, { color: '#f5f5f5', position: 100 }], angle: 180 },
      secondary: { stops: [{ color: '#111111', position: 0 }, { color: '#333333', position: 100 }], angle: 135 },
    },
  },
  {
    id: 'nature-green',
    name: 'Nature Green',
    builtin: true,
    colors: {
      background: '#f0f7f0',
      surface: '#e8f5e9',
      primary: '#2e7d32',
      secondary: '#388e3c',
      accent: '#66bb6a',
      textPrimary: '#1b5e20',
      textSecondary: '#4a7c4f',
    },
    fonts: { heading: 'Inter', body: 'Inter' },
    gradients: {
      primary: { stops: [{ color: '#2e7d32', position: 0 }, { color: '#1b5e20', position: 100 }], angle: 135 },
      secondary: { stops: [{ color: '#66bb6a', position: 0 }, { color: '#43a047', position: 100 }], angle: 45 },
    },
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    builtin: true,
    colors: {
      background: '#fff8f0',
      surface: '#fff3e0',
      primary: '#e65100',
      secondary: '#ef6c00',
      accent: '#ffb74d',
      textPrimary: '#3e2723',
      textSecondary: '#6d4c41',
    },
    fonts: { heading: 'Inter', body: 'Inter' },
    gradients: {
      primary: { stops: [{ color: '#e65100', position: 0 }, { color: '#ff8f00', position: 100 }], angle: 135 },
      secondary: { stops: [{ color: '#ffb74d', position: 0 }, { color: '#ffa726', position: 100 }], angle: 45 },
    },
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    builtin: true,
    colors: {
      background: '#0d1b2a',
      surface: '#1b2838',
      primary: '#1b4965',
      secondary: '#2a6f97',
      accent: '#61dafb',
      textPrimary: '#e0f0ff',
      textSecondary: '#a8d0e6',
    },
    fonts: { heading: 'Inter', body: 'Inter' },
    gradients: {
      primary: { stops: [{ color: '#0d1b2a', position: 0 }, { color: '#1b4965', position: 100 }], angle: 135 },
      secondary: { stops: [{ color: '#61dafb', position: 0 }, { color: '#2a6f97', position: 100 }], angle: 45 },
    },
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    builtin: true,
    colors: {
      background: '#1a0a2e',
      surface: '#2d1b4e',
      primary: '#6a0dad',
      secondary: '#8e24aa',
      accent: '#ffd700',
      textPrimary: '#f0e6ff',
      textSecondary: '#c9a0dc',
    },
    fonts: { heading: 'Inter', body: 'Inter' },
    gradients: {
      primary: { stops: [{ color: '#1a0a2e', position: 0 }, { color: '#6a0dad', position: 100 }], angle: 135 },
      secondary: { stops: [{ color: '#ffd700', position: 0 }, { color: '#ffab00', position: 100 }], angle: 45 },
    },
  },
  {
    id: 'tech-gray',
    name: 'Tech Gray',
    builtin: true,
    colors: {
      background: '#1e1e1e',
      surface: '#2d2d2d',
      primary: '#3c3c3c',
      secondary: '#505050',
      accent: '#c0c0c0',
      textPrimary: '#e0e0e0',
      textSecondary: '#a0a0a0',
    },
    fonts: { heading: 'Inter', body: 'Inter' },
    gradients: {
      primary: { stops: [{ color: '#1e1e1e', position: 0 }, { color: '#2d2d2d', position: 100 }], angle: 135 },
      secondary: { stops: [{ color: '#c0c0c0', position: 0 }, { color: '#808080', position: 100 }], angle: 45 },
    },
  },
];

const CUSTOM_THEMES_KEY = 'lade-custom-themes';

export function loadCustomThemes(): SlideTheme[] {
  try {
    const raw = localStorage.getItem(CUSTOM_THEMES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveCustomThemes(themes: SlideTheme[]) {
  localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(themes));
}

export function createDefaultTheme(): SlideTheme {
  return {
    id: crypto.randomUUID(),
    name: 'My Custom Theme',
    builtin: false,
    colors: {
      background: '#ffffff',
      surface: '#f5f5f5',
      primary: '#333333',
      secondary: '#666666',
      accent: '#2196f3',
      textPrimary: '#111111',
      textSecondary: '#666666',
    },
    fonts: { heading: 'Inter', body: 'Inter' },
    gradients: {
      primary: { stops: [{ color: '#333333', position: 0 }, { color: '#666666', position: 100 }], angle: 135 },
      secondary: { stops: [{ color: '#2196f3', position: 0 }, { color: '#1976d2', position: 100 }], angle: 45 },
    },
  };
}
