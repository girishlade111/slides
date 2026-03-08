export interface SlideObject {
  id: string;
  type: 'title' | 'subtitle' | 'body' | 'shape';
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontFamily?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  color?: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  backgroundColor?: string;
  lineHeight?: number;
  listStyle?: 'none' | 'bullet' | 'numbered';
  rotation?: number;
  // Shape-specific
  shapeType?: 'rectangle' | 'circle';
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface SlideData {
  id: string;
  name: string;
  objects: SlideObject[];
}

export function getSlideName(slide: SlideData): string {
  return slide.name || slide.objects.find((o) => o.type === 'title')?.text || 'Untitled';
}

const defaults: Record<string, Partial<SlideObject>> = {
  title: { x: 60, y: 40, width: 840, height: 80, fontSize: 44, align: 'center' },
  subtitle: { x: 60, y: 130, width: 840, height: 50, fontSize: 28, align: 'center' },
  body: { x: 60, y: 200, width: 840, height: 260, fontSize: 22, align: 'left' },
  shape: { x: 200, y: 200, width: 200, height: 150, fill: '#3b82f6', stroke: '#1e40af', strokeWidth: 2 },
};

export function createObject(
  type: SlideObject['type'],
  text: string,
  overrides?: Partial<SlideObject>
): SlideObject {
  const d = defaults[type] ?? defaults.body;
  return {
    id: crypto.randomUUID(),
    type,
    text,
    x: d.x!,
    y: d.y!,
    width: d.width!,
    height: d.height!,
    fontSize: d.fontSize,
    align: d.align as SlideObject['align'],
    fill: d.fill,
    stroke: d.stroke,
    strokeWidth: d.strokeWidth,
    ...overrides,
  };
}

export const slides: SlideData[] = [
  {
    id: '1',
    name: 'Welcome to Lade Slides',
    objects: [
      createObject('title', 'Welcome to Lade Slides'),
      createObject('body', 'A simple, clean presentation viewer built with React and TypeScript. Use the buttons below or arrow keys to navigate.'),
    ],
  },
  {
    id: '2',
    name: 'Why Lade Slides?',
    objects: [
      createObject('title', 'Why Lade Slides?'),
      createObject('body', 'Presentations should be easy to build and pleasant to view. Lade Slides focuses on simplicity and clarity above all else.'),
    ],
  },
  {
    id: '3',
    name: 'Keyboard Navigation',
    objects: [
      createObject('title', 'Keyboard Navigation'),
      createObject('body', "Press the Right Arrow key to go forward and the Left Arrow key to go back. It's that simple."),
    ],
  },
  {
    id: '4',
    name: 'Built with Modern Tools',
    objects: [
      createObject('title', 'Built with Modern Tools'),
      createObject('body', 'This app is powered by Vite, React 18, TypeScript, and Tailwind CSS — a fast, type-safe, and beautiful stack.'),
    ],
  },
  {
    id: '5',
    name: "What's Next?",
    objects: [
      createObject('title', "What's Next?"),
      createObject('body', 'Future versions will add themes, canvas rendering, and export to PDF and PowerPoint. Stay tuned!'),
    ],
  },
];
