export interface MasterPlaceholder {
  id: string;
  type: 'title' | 'content' | 'subtitle' | 'footer' | 'number' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  defaultText: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  align: 'left' | 'center' | 'right';
}

export interface MasterLayout {
  id: string;
  name: string;
  placeholders: MasterPlaceholder[];
  background: {
    type: 'color' | 'gradient';
    value: string;
    gradientFrom?: string;
    gradientTo?: string;
    gradientDirection?: string;
  };
}

export interface MasterSlide {
  id: string;
  name: string;
  layouts: MasterLayout[];
}

export type MasterLayoutName =
  | 'Title Slide'
  | 'Title and Content'
  | 'Section Header'
  | 'Two Content'
  | 'Comparison'
  | 'Blank'
  | 'Title Only'
  | 'Content with Caption'
  | 'Picture with Caption';

function ph(
  type: MasterPlaceholder['type'],
  x: number, y: number, w: number, h: number,
  defaultText: string,
  fontSize = 32,
  align: MasterPlaceholder['align'] = 'left',
  color = '#333333',
  fontFamily = 'Inter'
): MasterPlaceholder {
  return {
    id: crypto.randomUUID(),
    type, x, y, width: w, height: h,
    defaultText, fontSize, fontFamily, color, align,
  };
}

export function createBuiltInLayouts(): MasterLayout[] {
  return [
    {
      id: crypto.randomUUID(),
      name: 'Title Slide',
      background: { type: 'color', value: '#ffffff' },
      placeholders: [
        ph('title', 240, 280, 1440, 140, 'Click to add title', 60, 'center'),
        ph('subtitle', 360, 440, 1200, 80, 'Click to add subtitle', 28, 'center', '#666666'),
        ph('footer', 100, 980, 600, 40, 'Author • Date', 18, 'left', '#999999'),
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Title and Content',
      background: { type: 'color', value: '#ffffff' },
      placeholders: [
        ph('title', 100, 40, 1720, 100, 'Click to add title', 44, 'left'),
        ph('content', 100, 170, 1720, 800, 'Click to add content', 24, 'left', '#444444'),
        ph('number', 1800, 1020, 80, 40, '#', 16, 'right', '#999999'),
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Section Header',
      background: { type: 'color', value: '#1a2332' },
      placeholders: [
        ph('title', 200, 360, 1520, 140, 'Section Title', 60, 'center', '#ffffff'),
        ph('subtitle', 400, 520, 1120, 80, 'Optional subtitle', 24, 'center', '#aaaaaa'),
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Two Content',
      background: { type: 'color', value: '#ffffff' },
      placeholders: [
        ph('title', 100, 40, 1720, 100, 'Click to add title', 44, 'left'),
        ph('content', 100, 170, 830, 800, 'Left content', 24, 'left', '#444444'),
        ph('content', 990, 170, 830, 800, 'Right content', 24, 'left', '#444444'),
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Comparison',
      background: { type: 'color', value: '#ffffff' },
      placeholders: [
        ph('title', 100, 40, 1720, 100, 'Comparison Title', 44, 'left'),
        ph('subtitle', 100, 150, 830, 60, 'Column A', 28, 'center', '#20B2AA'),
        ph('content', 100, 220, 830, 750, 'Content A', 24, 'left', '#444444'),
        ph('subtitle', 990, 150, 830, 60, 'Column B', 28, 'center', '#20B2AA'),
        ph('content', 990, 220, 830, 750, 'Content B', 24, 'left', '#444444'),
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Blank',
      background: { type: 'color', value: '#ffffff' },
      placeholders: [],
    },
    {
      id: crypto.randomUUID(),
      name: 'Title Only',
      background: { type: 'color', value: '#ffffff' },
      placeholders: [
        ph('title', 100, 40, 1720, 100, 'Click to add title', 44, 'left'),
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Content with Caption',
      background: { type: 'color', value: '#ffffff' },
      placeholders: [
        ph('title', 100, 40, 1720, 100, 'Title', 44, 'left'),
        ph('content', 100, 170, 1060, 800, 'Main content area', 24, 'left', '#444444'),
        ph('content', 1220, 170, 600, 800, 'Caption text', 20, 'left', '#666666'),
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Picture with Caption',
      background: { type: 'color', value: '#ffffff' },
      placeholders: [
        ph('title', 100, 40, 1720, 100, 'Title', 44, 'left'),
        ph('image', 100, 170, 1720, 640, 'Click to add image', 24, 'center', '#999999'),
        ph('content', 100, 840, 1720, 140, 'Add caption here', 20, 'center', '#666666'),
      ],
    },
  ];
}

export function createDefaultMasterSlide(): MasterSlide {
  return {
    id: crypto.randomUUID(),
    name: 'Default Master',
    layouts: createBuiltInLayouts(),
  };
}
